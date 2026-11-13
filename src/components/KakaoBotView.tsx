import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Copy,
  Check,
  AlertTriangle,
  Send,
  Sparkles,
  HelpCircle,
  Info,
  ShieldAlert,
  Code2,
  ChevronDown,
  ChevronUp,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  rawJson?: any;
}

export const KakaoBotView: React.FC = () => {
  const KAKAO_RAG_TEXT =
    'SMP(계통한계가격)는 전력거래소에서 1시간 단위로 결정되는 전력 도매가격(원/kWh)이다. 공급예비율은 (공급예비력/전력수요)×100으로 계산하며 10% 이상이어야 정상 수급 상태다. REC는 신재생에너지 1MWh 발전 시 발급되는 공급인증서다.';

  // Exact public Skill URL for Kakao i Open Builder
  const EXACT_PUBLIC_SKILL_URL =
    'https://ais-pre-sgrhtzkucdadu3q6bbtpco-411085539725.asia-east1.run.app/api/kakao-bot';

  const [copied, setCopied] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showJsonInspector, setShowJsonInspector] = useState<boolean>(false);
  const [lastRawJson, setLastRawJson] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: '안녕하세요! 전력시장 핵심 용어 챗봇입니다.\n\n아래 3가지 질문에 대해 답변해 드립니다:\n1. SMP(계통한계가격)\n2. 공급예비율\n3. REC(신재생에너지공급인증서)\n\n궁금하신 내용을 물어보세요!',
      time: '지금',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(EXACT_PUBLIC_SKILL_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || isLoading) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: message,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send Kakao i Open Builder payload format
      const res = await fetch('/api/kakao-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRequest: {
            utterance: message,
            user: { id: 'web_simulator_user' },
          },
        }),
      });

      const data = await res.json();
      setLastRawJson(data);

      const botText =
        data.template?.outputs?.[0]?.simpleText?.text ||
        data.reply ||
        '자료에 없는 내용이에요';

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: botText,
        time: timeStr,
        rawJson: data,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: '자료에 없는 내용이에요',
        time: timeStr,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in">
      {/* 1. Header Card with RAG Source Material */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FEE500] text-[#191919] flex items-center justify-center font-black shadow-xs">
              <MessageCircle className="w-6 h-6 fill-current stroke-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                  전력시장용어 카카오톡 지식베이스 챗봇
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FEE500] text-[#191919] border border-[#FAD700]">
                  지식베이스 기반 시스템 메시지 적용
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                카카오톡 챗봇 지식베이스(Knowledge Base)에 등록된 내용만을 바탕으로 답변하도록 시스템 지시문이 설정되었습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              지식베이스 기반 스킬 활성화
            </span>
          </div>
        </div>

        {/* System Message & Knowledge Base Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#FF6B00]" />
              적용된 챗봇 시스템 메시지 (System Instruction)
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              지식베이스 외 질문 완전 차단
            </span>
          </div>

          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-mono leading-relaxed space-y-2">
            <div className="text-amber-400 font-bold">[시스템 지시문]</div>
            <p className="text-slate-300">
              &quot;너는 카카오톡 챗봇의 [지식베이스]를 기반으로만 답변하는 도우미 챗봇이다.<br />
              1. 반드시 [지식베이스]에 기록된 사실만을 근거로 답변하라.<br />
              2. [지식베이스]에 명시되지 않은 내용(예: 날씨, 주식, 다른 상식 등)에 대해서는 다른 설명을 덧붙이지 말고 반드시 정확히 <strong className="text-amber-300">&apos;자료에 없는 내용이에요&apos;</strong>라고만 답변하라.<br />
              3. 카카오톡 메신저 화면에서 읽기 편하도록 1~3문장 이내로 핵심만 간결하고 명확하게 답변하라.&quot;
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">기본 장착된 지식베이스 원문</span>
              <span className="text-[11px] text-slate-500">{KAKAO_RAG_TEXT.length}자</span>
            </div>
            <p className="text-slate-800 font-mono text-[11px] bg-slate-50 p-2 rounded">
              &quot;{KAKAO_RAG_TEXT}&quot;
            </p>
            <p className="text-[11px] text-slate-500 pt-1">
              ※ 카카오 오픈빌더 블록 파라미터(<code className="font-mono">knowledge</code> 등)로 지식을 넘겨받으면 실시간으로 해당 지식베이스를 동적 교체하여 답변합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 2. 404 Error Solution Guide Banner */}
      <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 sm:p-6 text-rose-900 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <h3 className="font-extrabold text-base text-rose-900">
            [404 NOT_FOUND 오류 해결] 첨부하신 화면의 오류 원인과 조치 방법
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-1.5">
            <span className="font-bold text-rose-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[11px] font-black">1</span>
              URL 뒷부분 누락 (.app 및 /api/kakao-bot)
            </span>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              스크린샷 1번을 보시면 URL 끝이 <code className="bg-rose-50 text-rose-700 px-1 py-0.5 rounded font-mono font-bold">.asia-east1.run</code>까지만 입력되어 있습니다.<br />
              올바른 주소는 끝에 반드시 <code className="bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded font-mono font-bold">.app/api/kakao-bot</code>까지 모두 포함되어야 합니다.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-1.5">
            <span className="font-bold text-rose-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[11px] font-black">2</span>
              AI Studio [공유(Share)] 배포 필요
            </span>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              카카오톡 외부 서버가 접속할 수 있는 공용 URL(<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">ais-pre-...</code>)은 화면 우측 상단의 <strong className="text-[#0F172A]">[공유(Share)]</strong> 버튼을 한 번 눌러 배포를 활성화해야 외부에서 접근할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 3. KakaoTalk Chatbot Skill URL Banner (Kakao Yellow) */}
      <div className="bg-gradient-to-r from-[#FEE500] to-[#FDD835] rounded-2xl p-5 sm:p-6 shadow-xs text-[#191919] border border-[#FAD700]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#191919] text-[#FEE500]">
                정확한 카카오톡 스킬 URL
              </span>
              <span className="text-xs font-bold text-[#3C1E1E]">아래 [URL 복사] 버튼을 눌러 붙여넣으세요</span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#191919]">
              카카오 i 오픈빌더 스킬 서버 주소 (POST)
            </h3>
            <p className="text-xs text-[#3C1E1E]/80">
              글자가 잘리지 않도록 아래 버튼을 클릭하여 복사한 뒤, 오픈빌더 URL 칸에 전체를 붙여넣으세요.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex-1 lg:flex-initial flex items-center bg-white/95 rounded-xl border border-black/10 px-3.5 py-2.5 text-xs font-mono text-[#0F172A] shadow-xs overflow-hidden">
              <span className="truncate max-w-[280px] sm:max-w-[450px] select-all font-bold">
                {EXACT_PUBLIC_SKILL_URL}
              </span>
            </div>

            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-[#191919] text-white hover:bg-black transition-all shadow-xs flex-shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>URL 전체 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4-Step Kakao OpenBuilder Setup Guide */}
        <div className="mt-4 pt-4 border-t border-black/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/80 p-3 rounded-xl border border-black/5">
            <span className="font-black text-[#191919] block mb-1">1단계: 오픈빌더 접속</span>
            <span className="text-[#3C1E1E] text-[11px] leading-relaxed">
              카카오 i 오픈빌더(i.kakao.com) 로그인 후 [스킬 목록]으로 이동합니다.
            </span>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-black/5">
            <span className="font-black text-[#191919] block mb-1">2단계: 스킬 URL 붙여넣기</span>
            <span className="text-[#3C1E1E] text-[11px] leading-relaxed">
              위의 [URL 전체 복사]를 눌러 <code className="font-mono font-bold">/api/kakao-bot</code>까지 온전히 입력합니다.
            </span>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-black/5">
            <span className="font-black text-[#191919] block mb-1">3단계: AI Studio 공유</span>
            <span className="text-[#3C1E1E] text-[11px] leading-relaxed">
              AI Studio 상단의 [공유]를 눌러 외부 접근을 활성화합니다.
            </span>
          </div>
          <div className="bg-white/80 p-3 rounded-xl border border-black/5">
            <span className="font-black text-[#191919] block mb-1">4단계: 테스트 & 배포</span>
            <span className="text-[#3C1E1E] text-[11px] leading-relaxed">
              [스킬 서버 테스트]를 누르면 HTTP 200 정상 응답을 확인하고 배포할 수 있습니다.
            </span>
          </div>
        </div>
      </div>

      {/* 4. KakaoTalk Simulator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: KakaoTalk Mobile Phone Frame Simulator */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[600px]">
            {/* Kakao Chat Room Top Header */}
            <div className="bg-[#A0B4C8] px-4 py-3 flex items-center justify-between text-white border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center font-black text-xs shadow-xs">
                  ⚡
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
                    전력시장용어 도우미
                    <span className="text-[10px] font-semibold bg-white/70 text-slate-700 px-1.5 py-0.2 rounded">
                      카톡 연동 테스트
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600">RAG 기반 실시간 답변</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-700 font-semibold bg-white/40 px-2.5 py-1 rounded-full">
                카카오 i 스킬 규격 v2.0
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 bg-[#BACEE0] p-4 overflow-y-auto space-y-3.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-1.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center font-black text-[11px] flex-shrink-0 mb-1">
                      ⚡
                    </div>
                  )}

                  {msg.sender === 'user' && (
                    <span className="text-[10px] text-slate-500 font-medium tabular-nums pb-0.5">
                      {msg.time}
                    </span>
                  )}

                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#FEE500] text-[#191919] rounded-br-xs font-medium'
                        : 'bg-white text-slate-900 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.sender === 'bot' && (
                    <span className="text-[10px] text-slate-500 font-medium tabular-nums pb-0.5">
                      {msg.time}
                    </span>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/80 w-fit px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-[#FEE500] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#FEE500] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#FEE500] animate-bounce [animation-delay:0.4s]" />
                  <span>카카오톡 챗봇 응답 생성 중...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Pills (카카오톡 퀵 리플라이 버튼) */}
            <div className="bg-[#BACEE0] px-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSendMessage('SMP가 뭐야?')}
                className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-[11px] font-semibold text-slate-800 shadow-2xs whitespace-nowrap transition-all border border-slate-300/60"
              >
                SMP란?
              </button>
              <button
                onClick={() => handleSendMessage('공급예비율 공식 알려줘')}
                className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-[11px] font-semibold text-slate-800 shadow-2xs whitespace-nowrap transition-all border border-slate-300/60"
              >
                공급예비율 계산법
              </button>
              <button
                onClick={() => handleSendMessage('REC가 뭐야?')}
                className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-[11px] font-semibold text-slate-800 shadow-2xs whitespace-nowrap transition-all border border-slate-300/60"
              >
                REC란?
              </button>
              <button
                onClick={() => handleSendMessage('오늘 날씨 어때?')}
                className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold shadow-2xs whitespace-nowrap transition-all border border-rose-200"
                title="자료에 없는 내용 테스트"
              >
                자료 외 질문 테스트 (날씨)
              </button>
            </div>

            {/* Bottom Input Area */}
            <div className="bg-white p-3 border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="카카오톡 챗봇에게 전력시장 용어 질문하기..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#FEE500] focus:ring-1 focus:ring-[#FEE500]"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-bold disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                title="전송"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Technical Inspector & Response Schema */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Verification checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="font-bold text-sm text-[#0F172A] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              챗봇 동작 및 규칙 검증
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">1. SMP(계통한계가격) 질문 시</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    &apos;전력거래소에서 1시간 단위로 결정되는 전력 도매가격(원/kWh)&apos;을 정확히 안내합니다.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">2. 공급예비율 질문 시</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    &apos;(공급예비력/전력수요)×100으로 계산하며 10% 이상이어야 정상 수급 상태&apos;임을 안내합니다.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">3. REC 질문 시</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    &apos;신재생에너지 1MWh 발전 시 발급되는 공급인증서&apos;임을 안내합니다.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900">4. 자료에 없는 질문 시</span>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    주식, 날씨, 다른 일반 상식 등 자료에 없는 질문에는 정확히{' '}
                    <strong>&quot;자료에 없는 내용이에요&quot;</strong>로만 단답합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Live JSON Response Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-600" />
                <h4 className="font-bold text-sm text-[#0F172A]">카카오 오픈빌더 규격 검사기</h4>
              </div>
              <button
                onClick={() => setShowJsonInspector(!showJsonInspector)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
              >
                <span>{showJsonInspector ? '접기' : '펼치기'}</span>
                {showJsonInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              카카오 i 오픈빌더 스킬에서 실제로 수신하는 JSON 규격(version 2.0 및 template.outputs)입니다.
            </p>

            {showJsonInspector && (
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                {JSON.stringify(
                  lastRawJson || {
                    version: '2.0',
                    template: {
                      outputs: [
                        {
                          simpleText: {
                            text: 'SMP(계통한계가격)는 전력거래소에서 1시간 단위로 결정되는 전력 도매가격(원/kWh)입니다.',
                          },
                        },
                      ],
                      quickReplies: [
                        { label: 'SMP란?', action: 'message', messageText: 'SMP가 뭐야?' },
                        { label: '공급예비율 계산법', action: 'message', messageText: '공급예비율 공식 알려줘' },
                      ],
                    },
                  },
                  null,
                  2
                )}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

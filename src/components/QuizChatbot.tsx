import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, RotateCcw, HelpCircle, CheckCircle2, XCircle, AlertCircle, Edit3, X, Check, Award, ArrowRight } from 'lucide-react';
import { DEFAULT_STUDY_MATERIAL_TEXT, EXTRACTED_QUIZZES, StudyQuizItem } from '../data/defaultStudyMaterial';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isQuiz?: boolean;
  quizItem?: StudyQuizItem;
  graded?: boolean;
  isCorrect?: boolean;
  timestamp: string;
}

interface QuizChatbotProps {
  onBackToDashboard?: () => void;
}

export const QuizChatbot: React.FC<QuizChatbotProps> = ({ onBackToDashboard }) => {
  const [studyMaterial, setStudyMaterial] = useState<string>(DEFAULT_STUDY_MATERIAL_TEXT);
  const [isEditingMaterial, setIsEditingMaterial] = useState<boolean>(false);
  const [draftMaterial, setDraftMaterial] = useState<string>(DEFAULT_STUDY_MATERIAL_TEXT);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `반갑습니다! 저는 등록된 [학습 자료]만을 바탕으로 질문에 답하고 학습을 돕는 **퀴즈 도우미 챗봇**입니다.\n\n• **자료에 있는 내용**: 정확한 핵심 요약과 설명을 드립니다.\n• **자료에 없는 내용**: "자료에 없는 내용이에요"라고 명확히 안내합니다.\n• **퀴즈 풀기**: 하단의 **[퀴즈 내 줘]** 버튼을 누르시면 자료 속 퀴즈를 하나씩 내드립니다!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Quiz progress tracking
  const [activeQuiz, setActiveQuiz] = useState<StudyQuizItem | null>(null);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/quiz-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          studyMaterial,
          activeQuiz: activeQuiz
            ? {
                question: activeQuiz.question,
                answer: activeQuiz.answer,
                explanation: activeQuiz.explanation,
              }
            : null,
          quizIndex,
        }),
      });

      if (!response.ok) {
        throw new Error('챗봇 응답 실패');
      }

      const data = await response.json();
      const botReply = data.reply;

      // Check if this was a quiz grading
      if (activeQuiz && (data.graded || botReply.includes('[채점:'))) {
        const isCorrect = data.isCorrect ?? (botReply.includes('정답!') || botReply.includes('[채점: 정답]'));
        setSolvedCount((c) => c + 1);
        if (isCorrect) setCorrectCount((c) => c + 1);

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: botReply,
          graded: true,
          isCorrect,
          timestamp: formatTime(),
        };

        setMessages((prev) => [...prev, botMsg]);
        setActiveQuiz(null); // Clear active quiz after grading
      } else if (text.includes('퀴즈') || data.newQuiz || botReply.includes('[퀴즈 출제]')) {
        // A new quiz was given!
        // Find matching quiz from EXTRACTED_QUIZZES or create one from response
        const nextQ = EXTRACTED_QUIZZES[quizIndex % EXTRACTED_QUIZZES.length];
        setActiveQuiz(nextQ);
        setQuizIndex((idx) => (idx + 1) % EXTRACTED_QUIZZES.length);

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: botReply,
          isQuiz: true,
          quizItem: nextQ,
          timestamp: formatTime(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } else {
        // General Q&A
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: botReply,
          timestamp: formatTime(),
        };

        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      if (activeQuiz) {
        const isCorrect = text.toLowerCase().includes(activeQuiz.answer.toLowerCase());
        setSolvedCount((c) => c + 1);
        if (isCorrect) setCorrectCount((c) => c + 1);

        const evalMsg = isCorrect
          ? `[채점: 정답! 🎉]\n\n정답입니다! 정답은 '${activeQuiz.answer}'입니다.\n\n📖 [해설]\n${activeQuiz.explanation}\n\n다음 퀴즈를 풀고 싶으시면 하단의 '퀴즈 내 줘' 버튼을 눌러주세요!`
          : `[채점: 오답 💡]\n\n아쉽습니다. 정답은 '${activeQuiz.answer}'입니다.\n\n📖 [해설]\n${activeQuiz.explanation}\n\n다음 퀴즈를 원하시면 '퀴즈 내 줘' 버튼을 눌러주세요!`;

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: evalMsg,
            graded: true,
            isCorrect,
            timestamp: formatTime(),
          },
        ]);
        setActiveQuiz(null);
      } else if (text.includes('퀴즈')) {
        const nextQ = EXTRACTED_QUIZZES[quizIndex % EXTRACTED_QUIZZES.length];
        setActiveQuiz(nextQ);
        setQuizIndex((idx) => (idx + 1) % EXTRACTED_QUIZZES.length);

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: `[퀴즈 출제]\n\nQ. ${nextQ.question}\n\n정답을 채팅창에 입력해 주세요!`,
            isQuiz: true,
            quizItem: nextQ,
            timestamp: formatTime(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content: '자료에 없는 내용이에요',
            timestamp: formatTime(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // '퀴즈 내 줘' Action Button
  const handleRequestQuiz = () => {
    handleSendMessage('퀴즈 내 줘');
  };

  // Reset Conversation
  const handleResetChat = () => {
    setActiveQuiz(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `대화가 초기화되었습니다. [학습 자료]에 대해 질문하시거나, **[퀴즈 내 줘]** 버튼을 눌러 새로운 문제를 풀어보세요!`,
        timestamp: formatTime(),
      },
    ]);
  };

  // Save custom study material
  const handleSaveMaterial = () => {
    setStudyMaterial(draftMaterial);
    setIsEditingMaterial(false);
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: 'assistant',
        content: `✏️ [학습 자료]가 성공적으로 갱신되었습니다. 이제부터 수정된 자료 내용만을 바탕으로 답변하고 퀴즈를 출제합니다!`,
        timestamp: formatTime(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
      
      {/* 1. 상단 제목 (Top Header) */}
      <header className="px-5 py-4 border-b border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-between gap-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white shadow-xs shadow-orange-500/20">
            <Sparkles className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                내 관심 분야 퀴즈 도우미
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#EA580C] border border-orange-200">
                학습 자료 기반 AI
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              오직 [학습 자료]의 내용만 근거로 답하며, 자료에 없으면 "자료에 없는 내용이에요"라고 답합니다.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Quiz Score Badge */}
          {solvedCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
              <Award className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>정답 {correctCount}/{solvedCount} ({Math.round((correctCount / solvedCount) * 100)}%)</span>
            </div>
          )}

          {/* View/Edit Study Material Button */}
          <button
            onClick={() => {
              setDraftMaterial(studyMaterial);
              setIsEditingMaterial(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all"
            title="학습 자료 확인 및 수정"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>학습 자료 보기</span>
          </button>

          {/* Reset Chat */}
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="대화 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. 가운데 대화창 (Center Chat Window) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF8FF]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {!isUser ? (
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 shadow-xs font-bold text-xs mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-xs font-bold text-xs mt-0.5">
                  나
                </div>
              )}

              {/* Message Bubble Container */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                
                {/* Bubble Body */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words shadow-xs ${
                    isUser
                      ? 'bg-[#FF6B00] text-white font-medium rounded-tr-xs'
                      : msg.content === '자료에 없는 내용이에요'
                      ? 'bg-amber-50/90 text-amber-950 border border-amber-200/90 font-bold rounded-tl-xs'
                      : msg.graded
                      ? msg.isCorrect
                        ? 'bg-emerald-50/90 text-emerald-950 border border-emerald-200/90 rounded-tl-xs'
                        : 'bg-rose-50/90 text-rose-950 border border-rose-200/90 rounded-tl-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                  }`}
                >
                  {/* Strict "자료에 없는 내용이에요" Callout Badge */}
                  {msg.content === '자료에 없는 내용이에요' && (
                    <div className="flex items-center gap-1.5 text-amber-800 text-xs font-extrabold mb-1 pb-1 border-b border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>[학습 자료 검증 결과]</span>
                    </div>
                  )}

                  {/* Grading Result Banner */}
                  {msg.graded && (
                    <div className={`flex items-center gap-1.5 text-xs font-black mb-2 pb-1.5 border-b ${msg.isCorrect ? 'text-emerald-800 border-emerald-200' : 'text-rose-800 border-rose-200'}`}>
                      {msg.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>정답입니다! (+1점)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>오답입니다</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Main Content */}
                  <div>{msg.content}</div>

                  {/* If this is an active Quiz with Options, render clickable option pills! */}
                  {msg.isQuiz && msg.quizItem?.options && activeQuiz?.id === msg.quizItem.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 mb-1">
                        👉 보기를 클릭하여 바로 답을 제출할 수 있습니다:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {msg.quizItem.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => handleSendMessage(opt)}
                            className="text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-orange-50 hover:border-orange-300 border border-slate-200 text-slate-800 font-semibold text-xs transition-all flex items-center justify-between group"
                          >
                            <span>{opt}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#FF6B00] transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 shadow-xs animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-bounce [animation-delay:0.3s]" />
              <span className="ml-1 text-slate-500">학습 자료 분석 중...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Suggested Quick Prompts Bar */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs flex-shrink-0">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1 flex-shrink-0">
          <HelpCircle className="w-3 h-3" /> 추천 질문:
        </span>
        <button
          onClick={() => handleSendMessage('SMP(계통한계가격)가 뭐야?')}
          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 whitespace-nowrap transition-colors"
        >
          SMP가 뭐야?
        </button>
        <button
          onClick={() => handleSendMessage('공급예비율 정상 기준은 몇 %야?')}
          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 whitespace-nowrap transition-colors"
        >
          공급예비율 정상 기준은?
        </button>
        <button
          onClick={() => handleSendMessage('1REC는 몇 MWh야?')}
          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 whitespace-nowrap transition-colors"
        >
          1REC는 몇 MWh?
        </button>
        <button
          onClick={() => handleSendMessage('달나라에 토끼가 사나요?')}
          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 whitespace-nowrap transition-colors font-medium"
          title="자료에 없는 내용 테스트"
        >
          자료 외 질문 테스트 (달나라 토끼)
        </button>
      </div>

      {/* 3. 하단 입력창과 '퀴즈 내 줘' 버튼 (Bottom Input & '퀴즈 내 줘' Button Area) */}
      <footer className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
        
        {/* Prominent '퀴즈 내 줘' Button */}
        <button
          onClick={handleRequestQuiz}
          disabled={isLoading}
          className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white font-extrabold text-sm shadow-sm hover:shadow-orange-500/25 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <Sparkles className="w-4 h-4 stroke-[2.3]" />
          <span>퀴즈 내 줘</span>
        </button>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex-1 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                activeQuiz
                  ? `[퀴즈 응답 중] 정답을 입력하고 전송하세요...`
                  : `학습 자료에 대해 질문하거나 퀴즈 답변을 입력하세요...`
              }
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/15 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40 disabled:pointer-events-none transition-all flex-shrink-0 shadow-xs"
            title="메시지 전송"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </footer>

      {/* [학습 자료 확인 및 수정] Slide-over Modal */}
      {isEditingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    [학습 자료] 확인 및 직접 편집
                  </h3>
                  <p className="text-xs text-slate-500">
                    챗봇은 오직 아래 본문의 내용만을 근거로 답변하고 퀴즈를 출제합니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingMaterial(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Textarea */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">학습 자료 원문 (직접 수정하거나 원하는 자료를 붙여넣으세요):</span>
                <button
                  onClick={() => setDraftMaterial(DEFAULT_STUDY_MATERIAL_TEXT)}
                  className="text-[11px] text-[#EA580C] hover:underline font-semibold"
                >
                  기본 자료로 초기화
                </button>
              </div>
              <textarea
                value={draftMaterial}
                onChange={(e) => setDraftMaterial(e.target.value)}
                rows={14}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 leading-relaxed focus:outline-none focus:border-[#FF6B00] focus:bg-white transition-all"
                placeholder="여기에 학습 자료 내용을 입력하세요..."
              />
              <p className="text-[11px] text-slate-500 leading-normal">
                * 팁: 본문에 <code>[학습 자료 속 퀴즈 모음] Q1. ... 정답: ... 해설: ...</code> 형식으로 퀴즈를 적어두면 챗봇이 해당 퀴즈를 하나씩 출제하고 채점해 줍니다.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditingMaterial(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleSaveMaterial}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold shadow-xs transition-all"
              >
                <Check className="w-4 h-4" />
                <span>학습 자료 저장 및 챗봇에 적용</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

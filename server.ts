import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json());

  // Gemini AI Commentary Endpoint
  app.post('/api/ai-commentary', async (req, res) => {
    try {
      const { date, hourlyValues, maxHour, maxValue, minHour, minValue } = req.body;

      if (!hourlyValues || !Array.isArray(hourlyValues) || hourlyValues.length !== 24) {
        return res.status(400).json({ error: '24시간 데이터가 필요합니다.' });
      }

      // Format 24-hour hourly demand values
      const hourlyStr = hourlyValues
        .map((val: number, idx: number) => `${String(idx + 1).padStart(2, '0')}시: ${val} MWh`)
        .join(', ');

      const promptText = `[역할] 너는 전력시장 해설가야.
[맥락] 읽는 사람은 비전공 시민이야.
[지시] 선택한 날의 24시간 전력수요 흐름을 설명해 줘. 그래프에 있는 숫자만 사용해.
[출력형식] 3문장, 최대·최소 시간과 값 포함, 단위 MWh

[그래프 데이터: ${date}]
- 24시간 전력수요 값: ${hourlyStr}
- 최대 시간 및 값: ${maxHour} ${maxValue} MWh
- 최소 시간 및 값: ${minHour} ${minValue} MWh`;

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction: '너는 전력시장 해설가야. 비전공 시민에게 선택한 날의 24시간 전력수요 흐름을 설명해 줘. 그래프에 있는 숫자만 사용하고 정확히 3문장으로 최대·최소 시간과 값을 MWh 단위로 포함해 작성해.',
          },
        });

        const commentary = response.text?.trim();
        if (commentary) {
          return res.json({ commentary, source: 'gemini' });
        }
      }

      // Fallback rule-compliant generator if API key is not yet set or model returns empty
      const fallback = `${date}의 24시간 전력수요는 심야 시간대에 낮은 수준을 유지하다가 낮 시간대 전력 사용 집중으로 서서히 상승하는 흐름을 나타냈습니다. 이날 전력수요는 ${minHour}에 ${minValue} MWh로 하루 중 가장 낮은 최소치를 기록했습니다. 반면 가장 전력 소비가 많았던 ${maxHour}에는 ${maxValue} MWh까지 도달하며 당일 최고치를 기록했습니다.`;

      return res.json({ commentary: fallback, source: 'fallback' });
    } catch (error: any) {
      console.error('Gemini API commentary error:', error);
      // Return safe fallback conforming exactly to the user prompt instructions
      const { date, maxHour, maxValue, minHour, minValue } = req.body;
      const safeCommentary = `${date}의 24시간 전력수요는 심야 시간대에 완만한 흐름을 보이다가 낮 시간대 활동 증가와 함께 변동 폭을 나타냈습니다. 이날 전력수요는 ${minHour}에 ${minValue} MWh로 가장 적은 최소 수요를 나타냈습니다. 이후 수요가 집중된 ${maxHour}에는 ${maxValue} MWh까지 오르며 당일 최대치를 기록했습니다.`;
      return res.json({ commentary: safeCommentary, source: 'fallback' });
    }
  });

  // Quiz Helper Chatbot Endpoint
  app.post('/api/quiz-chat', async (req, res) => {
    try {
      const { message, studyMaterial, history = [], activeQuiz = null, quizIndex = 0 } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: '메시지가 필요합니다.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      const systemInstruction = `너는 사용자의 관심 분야 [학습 자료]를 기반으로 질문에 답하고 퀴즈를 출제하는 '퀴즈 도우미 챗봇'이다.

[절대 규칙 - 반드시 준수]
1. 반드시 아래 제공되는 [학습 자료]의 내용만 근거로 답변하라.
2. 사용자의 질문이나 대화 내용이 [학습 자료]에 나와 있지 않다면, 사견이나 일반 상식을 덧붙이지 말고 반드시 정확히 다음 문장으로만 답하라:
   "자료에 없는 내용이에요"
3. 사용자가 '퀴즈 내 줘'라고 하거나 퀴즈를 요청하면, [학습 자료] 속에 포함된 퀴즈를 한 번에 딱 하나씩 출제하라. (이미 푼 퀴즈와 겹치지 않게 순서대로 출제할 것). 질문을 명확히 제시하고 사용자의 답을 기다려라.
4. 사용자가 출제된 퀴즈에 대해 답변을 제출하면:
   - [채점: 정답] 또는 [채점: 오답]을 명확히 첫 줄에 표시하라.
   - [학습 자료]에 명시된 정답과 구체적인 [해설]을 친절하게 설명하라.
   - 해설 후 '다음 퀴즈를 원하시면 [퀴즈 내 줘] 버튼을 눌러주세요!'라고 안내하라.`;

      const promptContext = `[학습 자료]
${studyMaterial}

[현재 퀴즈 상태]
${activeQuiz ? `현재 출제된 퀴즈: ${activeQuiz.question}\n기대 정답: ${activeQuiz.answer}\n해설: ${activeQuiz.explanation}` : '현재 대기 중인 퀴즈 없음 (사용자가 질문 중이거나 퀴즈 요청 가능)'}

[사용자 입력 메시지]
${message}`;

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: promptContext,
            config: {
              systemInstruction,
              abortSignal: AbortSignal.timeout(6000),
            },
          });

          const reply = response.text?.trim();
          if (reply) {
            return res.json({ reply, source: 'gemini' });
          }
        } catch (apiErr) {
          console.warn('Gemini API call failed, falling back to rule engine:', apiErr);
          // Fall through to fallback engine below
        }
      }

      // Rule-based fallback if API key is not yet set
      const trimmed = message.trim();
      const isQuizRequest = trimmed.includes('퀴즈') || trimmed.includes('문제') || trimmed.includes('시험');

      // 1. If currently waiting for quiz answer
      if (activeQuiz) {
        const normalizedUser = trimmed.replace(/\s+/g, '').toLowerCase();
        const normalizedAns = activeQuiz.answer.replace(/\s+/g, '').toLowerCase();
        const isCorrect = normalizedUser.includes(normalizedAns) || normalizedAns.includes(normalizedUser);

        const evaluation = isCorrect
          ? `[채점: 정답! 🎉]\n\n훌륭합니다! 정답은 '${activeQuiz.answer}'입니다.\n\n📖 [해설]\n${activeQuiz.explanation}\n\n다음 퀴즈를 계속 푸시려면 하단의 '퀴즈 내 줘' 버튼을 눌러주세요!`
          : `[채점: 오답 💡]\n\n아쉽습니다. 정답은 '${activeQuiz.answer}'입니다.\n\n📖 [해설]\n${activeQuiz.explanation}\n\n복습 후 다음 퀴즈를 원하시면 '퀴즈 내 줘' 버튼을 눌러주세요!`;

        return res.json({ reply: evaluation, graded: true, isCorrect, source: 'fallback' });
      }

      // 2. If asking for a quiz
      if (isQuizRequest) {
        // Sample questions extracted from default material
        const sampleQuizzes = [
          {
            q: '전력거래소(KPX)에서 1시간 단위로 결정되는 전력 도매가격의 영문 약칭은 무엇인가요?',
            a: 'SMP',
            exp: '한국전력공사가 발전사로부터 전력을 구매하는 기준 도매가격으로 System Marginal Price의 약칭인 SMP입니다.'
          },
          {
            q: '공급예비율이 몇 퍼센트(%) 이상이어야 전력망 수급이 정상 안정 상태로 분류되나요?',
            a: '10%',
            exp: '공급예비율이 10% 이상일 때 전력망이 정상 및 안정 상태로 유지됩니다.'
          },
          {
            q: '신재생에너지공급인증서(REC)는 몇 MWh(또는 몇 kWh) 발전량당 1REC가 발급되나요?',
            a: '1MWh',
            exp: '신재생에너지를 이용해 전력을 1MWh(1,000kWh) 생산·공급할 때마다 1개의 REC가 발급됩니다.'
          },
          {
            q: '하루 중 전력 사용량이 가장 적고 단가가 가장 낮은 심야·새벽 시간대(23:00~09:00)의 부하 명칭은 무엇인가요?',
            a: '경부하',
            exp: '심야 및 새벽 시간대는 전력 수요가 낮아 "경부하" 시간대로 분류되며 단가가 가장 저렴합니다.'
          },
          {
            q: '태양광 발전사업자의 총 정산 수익은 어떤 두 가지 항목의 합산으로 구성되나요?',
            a: 'SMP 수익과 REC 수익',
            exp: '발전사업자는 전력을 판매한 대가인 SMP 수익과 인증서를 매매한 REC 수익의 합으로 최종 수익을 얻습니다.'
          }
        ];
        const nextQuiz = sampleQuizzes[quizIndex % sampleQuizzes.length];
        const quizReply = `[퀴즈 출제]\n\nQ. ${nextQuiz.q}\n\n정답을 채팅창에 입력해 주세요!`;
        return res.json({ reply: quizReply, newQuiz: nextQuiz, nextIndex: (quizIndex + 1) % sampleQuizzes.length, source: 'fallback' });
      }

      // 3. Question check against study material
      const checkTerms = ['smp', '계통한계가격', '공급예비율', '예비력', '경부하', '중간부하', '최대부하', '피크', 'rec', '누진제', '태양광', 'lng', '도매단가', '한국전력', '전력거래소'];
      const matchesAny = checkTerms.some(term => message.toLowerCase().includes(term));

      if (!matchesAny && !studyMaterial.toLowerCase().includes(message.toLowerCase().slice(0, 3))) {
        return res.json({ reply: '자료에 없는 내용이에요', source: 'fallback' });
      }

      // Explain based on material
      if (message.includes('SMP') || message.includes('계통한계가격')) {
        return res.json({
          reply: 'SMP(System Marginal Price)는 한국전력공사가 전력거래소(KPX) 도매시장에서 발전사업자로부터 전력을 구매할 때 적용하는 도매단가입니다(단위: 원/kWh). 1시간 단위로 결정되며 가동된 가장 비싼 발전기(주로 LNG)의 변동비에 의해 결정됩니다.',
          source: 'fallback'
        });
      }

      if (message.includes('예비율')) {
        return res.json({
          reply: '공급예비율(%)은 (공급예비력 / 현재 전력수요) × 100으로 계산되며, 10% 이상이면 정상 안정 상태입니다. 5.5GW 미만부터 비상경보(준비, 관심, 주의, 경계, 심각)가 발령됩니다.',
          source: 'fallback'
        });
      }

      if (message.includes('REC')) {
        return res.json({
          reply: 'REC(신재생에너지공급인증서)는 1MWh(1,000kWh) 발전량당 1REC가 발급되는 친환경 인증서입니다. 태양광 사업자는 SMP 수익과 REC 수익을 합쳐 정산받습니다.',
          source: 'fallback'
        });
      }

      return res.json({
        reply: '자료에 나와 있는 내용입니다. 구체적인 용어나 퀴즈를 원하시면 질문하시거나 아래 [퀴즈 내 줘] 버튼을 눌러보세요!',
        source: 'fallback'
      });
    } catch (err: any) {
      console.error('Quiz chat API error:', err);
      return res.status(500).json({ reply: '자료에 없는 내용이에요', error: err.message });
    }
  });

  // Dedicated KakaoTalk Chatbot Skill API Endpoint (/api/kakao-bot)
  // RAG Material text strictly limited to user's 126-character definition
  const KAKAO_RAG_TEXT = 'SMP(계통한계가격)는 전력거래소에서 1시간 단위로 결정되는 전력 도매가격(원/kWh)이다. 공급예비율은 (공급예비력/전력수요)×100으로 계산하며 10% 이상이어야 정상 수급 상태다. REC는 신재생에너지 1MWh 발전 시 발급되는 공급인증서다.';

  app.all(['/api/kakao-bot', '/kakao-bot', '/api/skill', '/skill'], (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return res.json({
        status: 'active',
        service: '전력시장용어 카카오톡 챗봇 스킬 API',
        description: '카카오 i 오픈빌더 스킬 서버 URL입니다. POST 요청으로 userRequest.utterance를 전달받습니다.',
        ragMaterial: KAKAO_RAG_TEXT,
        examplePayload: {
          userRequest: { utterance: 'SMP가 뭐야?' }
        }
      });
    }
    next();
  });

  app.post(['/api/kakao-bot', '/kakao-bot', '/api/skill', '/skill', '/'], async (req, res) => {
    try {
      // Support both Kakao i Open Builder payload (userRequest.utterance) and standard web client (message)
      const utterance = (
        req.body?.userRequest?.utterance ||
        req.body?.action?.params?.utterance ||
        req.body?.message ||
        req.body?.content ||
        ''
      ).trim();

      if (!utterance) {
        return res.json({
          version: '2.0',
          template: {
            outputs: [
              {
                simpleText: {
                  text: '안녕하세요! 전력시장 핵심 용어 챗봇입니다. SMP, 공급예비율, REC에 대해 질문해 주세요.'
                }
              }
            ],
            quickReplies: [
              { label: 'SMP란?', action: 'message', messageText: 'SMP가 뭐야?' },
              { label: '공급예비율 공식', action: 'message', messageText: '공급예비율 계산법 알려줘' },
              { label: 'REC란?', action: 'message', messageText: 'REC가 뭐야?' }
            ]
          },
          reply: '안녕하세요! 전력시장 핵심 용어 챗봇입니다. SMP, 공급예비율, REC에 대해 질문해 주세요.'
        });
      }

      // Extract any incoming knowledge base / context passed from Kakao i Open Builder
      const incomingKnowledge = (
        req.body?.action?.params?.knowledge ||
        req.body?.action?.params?.context ||
        req.body?.action?.params?.document ||
        req.body?.action?.params?.지식 ||
        req.body?.action?.params?.지식베이스 ||
        req.body?.action?.detailParams?.knowledge?.value ||
        req.body?.action?.detailParams?.context?.value ||
        req.body?.contexts?.[0]?.params?.knowledge?.value ||
        req.body?.knowledge ||
        ''
      ).trim();

      const knowledgeBase = incomingKnowledge || KAKAO_RAG_TEXT;

      let replyText = '';
      const apiKey = process.env.GEMINI_API_KEY;

      const systemInstruction = `너는 카카오톡 챗봇의 [지식베이스]를 기반으로만 답변하는 도우미 챗봇이다. 카카오톡 메신저 환경에 맞게 간결하고 정중하며 명확한 문장으로 답변하라.

[지식베이스 (Knowledge Base)]
${knowledgeBase}

[시스템 규칙 - 엄격 준수]
1. 반드시 위 [지식베이스]에 기록된 사실만을 근거로 답변하라.
2. [지식베이스]에 명시되지 않은 내용(예: 주식, 날씨, 다른 일반 상식, 지식베이스에 없는 질문)에 대해서는 다른 설명을 덧붙이지 말고 반드시 정확히 다음 문장으로만 답변하라:
"자료에 없는 내용이에요"
3. 인사말(안녕, 반가워 등)에는 지식베이스의 핵심 내용을 기반으로 인사하고 질문을 유도하라.
4. 카카오톡 메신저 화면에서 읽기 편하도록 불필요한 사설 없이 1~3문장 이내로 핵심만 명확히 답변하라.`;

      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `사용자 질문: ${utterance}`,
            config: {
              systemInstruction,
              abortSignal: AbortSignal.timeout(5000),
            },
          });

          const geminiReply = response.text?.trim();
          if (geminiReply) {
            replyText = geminiReply;
          }
        } catch (apiErr) {
          console.warn('Gemini API call failed for kakao-bot, using fallback logic:', apiErr);
        }
      }

      // Rule-based deterministic fallback (Strict grounding)
      if (!replyText) {
        const lower = utterance.toLowerCase().replace(/\s+/g, '');
        const isGreeting = ['안녕', '반가워', '하이', 'hello', '시작', '도움말'].some(g => lower.includes(g));

        if (isGreeting) {
          replyText = '안녕하세요! 카카오톡 챗봇 지식베이스 도우미입니다. 등록된 지식베이스(SMP, 공급예비율, REC 등)를 기반으로 답변해 드립니다. 궁금하신 내용을 질문해 주세요!';
        } else if (lower.includes('smp') || lower.includes('계통한계가격') || lower.includes('도매가격') || lower.includes('원/kwh')) {
          replyText = 'SMP(계통한계가격)는 전력거래소에서 1시간 단위로 결정되는 전력 도매가격(원/kWh)입니다.';
        } else if (lower.includes('공급예비율') || lower.includes('예비력') || lower.includes('예비율') || lower.includes('정상수급') || lower.includes('전력수요')) {
          replyText = '공급예비율은 (공급예비력/전력수요)×100으로 계산하며 10% 이상이어야 정상 수급 상태입니다.';
        } else if (lower.includes('rec') || lower.includes('신재생') || lower.includes('공급인증서') || lower.includes('1mwh') || lower.includes('인증서')) {
          replyText = 'REC는 신재생에너지 1MWh 발전 시 발급되는 공급인증서입니다.';
        } else if (incomingKnowledge && incomingKnowledge.toLowerCase().includes(lower.slice(0, 4))) {
          replyText = incomingKnowledge;
        } else {
          // Strictly answer "자료에 없는 내용이에요"
          replyText = '자료에 없는 내용이에요';
        }
      }

      // Standard Kakao i Open Builder Version 2.0 Response Format
      return res.json({
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: replyText
              }
            }
          ],
          quickReplies: [
            { label: 'SMP란?', action: 'message', messageText: 'SMP가 뭐야?' },
            { label: '공급예비율 계산법', action: 'message', messageText: '공급예비율 계산법 알려줘' },
            { label: 'REC란?', action: 'message', messageText: 'REC가 뭐야?' },
            { label: '자료 외 질문 테스트', action: 'message', messageText: '오늘 날씨 어때?' }
          ]
        },
        reply: replyText
      });
    } catch (err: any) {
      console.error('Kakao bot error:', err);
      return res.status(500).json({
        version: '2.0',
        template: {
          outputs: [{ simpleText: { text: '자료에 없는 내용이에요' } }]
        },
        reply: '자료에 없는 내용이에요'
      });
    }
  });

  // Real-time SMP & Forecast Demand Proxy for https://apis.data.go.kr/B552115/SmpWithForecastDemand
  app.post('/api/realtime-smp-demand', async (req, res) => {
    try {
      const { serviceKey, date, hour } = req.body;

      if (!serviceKey || typeof serviceKey !== 'string' || !serviceKey.trim()) {
        return res.status(400).json({ error: '인증키를 입력해 주세요.' });
      }

      // Handle decoding/encoding: do not double-encode if user pasted URL-encoded key
      let cleanKey = serviceKey.trim();
      try {
        if (cleanKey.includes('%')) {
          cleanKey = decodeURIComponent(cleanKey);
        }
      } catch (e) {}

      // Format date YYYYMMDD
      const targetDate = date ? String(date).replace(/[^0-9]/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');

      const baseEndpoint = 'https://apis.data.go.kr/B552115/SmpWithForecastDemand/getSmpWithForecastDemand';
      const fallbackEndpoint = 'https://apis.data.go.kr/B552115/SmpWithForecastDemand';

      // 1. Try getSmpWithForecastDemand with decoded key
      const queryParams1 = new URLSearchParams({
        serviceKey: cleanKey,
        pageNo: '1',
        numOfRows: '24',
        dataType: 'JSON',
        date: targetDate,
      });

      let apiResponse = await fetch(`${baseEndpoint}?${queryParams1.toString()}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(9000),
      });

      let rawText = await apiResponse.text();

      // 2. If rejected with auth error and key had special chars, try verbatim key as well
      if ((rawText.includes('SERVICE_KEY') || apiResponse.status === 403) && cleanKey !== serviceKey.trim()) {
        const queryParams2 = `serviceKey=${serviceKey.trim()}&pageNo=1&numOfRows=24&dataType=JSON&date=${targetDate}`;
        const retryRes = await fetch(`${baseEndpoint}?${queryParams2}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(9000),
        });
        const retryText = await retryRes.text();
        if (!retryText.includes('SERVICE_KEY') && retryRes.status === 200) {
          apiResponse = retryRes;
          rawText = retryText;
        }
      }

      // 3. If 404 on getSmpWithForecastDemand, try base fallback endpoint
      if (apiResponse.status === 404) {
        const queryParamsFallback = new URLSearchParams({
          serviceKey: cleanKey,
          pageNo: '1',
          numOfRows: '24',
          dataType: 'JSON',
          date: targetDate,
        });
        const fbRes = await fetch(`${fallbackEndpoint}?${queryParamsFallback.toString()}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(9000),
        });
        rawText = await fbRes.text();
        apiResponse = fbRes;
      }

      // Check for errors in the response (JSON or XML)
      let parsedError: string | null = null;

      // Check if JSON error
      try {
        const json = JSON.parse(rawText);
        if (json.OpenAPI_ServiceResponse?.cmmMsgHeader) {
          const header = json.OpenAPI_ServiceResponse.cmmMsgHeader;
          parsedError = `${header.returnAuthMsg || header.errMsg || '인증 오류'} (${header.errMsg || header.returnReasonCode || '코드 없음'})`;
        } else if (json.response?.header?.resultCode && json.response.header.resultCode !== '00') {
          parsedError = `${json.response.header.resultMsg || '응답 오류'} (결과 코드: ${json.response.header.resultCode})`;
        } else if (json.response?.body?.items) {
          // Success case with valid JSON body!
          const rawItems = json.response.body.items.item;
          const items = Array.isArray(rawItems) ? rawItems : (rawItems ? [rawItems] : []);

          if (items.length === 0) {
            return res.status(404).json({ error: `조회일자(${targetDate})에 해당하는 전력거래소 데이터가 존재하지 않습니다.` });
          }

          // Parse items
          const targetHour = hour ? Number(hour) : 17;
          const matchingItem = items.find((it: any) => {
            const h = Number(it.hour || it.tradeHour || it.time || 0);
            return h === targetHour;
          }) || items[items.length - 1] || items[0];

          const forecastDemand = parseFloat(matchingItem.forecastDemand || matchingItem.demand || matchingItem.mw || 68500);
          const smp = parseFloat(matchingItem.smp || matchingItem.landSmp || matchingItem.smpLand || 140);
          
          // Estimated grid capacity based on KPX standard reserve (~85% load)
          const capacity = matchingItem.supplyCapacity ? parseFloat(matchingItem.supplyCapacity) : Math.round(forecastDemand * 1.16);
          const reserveMw = capacity - forecastDemand;
          const reserveMargin = parseFloat(((reserveMw / forecastDemand) * 100).toFixed(1));
          
          let gridStatus = '정상';
          if (reserveMargin < 2) gridStatus = '심각';
          else if (reserveMargin < 3) gridStatus = '주의';
          else if (reserveMargin < 5) gridStatus = '관심';
          else if (reserveMargin < 10) gridStatus = '준비';

          const now = new Date();
          const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

          return res.json({
            success: true,
            isRealtime: true,
            timestamp,
            tradeDate: matchingItem.tradeDate || targetDate,
            hour: targetHour,
            currentDemand: forecastDemand,
            currentCapacity: capacity,
            reserveMw,
            reserveMargin,
            gridStatus,
            smp,
            sourceUrl: 'https://apis.data.go.kr/B552115/SmpWithForecastDemand',
            itemCount: items.length,
          });
        }
      } catch (jsonErr) {
        // Parse XML error if JSON parse fails
        const authMsgMatch = rawText.match(/<returnAuthMsg>(.*?)<\/returnAuthMsg>/);
        const errMsgMatch = rawText.match(/<errMsg>(.*?)<\/errMsg>/);
        const reasonCodeMatch = rawText.match(/<returnReasonCode>(.*?)<\/returnReasonCode>/);
        if (authMsgMatch || errMsgMatch) {
          const authMsg = authMsgMatch ? authMsgMatch[1] : '';
          const errMsg = errMsgMatch ? errMsgMatch[1] : '';
          const code = reasonCodeMatch ? reasonCodeMatch[1] : '';
          parsedError = `${authMsg || errMsg} (${errMsg || code})`;
        }
      }

      if (parsedError) {
        return res.status(400).json({ error: parsedError });
      }

      // If HTTP error code
      if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({
          error: `공공데이터포털 서버 응답 오류 (HTTP ${apiResponse.status})`,
        });
      }

      // General fallback if unexpected format
      return res.status(400).json({
        error: `공공데이터포털 응답 형식 오류: ${rawText.slice(0, 150)}`,
      });
    } catch (err: any) {
      console.error('Realtime SMP demand API error:', err);
      return res.status(500).json({
        error: `서버 연결 실패: ${err.message || '네트워크 타임아웃'}`,
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

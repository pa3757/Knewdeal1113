/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { LiveTicker } from './components/LiveTicker';
import { MetricCards } from './components/MetricCards';
import { HourlyChart } from './components/HourlyChart';
import { GridStatusCard } from './components/GridStatusCard';
import { HourlyAnalysisView } from './components/HourlyAnalysisView';
import { TariffCalculator } from './components/TariffCalculator';
import { RenewableRecView } from './components/RenewableRecView';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { QuizChatbot } from './components/QuizChatbot';
import { KakaoBotView } from './components/KakaoBotView';
import { KPX_SMP_RECORDS, DailySmpRecord } from './data/kpxSmpData';
import { parseKpxCsv } from './utils/csvParser';
import { INITIAL_SUMMARY, GRID_NOTICES } from './data/mockMarketData';
import { MarketSummary } from './types/market';
import { Zap, Calendar, Sparkles, ChevronLeft, ChevronRight, UploadCloud, ArrowRight, Check } from 'lucide-react';

export default function App() {
  // Default to 'kakao' tab to immediately display the requested RAG KakaoTalk chatbot & URL
  const [currentTab, setCurrentTab] = useState<'quiz' | 'dashboard' | 'hourly' | 'calculator' | 'renewable' | 'kakao'>('kakao');
  const [records, setRecords] = useState<DailySmpRecord[]>(KPX_SMP_RECORDS);
  const [selectedDate, setSelectedDate] = useState<string>(KPX_SMP_RECORDS[0]?.date || '2026-11-06');
  const [selectedHour, setSelectedHour] = useState<number>(17); // 1 to 24 (default to peak hour)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Available dates list (sorted descending)
  const availableDates = useMemo(() => records.map((r) => r.date), [records]);

  // Current selected day's record
  const currentRecord = useMemo(() => {
    return records.find((r) => r.date === selectedDate) || records[0];
  }, [records, selectedDate]);

  // Previous day's record for delta comparison
  const prevRecord = useMemo(() => {
    const idx = records.findIndex((r) => r.date === selectedDate);
    if (idx >= 0 && idx < records.length - 1) {
      return records[idx + 1];
    }
    return undefined;
  }, [records, selectedDate]);

  // Summary object updated with real KPX CSV data
  const summary: MarketSummary = useMemo(() => {
    const currentVal = currentRecord.hourly[selectedHour - 1] ?? currentRecord.hourly[0];
    const prevDayAvg = prevRecord ? prevRecord.weightedAvg : currentRecord.weightedAvg;
    const prevDayChange = prevDayAvg > 0
      ? parseFloat((((currentRecord.weightedAvg - prevDayAvg) / prevDayAvg) * 100).toFixed(1))
      : 0;

    return {
      ...INITIAL_SUMMARY,
      currentHour: selectedHour,
      currentSmpLand: currentVal,
      currentSmpJeju: parseFloat((currentVal * 1.04).toFixed(2)),
      prevDaySmpChange: prevDayChange,
      todayAvgSmp: currentRecord.weightedAvg,
      todayMaxSmp: currentRecord.max,
      todayMinSmp: currentRecord.min,
    };
  }, [currentRecord, prevRecord, selectedHour]);

  // Handle uploading any other KPX CSV file
  const handleUploadCsv = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      let text = '';
      try {
        const decoder = new TextDecoder('euc-kr');
        text = decoder.decode(buffer);
      } catch (e) {
        text = new TextDecoder('utf-8').decode(buffer);
      }

      const parsed = parseKpxCsv(text);
      if (parsed.length > 0) {
        setRecords(parsed);
        setSelectedDate(parsed[0].date);
        setUploadToast(`성공적으로 ${parsed.length}일치 전력거래소 CSV 데이터를 불러왔습니다.`);
        setTimeout(() => setUploadToast(null), 4000);
      } else {
        alert('CSV 파일에서 올바른 전력거래소 SMP 데이터를 파싱할 수 없습니다. 포맷을 확인해 주세요.');
      }
    } catch (err) {
      console.error(err);
      alert('CSV 파일을 읽는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#131B2E] flex flex-col font-sans selection:bg-[#FF6B00] selection:text-white">
      
      {/* 1. Header with brand, navigation tabs including 'quiz' */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        availableDates={availableDates}
        onOpenAlerts={() => setIsAlertModalOpen(true)}
        onUploadCsv={handleUploadCsv}
      />

      {/* 2. Live Ticker showing selected date metrics */}
      <LiveTicker
        currentRecord={currentRecord}
        prevRecord={prevRecord}
        selectedHour={selectedHour}
      />

      {/* Upload Success Toast */}
      {uploadToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-1.5 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{uploadToast}</span>
        </div>
      )}

      {/* 3. Main Body */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 flex flex-col">
        
        {/* QUIZ HELPER CHATBOT TAB (Requested screen: 상단 제목, 가운데 대화창, 하단 입력창과 '퀴즈 내 줘' 버튼) */}
        {currentTab === 'quiz' && (
          <div className="flex-1 flex flex-col animate-in fade-in">
            <QuizChatbot onBackToDashboard={() => setCurrentTab('dashboard')} />
          </div>
        )}

        {/* DASHBOARD TAB */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in">
            
            {/* Date Selection Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#EA580C] flex items-center justify-center flex-shrink-0 border border-orange-200/60">
                  <Calendar className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">
                      전력거래소 육지 일별 시간별 SMP (원/kWh)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFDBCC]">
                      총 {records.length}일 데이터 수록
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    날짜를 선택하면 해당 일자의 1~24시 막대 차트와 하루 평균 요약 카드가 즉시 갱신됩니다.
                  </p>
                </div>
              </div>

              {/* Quick Date Chips & Selector */}
              <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
                <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">최근 날짜:</span>
                {availableDates.slice(0, 5).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedDate === d
                        ? 'bg-[#FF6B00] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d.slice(5)} {d === availableDates[0] && '(최신)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Top 4 Summary Cards (including 하루 평균 카드 & 피크 강조) */}
            <section aria-label="하루 평균 및 주요 시세 지표">
              <MetricCards
                currentRecord={currentRecord}
                prevRecord={prevRecord}
                selectedHour={selectedHour}
              />
            </section>

            {/* 12-Column Layout: 8-col 1~24h Chart + 4-col Status Feed */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Primary 8-Column Section: 1~24시 막대 차트 (가장 비싼 시간대 주황색 강조 & AI 해설 버튼) */}
              <div className="lg:col-span-8">
                <HourlyChart
                  currentRecord={currentRecord}
                  selectedHour={selectedHour}
                  onSelectHour={(hour) => setSelectedHour(hour)}
                  availableDates={availableDates}
                  onSelectDate={(date) => setSelectedDate(date)}
                />
              </div>

              {/* Paired 4-Column Section: Grid Status & Smart Guidance */}
              <div className="lg:col-span-4">
                <GridStatusCard
                  summary={summary}
                  notices={GRID_NOTICES}
                  currentRecord={currentRecord}
                  selectedHour={selectedHour}
                  onNavigateCalculator={() => setCurrentTab('calculator')}
                />
              </div>

            </section>

            {/* Quiz Chatbot Promotion Card */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6B00] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#0F172A]">
                    내 관심 분야 퀴즈 도우미 챗봇으로 실력 점검하기
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                    학습 자료를 근거로 한 1:1 맞춤형 퀴즈 출제, 실시간 채점 및 친절한 해설을 경험해 보세요.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setCurrentTab('quiz')}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-orange-500/25 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>퀴즈 챗봇 시작하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>

          </div>
        )}

        {/* HOURLY ANALYSIS TAB */}
        {currentTab === 'hourly' && (
          <div className="animate-in fade-in">
            <HourlyAnalysisView
              currentRecord={currentRecord}
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={(date) => setSelectedDate(date)}
              selectedHour={selectedHour}
              onSelectHour={(hour) => {
                setSelectedHour(hour);
                setCurrentTab('dashboard');
              }}
            />
          </div>
        )}

        {/* CALCULATOR TAB */}
        {currentTab === 'calculator' && (
          <div className="animate-in fade-in">
            <TariffCalculator />
          </div>
        )}

        {/* RENEWABLE & REC TAB */}
        {currentTab === 'renewable' && (
          <div className="animate-in fade-in">
            <RenewableRecView summary={summary} />
          </div>
        )}

        {/* KAKAO TALK CHATBOT TAB (Requested: 200자 이내 RAG 자료 기반 챗봇 & 카카오톡 스킬 URL) */}
        {currentTab === 'kakao' && (
          <div className="animate-in fade-in">
            <KakaoBotView />
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FF6B00] flex items-center justify-center text-white">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-900">ElectricPulse</span>
            <span className="text-slate-300">|</span>
            <span>관심 분야 퀴즈 도우미 & 전력시장 데이터 플랫폼</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-500">
            <span>퀴즈 출제: [학습 자료] 엄격 준수</span>
            <span>AI 엔진: Gemini 3.8 Flash</span>
            <span className="text-slate-400">© 2026 Electric Pulse.</span>
          </div>
        </div>
      </footer>

      {/* 5. Alerts Modal */}
      <AlertSettingsModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />

    </div>
  );
}

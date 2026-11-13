import React, { useRef } from 'react';
import { Zap, Bell, Clock, Calendar, ChevronLeft, ChevronRight, UploadCloud, Sparkles, MessageCircle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'quiz' | 'dashboard' | 'hourly' | 'calculator' | 'renewable' | 'kakao';
  setCurrentTab: (tab: 'quiz' | 'dashboard' | 'hourly' | 'calculator' | 'renewable' | 'kakao') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  availableDates: string[];
  onOpenAlerts: () => void;
  onUploadCsv: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedDate,
  setSelectedDate,
  availableDates,
  onOpenAlerts,
  onUploadCsv,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentIndex = availableDates.indexOf(selectedDate);
  const hasNext = currentIndex > 0;
  const hasPrev = currentIndex < availableDates.length - 1;

  const handlePrevDay = () => {
    if (hasPrev) setSelectedDate(availableDates[currentIndex + 1]);
  };

  const handleNextDay = () => {
    if (hasNext) setSelectedDate(availableDates[currentIndex - 1]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCsv(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
              <Zap className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#0F172A]">
                  Electric<span className="text-[#FF6B00]">Pulse</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF7ED] text-[#EA580C] border border-[#FFDBCC]">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse-dot" />
                  AI 퀴즈 & 전력시장
                </span>
              </div>
              <p className="text-xs font-medium text-[#64748B] hidden sm:block">
                내 관심 분야 퀴즈 도우미 & 실시간 전력 시장 플랫폼
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setCurrentTab('quiz')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                currentTab === 'quiz'
                  ? 'bg-[#FF6B00] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#0F172A] hover:bg-slate-200/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>퀴즈 도우미</span>
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              실시간 대시보드
            </button>
            <button
              onClick={() => setCurrentTab('hourly')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'hourly'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              시간대별 분석
            </button>
            <button
              onClick={() => setCurrentTab('calculator')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'calculator'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              요금 계산기
            </button>
            <button
              onClick={() => setCurrentTab('renewable')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'renewable'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              신재생 & REC
            </button>
            <button
              onClick={() => setCurrentTab('kakao')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                currentTab === 'kakao'
                  ? 'bg-[#FEE500] text-[#191919] shadow-xs'
                  : 'text-[#191919] hover:bg-[#FEE500]/30'
              }`}
            >
              <MessageCircle className="w-4 h-4 fill-current stroke-none text-[#3C1E1E]" />
              <span>카카오 챗봇</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            
            {/* Date Navigator */}
            <div className="flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={handlePrevDay}
                disabled={!hasPrev}
                className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="이전 날짜로 이동"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-3.5 h-3.5 text-[#FF6B00]" />
                <input
                  type="date"
                  value={selectedDate}
                  min={availableDates[availableDates.length - 1] || '2026-01-01'}
                  max={availableDates[0] || '2026-11-06'}
                  onChange={(e) => {
                    if (e.target.value && availableDates.includes(e.target.value)) {
                      setSelectedDate(e.target.value);
                    }
                  }}
                  className="bg-transparent text-slate-900 font-extrabold cursor-pointer focus:outline-none text-xs tabular-nums"
                />
              </div>

              <button
                onClick={handleNextDay}
                disabled={!hasNext}
                className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="다음 날짜로 이동"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Upload CSV Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all"
              title="다른 KPX SMP CSV 파일 연결"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>

            {/* Alerts Button */}
            <button
              onClick={onOpenAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:text-[#EA580C] text-xs font-semibold transition-all shadow-xs"
            >
              <Bell className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span className="hidden sm:inline">알림</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto pb-2 gap-1 pt-1 no-scrollbar">
          <button
            onClick={() => setCurrentTab('quiz')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              currentTab === 'quiz'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-orange-50 text-[#EA580C] border border-orange-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>퀴즈 도우미</span>
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentTab === 'dashboard'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-slate-100 text-[#475569]'
            }`}
          >
            실시간 대시보드
          </button>
          <button
            onClick={() => setCurrentTab('hourly')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentTab === 'hourly'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-slate-100 text-[#475569]'
            }`}
          >
            시간대별 분석
          </button>
          <button
            onClick={() => setCurrentTab('calculator')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentTab === 'calculator'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-slate-100 text-[#475569]'
            }`}
          >
            요금 계산기
          </button>
          <button
            onClick={() => setCurrentTab('renewable')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentTab === 'renewable'
                ? 'bg-[#FF6B00] text-white shadow-xs'
                : 'bg-slate-100 text-[#475569]'
            }`}
          >
            신재생 & REC
          </button>
          <button
            onClick={() => setCurrentTab('kakao')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              currentTab === 'kakao'
                ? 'bg-[#FEE500] text-[#191919] shadow-xs'
                : 'bg-[#FEE500]/30 text-[#191919] border border-[#FEE500]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current stroke-none text-[#3C1E1E]" />
            <span>카카오 챗봇</span>
          </button>
        </div>
      </div>
    </header>
  );
};

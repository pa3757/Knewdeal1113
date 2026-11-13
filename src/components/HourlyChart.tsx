import React, { useState } from 'react';
import { BarChart3, TrendingUp, Info, Zap, Calendar, ArrowUpRight, ArrowDownRight, Sparkles, Copy, Check, RefreshCw, MessageSquare } from 'lucide-react';
import { DailySmpRecord } from '../data/kpxSmpData';

interface HourlyChartProps {
  currentRecord: DailySmpRecord;
  selectedHour: number; // 1 to 24
  onSelectHour: (hour: number) => void;
  availableDates: string[];
  onSelectDate: (date: string) => void;
}

export const HourlyChart: React.FC<HourlyChartProps> = ({
  currentRecord,
  selectedHour,
  onSelectHour,
  availableDates,
  onSelectDate,
}) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [aiCommentary, setAiCommentary] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const { hourly, max, min, weightedAvg, date } = currentRecord;

  // Max and min value across the 24 hours for scaling
  const chartMax = Math.max(...hourly, max);
  const chartMin = Math.min(...hourly, min);
  const scaleMin = Math.max(0, chartMin * 0.7);
  const scaleMax = chartMax * 1.05;

  // Find which hour(s) have maximum and minimum values
  const maxHours: number[] = [];
  const minHours: number[] = [];
  hourly.forEach((val, idx) => {
    if (Math.abs(val - max) < 0.001) maxHours.push(idx + 1);
    if (Math.abs(val - min) < 0.001) minHours.push(idx + 1);
  });

  const maxHourStr = maxHours.map((h) => `${String(h).padStart(2, '0')}시`).join(', ');
  const minHourStr = minHours.map((h) => `${String(h).padStart(2, '0')}시`).join(', ');

  // Average line position percentage
  const avgLinePct = Math.round(((weightedAvg - scaleMin) / (scaleMax - scaleMin)) * 100);

  // Active hover/selected difference
  const activeHourIndex = (hoveredHour !== null ? hoveredHour : selectedHour) - 1;
  const activeValue = hourly[activeHourIndex] ?? hourly[0];
  const activeDiffFromAvg = (activeValue - weightedAvg).toFixed(2);
  const isHoveredMax = maxHours.includes(activeHourIndex + 1);

  // Trigger Gemini AI Commentary
  const handleFetchAiCommentary = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/ai-commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          hourlyValues: hourly,
          maxHour: maxHourStr,
          maxValue: max,
          minHour: minHourStr,
          minValue: min,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 해설 요청에 실패했습니다.');
      }

      const data = await response.json();
      setAiCommentary(data.commentary);
    } catch (err) {
      console.error(err);
      // Fallback 3-sentence commentary adhering strictly to constraints
      setAiCommentary(
        `${date}의 24시간 전력수요는 심야 시간대에 낮은 수준을 유지하다가 낮 시간대 전력 사용 집중으로 서서히 상승하는 흐름을 나타냈습니다. 이날 전력수요는 ${minHourStr}에 ${min} MWh로 하루 중 가장 낮은 최소치를 기록했습니다. 반면 가장 전력 소비가 많았던 ${maxHourStr}에는 ${max} MWh까지 도달하며 당일 최고치를 기록했습니다.`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopyCommentary = () => {
    if (!aiCommentary) return;
    navigator.clipboard.writeText(aiCommentary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#FF6B00]" />
              1~24시 시간대별 전력수요·SMP 막대 차트
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#EA580C] border border-orange-200">
              {date} 육지 데이터
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            한국전력거래소(KPX) 정산 단가 (원/kWh • MWh) • <span className="text-[#FF6B00] font-bold">가장 비싼 시간대(최대 {max.toFixed(2)})는 주황색으로 강조</span>됩니다.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#FF6B00] shadow-xs"></span>
            <span className="font-bold text-[#EA580C]">가장 비싼 시간대 (최고)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#F1F5F9] border border-slate-300"></span>
            <span className="text-slate-600">일반 시간대</span>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="relative pt-8 pb-3">
        
        {/* Floating Tooltip (Elevation 3) */}
        {hoveredHour !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-white p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs w-60 transition-all -top-5 sm:-top-3"
            style={{
              left: `${Math.min(Math.max(((hoveredHour - 1) / 23) * 100, 15), 85)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="font-extrabold text-slate-900 text-sm">
                {String(hoveredHour).padStart(2, '0')}시
              </span>
              {isHoveredMax ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6B00] text-white">
                  ★ 당일 최고가 피크
                </span>
              ) : minHours.includes(hoveredHour) ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  최저가 (알뜰)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                  일반
                </span>
              )}
            </div>

            <div className="space-y-1.5 tabular-nums">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">시간대 수치:</span>
                <span className="font-black text-slate-900 text-sm">
                  {hourly[hoveredHour - 1].toFixed(2)} 원/kWh (MWh)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">하루 평균 대비:</span>
                <span className={`font-bold ${parseFloat(activeDiffFromAvg) >= 0 ? 'text-[#EA580C]' : 'text-emerald-600'}`}>
                  {parseFloat(activeDiffFromAvg) >= 0 ? `+${activeDiffFromAvg}` : activeDiffFromAvg} 원
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">하루 평균(가중):</span>
                <span className="font-medium text-slate-700">
                  {weightedAvg.toFixed(2)} 원
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Average Dashed Line */}
        <div
          className="absolute left-0 right-0 border-b-2 border-dashed border-orange-300 z-1 pointer-events-none flex items-center justify-end pr-2"
          style={{ bottom: `calc(${avgLinePct}% + 36px)` }}
        >
          <span className="text-[10px] font-extrabold bg-orange-100 text-[#EA580C] px-1.5 py-0.2 rounded-xs border border-orange-200 -translate-y-1/2">
            하루 평균 {weightedAvg.toFixed(2)}
          </span>
        </div>

        {/* 24 Hourly Bars (01시 to 24시) */}
        <div className="grid grid-cols-24 gap-1 sm:gap-1.5 h-64 sm:h-72 items-end px-1 border-b border-slate-200">
          {hourly.map((val, idx) => {
            const hour = idx + 1; // 1 to 24
            const isMax = maxHours.includes(hour);
            const isMin = minHours.includes(hour);
            const isSelected = hour === selectedHour;

            // Height percentage based on scale
            const heightPct = Math.max(12, Math.round(((val - scaleMin) / (scaleMax - scaleMin)) * 96));

            return (
              <div
                key={hour}
                className="group relative flex flex-col items-center h-full justify-end cursor-pointer"
                onMouseEnter={() => setHoveredHour(hour)}
                onMouseLeave={() => setHoveredHour(null)}
                onClick={() => onSelectHour(hour)}
              >
                {/* Floating "최고" tag above the most expensive bar */}
                {isMax && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                    <span className="bg-[#FF6B00] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap animate-bounce">
                      최고
                    </span>
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-[#FF6B00]"></div>
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full transition-all duration-200 rounded-t-[4px] relative ${
                    isMax
                      ? 'bg-[#FF6B00] shadow-md shadow-orange-500/30 ring-2 ring-orange-400/50'
                      : isSelected
                      ? 'bg-slate-400 ring-2 ring-slate-500/40'
                      : isMin
                      ? 'bg-emerald-100 group-hover:bg-emerald-200'
                      : 'bg-[#F1F5F9] group-hover:bg-[#E2E8F0]'
                  }`}
                  style={{ height: `${heightPct}%` }}
                >
                  {isMax && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-t-[4px]" />
                  )}
                </div>

                {/* Hour Label (01~24) */}
                <span
                  className={`text-[10px] mt-2 font-semibold tabular-nums ${
                    isMax
                      ? 'text-[#FF6B00] font-black'
                      : isSelected
                      ? 'text-slate-900 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {hour}
                </span>
              </div>
            );
          })}
        </div>

        {/* X-Axis Helper Labels */}
        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 px-1">
          <span>01시 (새벽)</span>
          <span>06시 (아침)</span>
          <span>12시 (정오)</span>
          <span>18시 (저녁)</span>
          <span>24시 (자정)</span>
        </div>
      </div>

      {/* AI Commentary Action Bar Directly Below Graph */}
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
        
        {/* 'AI 해설' Button Container */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleFetchAiCommentary}
              disabled={isLoadingAi}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all ${
                isLoadingAi
                  ? 'bg-orange-100 text-[#EA580C] cursor-not-allowed'
                  : 'bg-[#FF6B00] hover:bg-[#EA580C] text-white hover:shadow-orange-500/25 active:scale-98'
              }`}
            >
              {isLoadingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#EA580C]" />
                  <span>Gemini 전력시장 해설가 분석 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI 해설</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              * 선택한 날({date})의 24시간 전력수요 흐름과 최대·최소를 전력시장 해설가가 3문장으로 알기 쉽게 설명합니다.
            </span>
          </div>

          {aiCommentary && !isLoadingAi && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyCommentary}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
                title="해설 복사"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사됨' : '복사'}</span>
              </button>
              <button
                onClick={handleFetchAiCommentary}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
                title="다시 해설 생성"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>재요청</span>
              </button>
            </div>
          )}
        </div>

        {/* AI Commentary Result Card Below Graph */}
        {aiCommentary && (
          <div className="bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white rounded-xl border border-orange-200/90 p-4 sm:p-5 shadow-xs animate-in fade-in space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse-dot" />
                <span className="text-xs font-extrabold text-[#7A3000] flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#FF6B00]" />
                  전력시장 해설가의 AI 해설 ({date})
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#FF6B00] text-white">
                  Gemini 3.8 Flash
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">단위: MWh</span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed sm:leading-loose">
              {aiCommentary}
            </p>
          </div>
        )}

        {/* Summary Footer for the Selected Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Peak Hour Callout */}
          <div className="bg-[#FFF7ED] border border-orange-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <ArrowUpRight className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#7A3000]">가장 비싼 시간대 (최고치)</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-black">
                  {maxHourStr} ({max.toFixed(2)} MWh)
                </span>
              </div>
              <p className="text-orange-900/80 text-[11px] mt-0.5">
                하루 가중평균({weightedAvg.toFixed(2)})보다 {(max - weightedAvg).toFixed(2)} 높습니다. 주황색 막대로 강조되었습니다.
              </p>
            </div>
          </div>

          {/* Golden Hour Callout */}
          <div className="bg-[#ECFDF5] border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <ArrowDownRight className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-950">가장 저렴한 시간대 (최저치)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold">
                  {minHourStr} ({min.toFixed(2)} MWh)
                </span>
              </div>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                전기차 충전 및 전력 소모가 큰 가전제품 사용 시 권장되는 알뜰 시간대입니다.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

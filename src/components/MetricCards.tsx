import React from 'react';
import { TrendingUp, TrendingDown, Clock, Zap, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart2 } from 'lucide-react';
import { DailySmpRecord } from '../data/kpxSmpData';

interface MetricCardsProps {
  currentRecord: DailySmpRecord;
  prevRecord?: DailySmpRecord;
  selectedHour: number; // 1 to 24
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  currentRecord,
  prevRecord,
  selectedHour,
}) => {
  // Find highest hour(s) and lowest hour(s) (1-indexed)
  const maxIndices: number[] = [];
  const minIndices: number[] = [];

  currentRecord.hourly.forEach((val, idx) => {
    if (Math.abs(val - currentRecord.max) < 0.001) maxIndices.push(idx + 1);
    if (Math.abs(val - currentRecord.min) < 0.001) minIndices.push(idx + 1);
  });

  const maxHourLabel = maxIndices.map((h) => `${String(h).padStart(2, '0')}시`).join(', ');
  const minHourLabel = minIndices.map((h) => `${String(h).padStart(2, '0')}시`).join(', ');

  // Selected hour value
  const selectedHourVal = currentRecord.hourly[selectedHour - 1] ?? currentRecord.hourly[0];

  // Daily avg comparison vs prev day
  const avgDelta = prevRecord ? currentRecord.weightedAvg - prevRecord.weightedAvg : 0;
  const avgDeltaPct = prevRecord && prevRecord.weightedAvg > 0
    ? ((avgDelta / prevRecord.weightedAvg) * 100).toFixed(1)
    : '0.0';

  const spread = (currentRecord.max - currentRecord.min).toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      
      {/* 1. Day Weighted Average Card (하루 평균 카드 표시) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-100/40 to-transparent rounded-bl-full pointer-events-none" />
        <div>
          {/* Top */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-[#FF6B00]" />
              하루 가중평균 SMP
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#EA580C] border border-orange-200/60">
              {currentRecord.date}
            </span>
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight tabular-nums">
              {currentRecord.weightedAvg.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-[#64748B]">
              원/kWh
            </span>
          </div>
        </div>

        {/* Bottom Comparison */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {prevRecord ? (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
              avgDelta >= 0 ? 'bg-[#FFF1F2] text-[#E11D48]' : 'bg-[#ECFDF5] text-[#10B981]'
            }`}>
              {avgDelta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span className="tabular-nums">{avgDelta >= 0 ? `+${avgDeltaPct}%` : `${avgDeltaPct}%`}</span>
              <span className="text-[10px] opacity-80 font-normal">vs 전일</span>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px]">기준일 데이터</span>
          )}
          <span className="text-slate-500 text-[11px] tabular-nums">
            전력거래소 육지 정산가
          </span>
        </div>
      </div>

      {/* 2. Highest Peak SMP & Hour Card */}
      <div className="bg-white p-5 rounded-2xl border border-orange-200/90 bg-gradient-to-b from-white to-orange-50/20 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between">
        <div>
          {/* Top */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF6B00]" />
              오늘 최고가 피크 (최대)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FF6B00] text-white shadow-xs">
              최고가 강조
            </span>
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl sm:text-4xl font-black text-[#EA580C] tracking-tight tabular-nums">
              {currentRecord.max.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-[#64748B]">
              원/kWh
            </span>
          </div>
        </div>

        {/* Bottom Hour */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">발생 시간대</span>
          <span className="font-extrabold text-[#0F172A] tabular-nums bg-orange-100/60 px-2 py-0.5 rounded-md text-xs border border-orange-200/50">
            {maxHourLabel}
          </span>
        </div>
      </div>

      {/* 3. Lowest SMP & Hour Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          {/* Top */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-[#10B981]" />
              오늘 최저가 (최소)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#006C49] border border-emerald-200">
              골든타임
            </span>
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight tabular-nums">
              {currentRecord.min.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-[#64748B]">
              원/kWh
            </span>
          </div>
        </div>

        {/* Bottom Hour */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">발생 시간대</span>
          <span className="font-extrabold text-emerald-800 tabular-nums bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200/60">
            {minHourLabel}
          </span>
        </div>
      </div>

      {/* 4. Selected Hour / Spread Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          {/* Top */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              선택 시각 ({String(selectedHour).padStart(2, '0')}시) 시세
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
              1~24시 중
            </span>
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight tabular-nums">
              {selectedHourVal.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-[#64748B]">
              원/kWh
            </span>
          </div>
        </div>

        {/* Bottom Spread */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">당일 가격 편차 (스프레드)</span>
          <span className="font-bold text-slate-800 tabular-nums">
            {spread} 원
          </span>
        </div>
      </div>

    </div>
  );
};

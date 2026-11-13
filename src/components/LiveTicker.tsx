import React from 'react';
import { Activity, Radio, TrendingUp, TrendingDown, Sun, ShieldAlert, Calendar } from 'lucide-react';
import { DailySmpRecord } from '../data/kpxSmpData';

interface LiveTickerProps {
  currentRecord: DailySmpRecord;
  prevRecord?: DailySmpRecord;
  selectedHour: number;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ currentRecord, prevRecord, selectedHour }) => {
  const currentVal = currentRecord.hourly[selectedHour - 1] ?? currentRecord.hourly[0];
  const delta = prevRecord ? currentRecord.weightedAvg - prevRecord.weightedAvg : 0;
  const deltaPct = prevRecord && prevRecord.weightedAvg > 0
    ? ((delta / prevRecord.weightedAvg) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-[#0F172A] text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-6">
        
        {/* Left Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B00]"></span>
          </span>
          <span className="font-bold tracking-wide uppercase text-white flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#FF6B00]" />
            KPX SMP
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#FF6B00]" />
            {currentRecord.date} 육지 시세
          </span>
        </div>

        {/* Ticker Items */}
        <div className="flex items-center gap-6 sm:gap-8 flex-shrink-0 tabular-nums">
          
          {/* Weighted Average */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">하루 가중평균:</span>
            <span className="font-extrabold text-white">{currentRecord.weightedAvg.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400">원/kWh</span>
            {prevRecord && (
              <span className={`flex items-center font-bold text-[11px] ml-0.5 ${delta >= 0 ? 'text-[#F43F5E]' : 'text-[#10B981]'}`}>
                {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {delta >= 0 ? `+${deltaPct}%` : `${deltaPct}%`}
              </span>
            )}
          </div>

          {/* Peak Max */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">최고가(최대):</span>
            <span className="font-extrabold text-[#FF6B00]">{currentRecord.max.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400">원/kWh</span>
          </div>

          {/* Lowest Min */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">최저가(최소):</span>
            <span className="font-extrabold text-emerald-400">{currentRecord.min.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400">원/kWh</span>
          </div>

          {/* Selected Hour Val */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{String(selectedHour).padStart(2, '0')}시 시세:</span>
            <span className="font-extrabold text-white">{currentVal.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400">원/kWh</span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">계통 상태:</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-700/50">
              정상 (안정)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

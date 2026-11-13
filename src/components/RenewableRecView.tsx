import React, { useState } from 'react';
import { Sun, Wind, Coins, ArrowUpRight, ShieldAlert, Award, Sparkles, TrendingUp } from 'lucide-react';
import { MarketSummary } from '../types/market';

interface RenewableRecViewProps {
  summary: MarketSummary;
}

export const RenewableRecView: React.FC<RenewableRecViewProps> = ({ summary }) => {
  // Solar Plant Operator Parameters
  const [plantCapacityKw, setPlantCapacityKw] = useState<number>(100); // 100 kW
  const [dailyHours, setDailyHours] = useState<number>(3.6); // 3.6 hrs
  const [recWeight, setRecWeight] = useState<number>(1.2); // 1.2 rooftop, 1.0 ground

  // Calculations
  const monthlyGenerationKwh = plantCapacityKw * dailyHours * 30; // kWh/month
  const smpRevenue = Math.round(monthlyGenerationKwh * summary.currentSmpLand); // 원
  const recCount = (monthlyGenerationKwh / 1000) * recWeight; // RECs
  const recRevenue = Math.round(recCount * summary.recSpotPrice); // 원
  const totalMonthlyRevenue = smpRevenue + recRevenue;
  const combinedKwhRate = (totalMonthlyRevenue / monthlyGenerationKwh).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 border border-emerald-800/40 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
              <Sun className="w-3.5 h-3.5" />
              <span>신재생에너지 및 REC 현물시장</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              태양광 발전 수익 및 신재생에너지 종합 거래소
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              전력거래소 실시간 계통한계가격(SMP)과 신재생에너지공급인증서(REC) 현물시세를 연동하여 발전사업자 정산액 및 재생에너지 출력제어 현황을 실시간 제공합니다.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-center flex-shrink-0">
            <span className="text-xs text-emerald-300 block">오늘 REC 현물 종가</span>
            <span className="text-2xl font-black text-white tabular-nums">
              {summary.recSpotPrice.toLocaleString()}원
            </span>
            <span className="text-xs text-emerald-400 font-semibold block mt-0.5">
              +{summary.recPriceChange.toLocaleString()}원 (+1.55%)
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Plant Revenue Simulator vs Generation Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Solar Plant Revenue Calculator (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="font-bold text-base text-[#0F172A]">
                태양광 발전소 예상 정산 수익 시뮬레이터
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-[#EA580C]">
              SMP + REC 복합 정산
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Capacity Input */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block mb-1">발전 설비 용량</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={plantCapacityKw}
                  onChange={(e) => setPlantCapacityKw(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-300 px-2 py-1 rounded-lg text-slate-900 font-bold text-sm"
                />
                <span className="text-xs text-slate-500 font-medium">kW</span>
              </div>
            </div>

            {/* Daily Generation Hours */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block mb-1">일평균 발전시간</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="7.0"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Math.max(0.5, parseFloat(e.target.value) || 1.0))}
                  className="w-full bg-white border border-slate-300 px-2 py-1 rounded-lg text-slate-900 font-bold text-sm"
                />
                <span className="text-xs text-slate-500 font-medium">시간</span>
              </div>
            </div>

            {/* REC Weight */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block mb-1">REC 가중치</span>
              <select
                value={recWeight}
                onChange={(e) => setRecWeight(parseFloat(e.target.value))}
                className="w-full bg-white border border-slate-300 px-2 py-1 rounded-lg text-slate-900 font-bold text-sm focus:outline-none"
              >
                <option value={1.0}>일반부지 (1.0)</option>
                <option value={1.2}>건축물/지붕 (1.2)</option>
                <option value={1.5}>수상태양광 (1.5)</option>
                <option value={0.7}>임야 (0.7)</option>
              </select>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs tabular-nums">
            <div className="flex justify-between items-center text-slate-600">
              <span>월간 총 발전량:</span>
              <span className="font-bold text-slate-900 text-sm">
                {monthlyGenerationKwh.toLocaleString()} kWh
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>1. SMP 정산 수익 (단가 {summary.currentSmpLand.toFixed(1)}원):</span>
              <span className="font-bold text-slate-900">
                {smpRevenue.toLocaleString()}원
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>2. REC 발급 및 판매 수익 ({recCount.toFixed(1)} REC):</span>
              <span className="font-bold text-emerald-600">
                {recRevenue.toLocaleString()}원
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
              <span className="text-[#0F172A]">월 예상 총 정산수익:</span>
              <span className="text-xl font-black text-[#FF6B00]">
                {totalMonthlyRevenue.toLocaleString()}원
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <span>kWh당 환산 종합단가 (SMP+REC):</span>
              <span className="font-bold text-slate-700">{combinedKwhRate} 원/kWh</span>
            </div>
          </div>

        </div>

        {/* Right: National Renewable Mix & Jeju Curtailment (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Generation Mix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="font-bold text-sm text-[#0F172A] mb-3 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              국내 실시간 재생에너지 발전원별 비중
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>태양광 (Solar)</span>
                  <span className="text-amber-600 font-bold tabular-nums">63.5%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '63.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>풍력 (Wind)</span>
                  <span className="text-sky-600 font-bold tabular-nums">18.2%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '18.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>바이오 (Bio)</span>
                  <span className="text-emerald-600 font-bold tabular-nums">11.8%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '11.8%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>수력 & 기타</span>
                  <span className="text-slate-600 font-bold tabular-nums">6.5%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: '6.5%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Jeju Curtailment Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                제주 출력제어(Curtailment) 모니터링
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                현재: 미발령 (정상)
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              제주 지역 내 풍력·태양광 과잉 발전 시 전력망 안정화를 위해 발령되는 출력제어 누적 횟수 및 실시간 현황입니다.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-500 block">올해 누적 출력제어</span>
                <span className="font-bold text-slate-900 text-sm">34회</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-500 block">플러스(+) SMP 적용률</span>
                <span className="font-bold text-emerald-600 text-sm">92.4%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

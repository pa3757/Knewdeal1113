import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Radio,
  Gauge,
  BatteryCharging,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { MarketSummary, GridNotice } from '../types/market';
import { DailySmpRecord } from '../data/kpxSmpData';

interface GridStatusCardProps {
  summary: MarketSummary;
  notices: GridNotice[];
  currentRecord: DailySmpRecord;
  selectedHour: number; // 1 to 24
  onNavigateCalculator: () => void;
}

export const GridStatusCard: React.FC<GridStatusCardProps> = ({
  summary,
  notices,
  currentRecord,
  selectedHour,
  onNavigateCalculator,
}) => {
  // In-memory API key only — NOT stored in localStorage, sessionStorage, or cookies!
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRealtime, setIsRealtime] = useState<boolean>(false);
  const [referenceTime, setReferenceTime] = useState<string>(
    `${currentRecord.date} ${String(selectedHour).padStart(2, '0')}:00`
  );

  // Real-time API returned data
  const [realtimeData, setRealtimeData] = useState<{
    currentDemand: number;
    currentCapacity: number;
    reserveMw: number;
    reserveMargin: number;
    gridStatus: string;
    smp?: number;
    sourceUrl?: string;
  } | null>(null);

  // Fallback to example data if API hasn't loaded or on error
  const effectiveDemand = realtimeData?.currentDemand ?? summary.currentDemand;
  const effectiveCapacity = realtimeData?.currentCapacity ?? summary.currentCapacity;
  const effectiveReserveMw = realtimeData?.reserveMw ?? (summary.currentCapacity - summary.currentDemand);
  const effectiveReserveMargin = realtimeData?.reserveMargin ?? summary.reserveMargin;
  const effectiveGridStatus = realtimeData?.gridStatus ?? summary.gridStatus;

  const currentVal = realtimeData?.smp ?? (currentRecord.hourly[selectedHour - 1] ?? currentRecord.hourly[0]);
  const isMax = Math.abs(currentVal - currentRecord.max) < 0.001;
  const isMin = Math.abs(currentVal - currentRecord.min) < 0.001;

  // Calculate percentage of demand vs capacity
  const demandPct = Math.min(100, Math.round((effectiveDemand / Math.max(1, effectiveCapacity)) * 100));

  // Handle fetching real-time data from data.go.kr endpoint
  const handleFetchRealtime = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('인증키를 입력해 주세요. (공공데이터포털 일반 인증키)');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/realtime-smp-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceKey: apiKey.trim(),
          date: currentRecord.date,
          hour: selectedHour,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        // If failed: show error inside section, keep example data intact!
        setErrorMessage(data.error || `공공데이터 요청 실패 (상태코드: ${res.status})`);
        return;
      }

      // If succeeded: update badge to '실시간', update reference time & metrics!
      setIsRealtime(true);
      setReferenceTime(data.timestamp || `${data.tradeDate} ${String(data.hour).padStart(2, '0')}:00`);
      setRealtimeData({
        currentDemand: data.currentDemand,
        currentCapacity: data.currentCapacity,
        reserveMw: data.reserveMw,
        reserveMargin: data.reserveMargin,
        gridStatus: data.gridStatus,
        smp: data.smp,
        sourceUrl: data.sourceUrl,
      });
      setErrorMessage(null);
    } catch (err: any) {
      // Network failure: show error, keep example data intact
      setErrorMessage(`네트워크 통신 오류: ${err.message || '요청 제한 시간 초과'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. 지금 전력 수급 섹션 (연결 대상 API: https://apis.data.go.kr/B552115/SmpWithForecastDemand) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        
        {/* Top Header: Title, Realtime/Example Badge, and Controls */}
        <div className="space-y-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            
            {/* Title & Badge */}
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="font-bold text-sm sm:text-base text-[#0F172A]">
                지금 전력 수급
              </h3>
              
              {/* Badge: '예시 데이터' -> '실시간' upon success */}
              {isRealtime ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  실시간
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  예시 데이터
                </span>
              )}
            </div>

            {/* Reference Time */}
            <span className="text-[11px] text-slate-500 font-medium tabular-nums bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
              기준: {referenceTime}
            </span>
          </div>

          {/* Right Top Area: '인증키' Masked Input and '불러오기' Button */}
          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFetchRealtime();
                }}
                placeholder="공공데이터 인증키 입력"
                aria-label="인증키 입력"
                autoComplete="off"
                spellCheck="false"
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
              />
              {apiKey && (
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title={showKey ? '가리기' : '보기'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <button
              onClick={handleFetchRealtime}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF6B00] hover:bg-[#EA580C] text-white disabled:opacity-50 transition-all shadow-xs flex-shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>불러오는 중</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>불러오기</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[10px] text-slate-400 truncate">
            요청 주소: <span className="font-mono text-slate-500">https://apis.data.go.kr/B552115/SmpWithForecastDemand</span>
          </div>
        </div>

        {/* Error Alert inside Section (실패하면 오류 내용을 섹션 안에 표시) */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-bold flex items-center justify-between text-rose-900">
                <span>API 불러오기 실패</span>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-800 text-[11px] underline"
                >
                  닫기
                </button>
              </div>
              <p className="mt-1 text-rose-700 leading-relaxed font-mono text-[11px] break-all">
                {errorMessage}
              </p>
              <p className="mt-1.5 text-[11px] text-slate-500">
                ※ 화면은 기존 예시 데이터를 그대로 유지합니다.
              </p>
            </div>
          </div>
        )}

        {/* Real-time Success Pill */}
        {isRealtime && !errorMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>실시간 전력거래소 수급 데이터 연결됨</span>
            </div>
            {realtimeData?.smp && (
              <span className="font-bold tabular-nums text-emerald-700">
                SMP {realtimeData.smp.toFixed(2)}원
              </span>
            )}
          </div>
        )}

        {/* Grid Status Pill */}
        <div className="flex items-center justify-between mt-3 mb-2">
          <span className="text-xs text-slate-600 font-medium">계통 안정성 등급</span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              effectiveGridStatus === '정상'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : effectiveGridStatus === '준비' || effectiveGridStatus === '관심'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {effectiveGridStatus} ({effectiveGridStatus === '정상' ? '안정' : '주의'})
          </span>
        </div>

        {/* Progress Bar of Demand vs Capacity */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">현재 계통부하율</span>
            <span className="font-bold text-slate-900 tabular-nums">{demandPct}%</span>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                demandPct > 90
                  ? 'bg-rose-500'
                  : demandPct > 80
                  ? 'bg-amber-500'
                  : 'bg-[#FF6B00]'
              }`}
              style={{ width: `${demandPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 tabular-nums">
            <span>수요: {effectiveDemand.toLocaleString()} MW</span>
            <span>공급력: {effectiveCapacity.toLocaleString()} MW</span>
          </div>
        </div>

        {/* Reserve Detail Box */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-center text-xs">
          <div>
            <div className="text-slate-500 text-[11px]">공급예비력</div>
            <div className="font-extrabold text-slate-900 text-sm mt-0.5 tabular-nums">
              {effectiveReserveMw.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">MW</span>
            </div>
          </div>
          <div className="border-l border-slate-200 pl-2">
            <div className="text-slate-500 text-[11px]">공급예비율</div>
            <div
              className={`font-extrabold text-sm mt-0.5 tabular-nums ${
                effectiveReserveMargin >= 10
                  ? 'text-emerald-600'
                  : effectiveReserveMargin >= 5
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {effectiveReserveMargin.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Reserve Level Guide */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span className="text-emerald-600 font-bold">● 정상 (&gt;10%)</span>
          <span>준비 (5~10%)</span>
          <span>관심 (4~5%)</span>
          <span>주의 (3~4%)</span>
          <span className="text-rose-500">심각 (&lt;2%)</span>
        </div>
      </div>

      {/* 2. KPX Grid Notices & Real-time Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF6B00]" />
            <h3 className="font-bold text-sm text-[#0F172A]">전력거래소 실시간 속보</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">{currentRecord.date} 공시</span>
        </div>

        <div className="space-y-2.5">
          <div className="p-2.5 rounded-xl border bg-orange-50/60 border-orange-200 text-xs">
            <div className="flex items-start gap-1.5">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#FF6B00] text-white flex-shrink-0 mt-0.5">
                피크
              </span>
              <p className="font-medium text-slate-900 leading-relaxed">
                당일 최고 단가 <strong>{currentRecord.max.toFixed(2)}원/kWh</strong> 기록. 주황색 막대 구간 집중 관리 권장.
              </p>
            </div>
          </div>

          {notices.slice(1, 3).map((notice) => (
            <div
              key={notice.id}
              className="p-2.5 rounded-xl border bg-slate-50/60 border-slate-200/80 text-xs"
            >
              <p className="font-medium text-slate-800 leading-relaxed">{notice.title}</p>
              <div className="text-[10px] text-slate-400 mt-1 tabular-nums">
                수신 시각 {notice.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. EV & Smart Consumption Recommendation Banner */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 text-orange-100 text-xs font-semibold mb-1">
          <BatteryCharging className="w-4 h-4 text-white" />
          <span>스마트 전력 소비 팁 ({String(selectedHour).padStart(2, '0')}시)</span>
        </div>
        <h4 className="font-bold text-sm sm:text-base leading-snug">
          선택하신 {String(selectedHour).padStart(2, '0')}시는 단가{' '}
          <span className="underline decoration-white/60 font-black">{currentVal.toFixed(2)}원</span> 입니다
        </h4>
        <p className="text-xs text-orange-100 mt-1.5 leading-relaxed">
          {isMax
            ? '오늘 가장 비싼 피크 시간대(주황색)입니다. 고부하 기기 사용을 분산하여 누진요금과 피크 부하를 회피하세요.'
            : isMin
            ? '오늘 가장 저렴한 알뜰 골든타임입니다. 전기차 및 ESS 충전 시 전기요금을 최대 수준으로 절감할 수 있습니다.'
            : `하루 가중평균(${currentRecord.weightedAvg.toFixed(2)}원) 대비 ${
                currentVal > currentRecord.weightedAvg
                  ? `+${(currentVal - currentRecord.weightedAvg).toFixed(2)}원 높습니다.`
                  : `${(currentVal - currentRecord.weightedAvg).toFixed(2)}원 낮아 경제적입니다.`
              }`}
        </p>
        <button
          onClick={onNavigateCalculator}
          className="mt-3.5 inline-flex items-center gap-1.5 bg-white text-[#EA580C] px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-50 transition-all shadow-xs cursor-pointer"
        >
          <span>전기요금 계산기로 절감액 확인</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

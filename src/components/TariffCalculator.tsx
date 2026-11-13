import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight, Zap, CheckCircle2, DollarSign, Car, Building2, Home, Factory } from 'lucide-react';
import { TariffCalculationResult } from '../types/market';

export const TariffCalculator: React.FC = () => {
  const [customerType, setCustomerType] = useState<'residential' | 'general' | 'industrial' | 'ev'>('residential');
  const [residentialVoltage, setResidentialVoltage] = useState<'low' | 'high'>('low'); // 저압 vs 고압
  const [monthlyKwh, setMonthlyKwh] = useState<number>(350);
  const [contractKw, setContractKw] = useState<number>(10);
  const [season, setSeason] = useState<'summer' | 'winter' | 'other'>('other');
  
  // EV specific state
  const [evBatteryKwh, setEvBatteryKwh] = useState<number>(65); // e.g. Ioniq 5 / EV6
  const [evMonthlyKm, setEvMonthlyKm] = useState<number>(1500); // 1,500 km per month
  const [evEfficiency, setEvEfficiency] = useState<number>(5.5); // 5.5 km/kWh

  // Calculate fees
  const tariffResult = useMemo((): TariffCalculationResult => {
    let baseFee = 0;
    let energyFee = 0;
    const climateUnit = 9.0; // 기후환경요금 원/kWh
    const fuelAdjUnit = 5.0; // 연료비조정액 원/kWh
    let tierInfo = '';

    if (customerType === 'residential') {
      const isLow = residentialVoltage === 'low';
      // Low voltage: 1단계 910/120.0, 2단계 1600/214.6, 3단계 7300/307.3
      // High voltage: 1단계 730/105.0, 2단계 1260/174.0, 3단계 6060/243.4
      const b1 = isLow ? 910 : 730;
      const b2 = isLow ? 1600 : 1260;
      const b3 = isLow ? 7300 : 6060;

      const r1 = isLow ? 120.0 : 105.0;
      const r2 = isLow ? 214.6 : 174.0;
      const r3 = isLow ? 307.3 : 243.4;

      if (monthlyKwh <= 200) {
        baseFee = b1;
        energyFee = monthlyKwh * r1;
        tierInfo = '누진 1단계 (알뜰 소비 구간)';
      } else if (monthlyKwh <= 400) {
        baseFee = b2;
        energyFee = 200 * r1 + (monthlyKwh - 200) * r2;
        tierInfo = '누진 2단계 (표준 가구 구간)';
      } else {
        baseFee = b3;
        energyFee = 200 * r1 + 200 * r2 + (monthlyKwh - 400) * r3;
        tierInfo = '누진 3단계 (최고 누진 구간 - 절전 필요)';
      }
    } else if (customerType === 'general') {
      // 일반용(갑)
      baseFee = contractKw * 6160;
      const avgRate = season === 'summer' ? 142.5 : season === 'winter' ? 134.8 : 109.3;
      energyFee = monthlyKwh * avgRate;
      tierInfo = '일반용(갑)I 요금제 적용';
    } else if (customerType === 'industrial') {
      // 산업용(갑)
      baseFee = contractKw * 7470;
      const avgRate = season === 'summer' ? 153.2 : season === 'winter' ? 144.1 : 118.5;
      energyFee = monthlyKwh * avgRate;
      tierInfo = '산업용(갑)II 시간대별 요금제';
    } else {
      // EV 전용 계산
      const evNeededKwh = Math.round(evMonthlyKm / evEfficiency);
      baseFee = 2400; // 충전기 기본료
      // 완속 심야 평균 190원/kWh vs 주간 320원/kWh
      energyFee = evNeededKwh * 210.0;
      tierInfo = `전기차 월 약 ${evNeededKwh} kWh 소비 기준`;
    }

    const climateFee = monthlyKwh * climateUnit;
    const fuelAdjFee = monthlyKwh * fuelAdjUnit;
    const subtotal = baseFee + energyFee + climateFee + fuelAdjFee;
    const vat = Math.round(subtotal * 0.1);
    const powerFund = Math.floor((subtotal * 0.037) / 10) * 10;
    const totalFee = Math.floor((subtotal + vat + powerFund) / 10) * 10;

    return {
      baseFee: Math.round(baseFee),
      energyFee: Math.round(energyFee),
      climateFee: Math.round(climateFee),
      fuelAdjFee: Math.round(fuelAdjFee),
      vat,
      powerFund,
      totalFee,
      tierInfo,
    };
  }, [customerType, residentialVoltage, monthlyKwh, contractKw, season, evMonthlyKm, evEfficiency]);

  // Peak Shifting savings simulation (피크 사용량 20%를 경부하 시간대로 옮길 때)
  const potentialSavings = Math.round(tariffResult.totalFee * 0.14);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-[#FF6B00]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            맞춤형 전기요금 계산기 & 절감 시뮬레이터
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          한국전력공사(KEPCO) 공식 요금표(기본요금, 누진구간, 기후환경요금, 연료비조정단가)를 반영한 실시간 정산 시뮬레이터입니다.
        </p>
      </div>

      {/* Main Grid: Inputs vs Bill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          
          {/* Customer Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              계약 및 용도 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setCustomerType('residential')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  customerType === 'residential'
                    ? 'border-[#FF6B00] bg-orange-50/50 text-[#EA580C] font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-xs">주택용 (가정집)</span>
              </button>

              <button
                onClick={() => setCustomerType('general')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  customerType === 'general'
                    ? 'border-[#FF6B00] bg-orange-50/50 text-[#EA580C] font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs">일반용 (상가/매장)</span>
              </button>

              <button
                onClick={() => setCustomerType('industrial')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  customerType === 'industrial'
                    ? 'border-[#FF6B00] bg-orange-50/50 text-[#EA580C] font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Factory className="w-5 h-5" />
                <span className="text-xs">산업용 (공장/IDC)</span>
              </button>

              <button
                onClick={() => setCustomerType('ev')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  customerType === 'ev'
                    ? 'border-[#FF6B00] bg-orange-50/50 text-[#EA580C] font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Car className="w-5 h-5" />
                <span className="text-xs">전기차 (EV 전용)</span>
              </button>
            </div>
          </div>

          {/* Sub Option: Residential Voltage */}
          {customerType === 'residential' && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">공급 전압 구분:</span>
              <div className="flex bg-white p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setResidentialVoltage('low')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    residentialVoltage === 'low' ? 'bg-[#FF6B00] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  주택용 저압 (단독/빌라)
                </button>
                <button
                  onClick={() => setResidentialVoltage('high')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    residentialVoltage === 'high' ? 'bg-[#FF6B00] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  주택용 고압 (대단지 아파트)
                </button>
              </div>
            </div>
          )}

          {/* Sub Option: Contract kW (for General & Industrial) */}
          {(customerType === 'general' || customerType === 'industrial') && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">계약전력 설정:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="3"
                  max="500"
                  value={contractKw}
                  onChange={(e) => setContractKw(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-right font-bold text-slate-900"
                />
                <span className="text-slate-500 font-medium">kW</span>
              </div>
            </div>
          )}

          {/* Season Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">적용 계절:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSeason('summer')}
                className={`px-3 py-1.5 rounded-lg border font-semibold ${season === 'summer' ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                여름철 (7~8월)
              </button>
              <button
                onClick={() => setSeason('winter')}
                className={`px-3 py-1.5 rounded-lg border font-semibold ${season === 'winter' ? 'bg-sky-50 border-sky-300 text-sky-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                겨울철 (12~2월)
              </button>
              <button
                onClick={() => setSeason('other')}
                className={`px-3 py-1.5 rounded-lg border font-semibold ${season === 'other' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                기타계절 (봄/가을)
              </button>
            </div>
          </div>

          {/* Monthly kWh Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                월간 예상 전기 사용량
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={monthlyKwh}
                  onChange={(e) => setMonthlyKwh(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 px-3 py-1 border border-slate-300 rounded-lg text-right font-extrabold text-[#0F172A] text-sm tabular-nums focus:outline-none focus:border-[#FF6B00]"
                />
                <span className="text-xs font-semibold text-slate-500">kWh</span>
              </div>
            </div>

            <input
              type="range"
              min="50"
              max="1500"
              step="10"
              value={monthlyKwh}
              onChange={(e) => setMonthlyKwh(parseInt(e.target.value))}
              className="w-full accent-[#FF6B00] cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px] mr-1">빠른 선택:</span>
              <button onClick={() => setMonthlyKwh(180)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">
                1인 가구 (180kWh)
              </button>
              <button onClick={() => setMonthlyKwh(330)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">
                3~4인 표준 (330kWh)
              </button>
              <button onClick={() => setMonthlyKwh(480)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">
                대용량/다인 (480kWh)
              </button>
            </div>
          </div>

          {/* EV specific inputs */}
          {customerType === 'ev' && (
            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200 space-y-3 text-xs">
              <div className="font-bold text-orange-950 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-[#EA580C]" />
                전기차 충전 세부 파라미터
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-600 text-[11px]">월간 주행거리:</span>
                  <input
                    type="number"
                    value={evMonthlyKm}
                    onChange={(e) => setEvMonthlyKm(parseInt(e.target.value) || 1000)}
                    className="w-full mt-1 px-2.5 py-1 bg-white border border-orange-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <span className="text-slate-600 text-[11px]">차량 전비 (km/kWh):</span>
                  <input
                    type="number"
                    step="0.1"
                    value={evEfficiency}
                    onChange={(e) => setEvEfficiency(parseFloat(e.target.value) || 5.0)}
                    className="w-full mt-1 px-2.5 py-1 bg-white border border-orange-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Bill Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">예상 청구 금액</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#EA580C]">
                {tariffResult.tierInfo}
              </span>
            </div>

            {/* Big Total Price */}
            <div className="my-4">
              <span className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight tabular-nums">
                {tariffResult.totalFee.toLocaleString()}
              </span>
              <span className="text-lg font-bold text-slate-600 ml-1.5">원</span>
              <p className="text-[11px] text-slate-400 mt-1">
                * 부가가치세(10%) 및 전력기금(3.7%) 포함 최종 예상액
              </p>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs tabular-nums">
              <div className="flex justify-between items-center text-slate-600">
                <span>기본요금</span>
                <span className="font-semibold text-slate-900">{tariffResult.baseFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>전력량요금</span>
                <span className="font-semibold text-slate-900">{tariffResult.energyFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>기후환경요금 (9.0원/kWh)</span>
                <span className="font-semibold text-slate-900">{tariffResult.climateFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>연료비조정액 (+5.0원/kWh)</span>
                <span className="font-semibold text-slate-900">{tariffResult.fuelAdjFee.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pt-1.5 border-t border-slate-100">
                <span>부가가치세 (10%)</span>
                <span>{tariffResult.vat.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>전력산업기반기금 (3.7%)</span>
                <span>{tariffResult.powerFund.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* Peak Shifting Smart Savings Card */}
          <div className="mt-6 p-4 rounded-xl bg-[#ECFDF5] border border-emerald-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>피크 분산 시 예상 절감 혜택</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              최대부하 시간대(16~18시) 소비의 20%를 경부하 시간대(23~09시)로 전환 시:
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs text-emerald-800 font-semibold">월 예상 절감액</span>
              <span className="text-base font-extrabold text-emerald-700 tabular-nums">
                약 -{potentialSavings.toLocaleString()}원 / 월
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

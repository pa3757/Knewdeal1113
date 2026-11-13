import React, { useState } from 'react';
import { X, Bell, ShieldAlert, Check, Sparkles, Send, Smartphone } from 'lucide-react';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({ isOpen, onClose }) => {
  const [smpThreshold, setSmpThreshold] = useState<number>(165);
  const [reserveThreshold, setReserveThreshold] = useState<number>(10);
  const [enableGoldenHour, setEnableGoldenHour] = useState<boolean>(true);
  const [enablePeakPush, setEnablePeakPush] = useState<boolean>(true);
  const [showSimulatedPush, setShowSimulatedPush] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleSendTestPush = () => {
    setShowSimulatedPush(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F172A]">
                실시간 전력 시세 & 피크 알림 설정
              </h3>
              <p className="text-xs text-slate-500">
                원하는 임계치를 설정하여 피크 요금 폭탄을 사전에 방지하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* SMP Spike Alert */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="peakPush"
                  checked={enablePeakPush}
                  onChange={(e) => setEnablePeakPush(e.target.checked)}
                  className="rounded text-[#FF6B00] accent-[#FF6B00] w-4 h-4"
                />
                <label htmlFor="peakPush" className="font-bold text-slate-800">
                  도매가격(SMP) 급등 경보
                </label>
              </div>
              <span className="font-extrabold text-[#FF6B00] text-sm tabular-nums">
                {smpThreshold} 원/kWh 초과 시
              </span>
            </div>
            <input
              type="range"
              min="120"
              max="220"
              step="5"
              value={smpThreshold}
              onChange={(e) => setSmpThreshold(parseInt(e.target.value))}
              disabled={!enablePeakPush}
              className="w-full accent-[#FF6B00] cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              해당 시간대에 대형 냉난방기 절전 및 에너지 절감 지침 알림톡 발송
            </p>
          </div>

          {/* Reserve Margin Alert */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                국가 전력망 공급예비율 비상 경보
              </span>
              <span className="font-extrabold text-rose-600 text-sm tabular-nums">
                {reserveThreshold}% 미만 진입 시
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="15"
              value={reserveThreshold}
              onChange={(e) => setReserveThreshold(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              전력거래소 '준비' 또는 '관심' 단계 발령 시 즉시 긴급 팝업 제공
            </p>
          </div>

          {/* Golden Time Notification */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 block">
                새벽 최저가(골든타임) 전기차 충전 알림
              </span>
              <span className="text-[11px] text-slate-500">
                매일 밤 22:30 최저 요금 시간대(02:00~06:00) 예약 충전 권장 알림
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableGoldenHour}
              onChange={(e) => setEnableGoldenHour(e.target.checked)}
              className="rounded text-[#FF6B00] accent-[#FF6B00] w-4 h-4"
            />
          </div>

          {/* Test Simulator preview */}
          {showSimulatedPush && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-slate-800 animate-in fade-in">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                  <Smartphone className="w-4 h-4 text-[#EA580C]" />
                  <span>[카카오톡 알림톡 / 푸시 수신 모의 테스트]</span>
                </div>
                <button
                  onClick={() => setShowSimulatedPush(false)}
                  className="text-amber-800 hover:text-amber-950 text-[10px] font-bold"
                >
                  닫기
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-950">
                <strong>[Electric Pulse 피크 알림]</strong><br />
                오늘 17:00~18:00 SMP가 <strong>176.80원/kWh</strong>로 설정하신 기준({smpThreshold}원)을 초과했습니다! 고부하 전기기기 사용을 경부하 시간대로 조정하여 전기요금을 절약하세요.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleSendTestPush}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
            <span>테스트 알림 발송</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200 text-xs font-semibold"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#EA580C] text-white text-xs font-bold shadow-xs transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>저장 완료</span>
                </>
              ) : (
                <span>설정 저장하기</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

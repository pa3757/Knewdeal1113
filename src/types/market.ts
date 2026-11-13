export interface HourlyRate {
  hour: number; // 0 to 23
  timeLabel: string; // '00:00', '01:00', etc.
  smpLand: number; // 원/kWh
  smpJeju: number; // 원/kWh
  forecastSmp: number; // 원/kWh
  demandMw: number; // 계통수요 (MW)
  capacityMw: number; // 공급능력 (MW)
  reserveRatio: number; // %
  loadTier: 'light' | 'medium' | 'peak'; // 경부하 | 중간부하 | 최대부하
  tierName: string;
  isCurrent?: boolean;
  recommendation: 'charge' | 'normal' | 'conserve'; // 충전권장 | 일반 | 절전권장
}

export interface MarketSummary {
  currentHour: number;
  currentSmpLand: number;
  currentSmpJeju: number;
  prevDaySmpChange: number; // %
  prevHourSmpChange: number; // 원
  todayAvgSmp: number;
  todayAvgChange: number; // %
  todayMaxSmp: number;
  todayMaxHour: number;
  todayMinSmp: number;
  todayMinHour: number;
  currentDemand: number; // MW
  currentCapacity: number; // MW
  reserveMargin: number; // %
  gridStatus: '정상' | '준비' | '관심' | '주의' | '경계' | '심각';
  renewableRatio: number; // %
  recSpotPrice: number; // 원/REC
  recPriceChange: number; // 원
  gridFrequency: number; // Hz (e.g. 60.01)
}

export interface GridNotice {
  id: string;
  type: 'alert' | 'info' | 'forecast' | 'market';
  title: string;
  timestamp: string;
  urgent?: boolean;
}

export interface TariffCalculationResult {
  baseFee: number;
  energyFee: number;
  climateFee: number;
  fuelAdjFee: number;
  vat: number;
  powerFund: number;
  totalFee: number;
  tierInfo?: string;
}

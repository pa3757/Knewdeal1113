import { HourlyRate, MarketSummary, GridNotice } from '../types/market';

export const INITIAL_HOURLY_DATA: HourlyRate[] = [
  { hour: 0, timeLabel: '00:00', smpLand: 118.4, smpJeju: 122.1, forecastSmp: 119.0, demandMw: 58200, capacityMw: 87500, reserveRatio: 33.5, loadTier: 'light', tierName: '경부하', recommendation: 'charge' },
  { hour: 1, timeLabel: '01:00', smpLand: 112.1, smpJeju: 116.3, forecastSmp: 113.5, demandMw: 55400, capacityMw: 87500, reserveRatio: 36.7, loadTier: 'light', tierName: '경부하', recommendation: 'charge' },
  { hour: 2, timeLabel: '02:00', smpLand: 107.6, smpJeju: 111.8, forecastSmp: 108.2, demandMw: 53800, capacityMw: 87500, reserveRatio: 38.5, loadTier: 'light', tierName: '경부하', recommendation: 'charge' },
  { hour: 3, timeLabel: '03:00', smpLand: 104.2, smpJeju: 108.5, forecastSmp: 105.0, demandMw: 52900, capacityMw: 87500, reserveRatio: 39.5, loadTier: 'light', tierName: '경부하', recommendation: 'charge' },
  { hour: 4, timeLabel: '04:00', smpLand: 106.8, smpJeju: 110.2, forecastSmp: 107.4, demandMw: 53600, capacityMw: 87500, reserveRatio: 38.7, loadTier: 'light', tierName: '경부하', recommendation: 'charge' },
  { hour: 5, timeLabel: '05:00', smpLand: 115.3, smpJeju: 119.0, forecastSmp: 116.1, demandMw: 56100, capacityMw: 87500, reserveRatio: 35.9, loadTier: 'light', tierName: '경부하', recommendation: 'charge' },
  { hour: 6, timeLabel: '06:00', smpLand: 128.7, smpJeju: 133.4, forecastSmp: 127.8, demandMw: 60800, capacityMw: 87500, reserveRatio: 30.5, loadTier: 'light', tierName: '경부하', recommendation: 'charge' },
  { hour: 7, timeLabel: '07:00', smpLand: 136.2, smpJeju: 141.0, forecastSmp: 135.5, demandMw: 65400, capacityMw: 87500, reserveRatio: 25.3, loadTier: 'light', tierName: '경부하', recommendation: 'charge' },
  { hour: 8, timeLabel: '08:00', smpLand: 145.9, smpJeju: 150.2, forecastSmp: 144.3, demandMw: 70800, capacityMw: 87500, reserveRatio: 19.1, loadTier: 'light', tierName: '경부하', recommendation: 'normal' },
  { hour: 9, timeLabel: '09:00', smpLand: 154.6, smpJeju: 159.8, forecastSmp: 153.2, demandMw: 74200, capacityMw: 87500, reserveRatio: 15.2, loadTier: 'medium', tierName: '중간부하', recommendation: 'normal' },
  { hour: 10, timeLabel: '10:00', smpLand: 168.3, smpJeju: 174.5, forecastSmp: 166.8, demandMw: 77800, capacityMw: 87500, reserveRatio: 11.1, loadTier: 'peak', tierName: '최대부하', recommendation: 'conserve' },
  { hour: 11, timeLabel: '11:00', smpLand: 172.4, smpJeju: 179.1, forecastSmp: 171.0, demandMw: 78900, capacityMw: 87500, reserveRatio: 9.8, loadTier: 'peak', tierName: '최대부하', recommendation: 'conserve' },
  { hour: 12, timeLabel: '12:00', smpLand: 148.5, smpJeju: 138.2, forecastSmp: 146.9, demandMw: 71200, capacityMw: 87500, reserveRatio: 18.6, loadTier: 'medium', tierName: '중간부하 (태양광 여유)', recommendation: 'normal' },
  { hour: 13, timeLabel: '13:00', smpLand: 152.0, smpJeju: 142.6, forecastSmp: 150.8, demandMw: 74600, capacityMw: 87500, reserveRatio: 14.7, loadTier: 'medium', tierName: '중간부하', recommendation: 'normal' },
  { hour: 14, timeLabel: '14:00', smpLand: 165.7, smpJeju: 168.4, forecastSmp: 164.2, demandMw: 77500, capacityMw: 87500, reserveRatio: 11.4, loadTier: 'peak', tierName: '최대부하', recommendation: 'conserve' },
  { hour: 15, timeLabel: '15:00', smpLand: 138.45, smpJeju: 144.1, forecastSmp: 139.2, demandMw: 72450, capacityMw: 86200, reserveRatio: 19.0, loadTier: 'medium', tierName: '중간부하', recommendation: 'normal', isCurrent: true },
  { hour: 16, timeLabel: '16:00', smpLand: 159.8, smpJeju: 166.5, forecastSmp: 161.4, demandMw: 76300, capacityMw: 86200, reserveRatio: 13.0, loadTier: 'peak', tierName: '최대부하', recommendation: 'conserve' },
  { hour: 17, timeLabel: '17:00', smpLand: 176.8, smpJeju: 184.2, forecastSmp: 178.5, demandMw: 79800, capacityMw: 86200, reserveRatio: 8.0, loadTier: 'peak', tierName: '최대피크', recommendation: 'conserve' },
  { hour: 18, timeLabel: '18:00', smpLand: 171.2, smpJeju: 178.9, forecastSmp: 170.0, demandMw: 78200, capacityMw: 86200, reserveRatio: 10.2, loadTier: 'peak', tierName: '최대부하', recommendation: 'conserve' },
  { hour: 19, timeLabel: '19:00', smpLand: 162.5, smpJeju: 169.3, forecastSmp: 160.8, demandMw: 75900, capacityMw: 86200, reserveRatio: 13.6, loadTier: 'medium', tierName: '중간부하', recommendation: 'normal' },
  { hour: 20, timeLabel: '20:00', smpLand: 151.0, smpJeju: 156.7, forecastSmp: 149.5, demandMw: 72100, capacityMw: 86200, reserveRatio: 19.6, loadTier: 'medium', tierName: '중간부하', recommendation: 'normal' },
  { hour: 21, timeLabel: '21:00', smpLand: 143.6, smpJeju: 148.2, forecastSmp: 142.0, demandMw: 68400, capacityMw: 86200, reserveRatio: 26.0, loadTier: 'medium', tierName: '중간부하', recommendation: 'normal' },
  { hour: 22, timeLabel: '22:00', smpLand: 133.8, smpJeju: 137.9, forecastSmp: 132.5, demandMw: 64100, capacityMw: 86200, reserveRatio: 34.5, loadTier: 'light', tierName: '경부하', recommendation: 'charge' },
  { hour: 23, timeLabel: '23:00', smpLand: 124.5, smpJeju: 129.0, forecastSmp: 123.8, demandMw: 60500, capacityMw: 86200, reserveRatio: 42.5, loadTier: 'light', tierName: '경부하', recommendation: 'charge' },
];

export const INITIAL_SUMMARY: MarketSummary = {
  currentHour: 15,
  currentSmpLand: 138.45,
  currentSmpJeju: 144.10,
  prevDaySmpChange: 4.2,
  prevHourSmpChange: -27.25,
  todayAvgSmp: 142.10,
  todayAvgChange: -2.8,
  todayMaxSmp: 176.80,
  todayMaxHour: 17,
  todayMinSmp: 104.20,
  todayMinHour: 3,
  currentDemand: 72450,
  currentCapacity: 86200,
  reserveMargin: 19.0,
  gridStatus: '정상',
  renewableRatio: 19.4,
  recSpotPrice: 78400,
  recPriceChange: 1200,
  gridFrequency: 60.01,
};

export const GRID_NOTICES: GridNotice[] = [
  {
    id: '1',
    type: 'forecast',
    title: '금일 17:00~18:00 최대부하 예상 (SMP 176.8원 육박), 공조기 순차 절전 권장',
    timestamp: '15:20',
    urgent: true,
  },
  {
    id: '2',
    type: 'market',
    title: '전력거래소(KPX) 실시간 정산 SMP 가중평균가 전주 대비 2.8% 하향 안정세',
    timestamp: '14:45',
    urgent: false,
  },
  {
    id: '3',
    type: 'info',
    title: '호남·제주 지역 태양광 출력 12~13시 급증으로 계통 SMP 일시 완화 구간 형성',
    timestamp: '13:10',
    urgent: false,
  },
  {
    id: '4',
    type: 'alert',
    title: '전력 공급예비율 19.0% 안정적 유지 중 (예비력 13,750 MW 확보)',
    timestamp: '11:00',
    urgent: false,
  },
];

export const SEVEN_DAY_TREND = [
  { date: '10/30 (수)', avgSmp: 149.8, maxSmp: 182.4, minSmp: 110.2, renewablePct: 17.2 },
  { date: '10/31 (목)', avgSmp: 152.1, maxSmp: 184.6, minSmp: 114.5, renewablePct: 16.8 },
  { date: '11/01 (금)', avgSmp: 146.4, maxSmp: 179.0, minSmp: 108.9, renewablePct: 18.5 },
  { date: '11/02 (토)', avgSmp: 128.5, maxSmp: 154.2, minSmp: 98.4, renewablePct: 22.4 },
  { date: '11/03 (일)', avgSmp: 122.9, maxSmp: 148.0, minSmp: 94.1, renewablePct: 24.8 },
  { date: '11/04 (월)', avgSmp: 144.2, maxSmp: 175.5, minSmp: 106.3, renewablePct: 18.9 },
  { date: '11/05 (화)', avgSmp: 142.1, maxSmp: 176.8, minSmp: 104.2, renewablePct: 19.4 },
];

export const MONTHLY_AVG_SMP = [
  { month: '5월', avgSmp: 126.4, recPrice: 72100 },
  { month: '6월', avgSmp: 133.2, recPrice: 74500 },
  { month: '7월', avgSmp: 158.7, recPrice: 79200 },
  { month: '8월', avgSmp: 167.3, recPrice: 81400 },
  { month: '9월', avgSmp: 142.5, recPrice: 77800 },
  { month: '10월', avgSmp: 139.8, recPrice: 78100 },
  { month: '11월 (진행)', avgSmp: 142.1, recPrice: 78400 },
];

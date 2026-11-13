import React, { useState } from 'react';
import { Search, Download, Filter, Calendar, Sparkles, TrendingUp, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DailySmpRecord } from '../data/kpxSmpData';

interface HourlyAnalysisViewProps {
  currentRecord: DailySmpRecord;
  availableDates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedHour: number;
  onSelectHour: (hour: number) => void;
}

export const HourlyAnalysisView: React.FC<HourlyAnalysisViewProps> = ({
  currentRecord,
  availableDates,
  selectedDate,
  onSelectDate,
  selectedHour,
  onSelectHour,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'peak' | 'normal' | 'discount'>('all');

  const { hourly, max, min, weightedAvg, date, rawDate } = currentRecord;

  // Build 24 rows
  const rows = hourly.map((val, idx) => {
    const hour = idx + 1;
    const isMax = Math.abs(val - max) < 0.001;
    const isMin = Math.abs(val - min) < 0.001;
    const diffFromAvg = val - weightedAvg;
    const diffPct = weightedAvg > 0 ? ((diffFromAvg / weightedAvg) * 100).toFixed(1) : '0';

    let tier = 'normal';
    let tierName = '중간부하';
    let recommendation = '일반 가동';

    if (isMax || val > weightedAvg * 1.15) {
      tier = 'peak';
      tierName = isMax ? '당일 최고가' : '피크 고부하';
      recommendation = '피크 절전 권장';
    } else if (isMin || val < weightedAvg * 0.85) {
      tier = 'discount';
      tierName = isMin ? '당일 최저가' : '경부하 (할인)';
      recommendation = '최적 충전 / 가동';
    }

    return {
      hour,
      hourLabel: `${String(hour).padStart(2, '0')}시`,
      smp: val,
      diffFromAvg,
      diffPct,
      tier,
      tierName,
      recommendation,
      isMax,
      isMin,
    };
  });

  const filteredRows = rows.filter((r) => {
    if (filterType === 'peak' && r.tier !== 'peak') return false;
    if (filterType === 'discount' && r.tier !== 'discount') return false;
    if (filterType === 'normal' && r.tier !== 'normal') return false;
    if (searchQuery && !r.hourLabel.includes(searchQuery) && !r.tierName.includes(searchQuery)) return false;
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['기간', '시간대', '육지SMP(원/kWh)', '가중평균대비(원)', '상태구분', '추천행동'];
    const dataRows = rows.map((r) => [
      rawDate,
      r.hourLabel,
      r.smp,
      r.diffFromAvg.toFixed(2),
      r.tierName,
      r.recommendation,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...dataRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KPX_SMP_${date}_24H_Detail.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-[#FF6B00] border border-orange-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>한국전력거래소(KPX) 공시 데이터</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {date} 일별 24시간 SMP 정밀 데이터 분석표
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              하루 가중평균 <strong>{weightedAvg.toFixed(2)}원/kWh</strong> 기준, 01시부터 24시까지 시간대별 도매 단가 및 최대/최소 변동성을 정밀 비교합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Dropdown */}
            <select
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:bg-slate-800 cursor-pointer"
            >
              {availableDates.slice(0, 45).map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">
                  {d}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 transition-all shadow-xs flex-shrink-0"
            >
              <Download className="w-4 h-4 text-[#FF6B00]" />
              <span>CSV 다운로드</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Tier Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> 필터:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'all' ? 'bg-[#0F172A] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 24시
          </button>
          <button
            onClick={() => setFilterType('peak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'peak' ? 'bg-[#FF6B00] text-white shadow-xs' : 'bg-orange-50 text-[#EA580C] hover:bg-orange-100'
            }`}
          >
            피크 최고가 구간
          </button>
          <button
            onClick={() => setFilterType('discount')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'discount' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            알뜰 최저가 구간
          </button>
          <button
            onClick={() => setFilterType('normal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === 'normal' ? 'bg-slate-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            평균 구간
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="시간 검색 (예: 17시, 피크)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">시간대</th>
                <th className="py-3 px-4">구분 / 태그</th>
                <th className="py-3 px-4">육지 SMP (원/kWh)</th>
                <th className="py-3 px-4">하루 가중평균 대비</th>
                <th className="py-3 px-4">비율 변동</th>
                <th className="py-3 px-4 text-center">운영 권장사항</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {filteredRows.map((row) => {
                const isSelected = row.hour === selectedHour;
                return (
                  <tr
                    key={row.hour}
                    onClick={() => onSelectHour(row.hour)}
                    className={`transition-colors cursor-pointer ${
                      row.isMax
                        ? 'bg-orange-50/80 font-bold text-[#EA580C]'
                        : isSelected
                        ? 'bg-slate-100/70 font-semibold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Hour */}
                    <td className="py-3 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                      {row.hourLabel}
                      {row.isMax && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF6B00] text-white">
                          최고가
                        </span>
                      )}
                      {row.isMin && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                          최저가
                        </span>
                      )}
                    </td>

                    {/* Tier badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          row.isMax
                            ? 'bg-orange-200 text-orange-950'
                            : row.tier === 'peak'
                            ? 'bg-rose-100 text-rose-800'
                            : row.tier === 'discount'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {row.tierName}
                      </span>
                    </td>

                    {/* SMP */}
                    <td className={`py-3 px-4 text-sm font-black ${row.isMax ? 'text-[#FF6B00]' : 'text-slate-900'}`}>
                      {row.smp.toFixed(2)} <span className="text-xs text-slate-500 font-normal">원</span>
                    </td>

                    {/* Diff from Avg */}
                    <td className="py-3 px-4 font-semibold">
                      <span className={row.diffFromAvg >= 0 ? 'text-[#EA580C]' : 'text-emerald-600'}>
                        {row.diffFromAvg >= 0 ? `+${row.diffFromAvg.toFixed(2)}` : row.diffFromAvg.toFixed(2)} 원
                      </span>
                    </td>

                    {/* Ratio */}
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${parseFloat(row.diffPct) >= 0 ? 'text-[#EA580C]' : 'text-emerald-600'}`}>
                        {parseFloat(row.diffPct) >= 0 ? `+${row.diffPct}%` : `${row.diffPct}%`}
                      </span>
                    </td>

                    {/* Recommendation */}
                    <td className="py-3 px-4 text-center">
                      {row.tier === 'peak' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          {row.recommendation}
                        </span>
                      )}
                      {row.tier === 'discount' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          {row.recommendation}
                        </span>
                      )}
                      {row.tier === 'normal' && (
                        <span className="text-slate-500 text-[11px]">
                          일반 전력 사용
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

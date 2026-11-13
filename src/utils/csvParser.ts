import { DailySmpRecord } from '../data/kpxSmpData';

export function parseKpxCsv(csvText: string): DailySmpRecord[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const records: DailySmpRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length >= 26) {
      const rawDate = parts[0];
      const date = rawDate.replace(/\//g, '-');
      const hourly: number[] = [];

      for (let h = 1; h <= 24; h++) {
        const val = parseFloat(parts[h]);
        hourly.push(isNaN(val) ? 0 : val);
      }

      const parsedMax = parseFloat(parts[25]);
      const parsedMin = parseFloat(parts[26]);
      const parsedAvg = parseFloat(parts[27]);

      const calcMax = Math.max(...hourly);
      const calcMin = Math.min(...hourly);
      const calcAvg = parseFloat((hourly.reduce((sum, v) => sum + v, 0) / 24).toFixed(2));

      records.push({
        date,
        rawDate,
        hourly,
        max: isNaN(parsedMax) ? calcMax : parsedMax,
        min: isNaN(parsedMin) ? calcMin : parsedMin,
        weightedAvg: isNaN(parsedAvg) ? calcAvg : parsedAvg,
      });
    }
  }

  // Sort descending by date
  records.sort((a, b) => b.date.localeCompare(a.date));

  return records;
}

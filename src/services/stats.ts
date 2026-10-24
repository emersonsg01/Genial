/**
 * Parses a list of numbers. Values are separated by whitespace or ";". A comma is a
 * separator ("1, 2, 3"), unless the text uses ";" — then it is a decimal comma ("1,5; 2,7").
 */
export function parseNumbers(text: string): number[] {
  const decimalComma = text.includes(';')
  return text
    .split(decimalComma ? /[\s;]+/ : /[\s,]+/)
    .map((s) => (decimalComma ? s.replace(',', '.') : s))
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n))
}

export function quantile(sorted: number[], q: number) {
  if (!sorted.length) return NaN
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

export interface Summary {
  n: number
  sum: number
  mean: number
  median: number
  modes: number[]
  min: number
  max: number
  range: number
  q1: number
  q3: number
  iqr: number
  variancePop: number
  varianceSample: number
  stdPop: number
  stdSample: number
  cv: number
  geometricMean: number
  harmonicMean: number
}

export function summarize(data: number[]): Summary | null {
  const n = data.length
  if (!n) return null
  const sorted = [...data].sort((a, b) => a - b)
  const sum = data.reduce((a, b) => a + b, 0)
  const mean = sum / n
  const sq = data.reduce((a, b) => a + (b - mean) ** 2, 0)
  const counts = new Map<number, number>()
  data.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1))
  const maxCount = Math.max(...counts.values())
  const modes = maxCount > 1 ? [...counts].filter(([, c]) => c === maxCount).map(([v]) => v).sort((a, b) => a - b) : []
  const variancePop = sq / n
  const varianceSample = n > 1 ? sq / (n - 1) : NaN
  const positive = data.every((x) => x > 0)
  return {
    n,
    sum,
    mean,
    median: quantile(sorted, 0.5),
    modes,
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    q1: quantile(sorted, 0.25),
    q3: quantile(sorted, 0.75),
    iqr: quantile(sorted, 0.75) - quantile(sorted, 0.25),
    variancePop,
    varianceSample,
    stdPop: Math.sqrt(variancePop),
    stdSample: Math.sqrt(varianceSample),
    cv: mean !== 0 ? Math.sqrt(varianceSample) / Math.abs(mean) : NaN,
    geometricMean: positive ? Math.exp(data.reduce((a, b) => a + Math.log(b), 0) / n) : NaN,
    harmonicMean: positive ? n / data.reduce((a, b) => a + 1 / b, 0) : NaN,
  }
}

/** Histogram with Sturges' rule for the bin count. */
export function histogram(data: number[], bins?: number) {
  if (!data.length) return { labels: [] as string[], counts: [] as number[] }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const k = bins ?? Math.max(1, Math.ceil(Math.log2(data.length) + 1))
  const width = (max - min) / k || 1
  const counts = new Array(k).fill(0)
  data.forEach((x) => counts[Math.min(k - 1, Math.floor((x - min) / width))]++)
  const labels = counts.map((_, i) => {
    const a = min + i * width
    return `${+a.toFixed(2)}–${+(a + width).toFixed(2)}`
  })
  return { labels, counts }
}

export interface Regression {
  slope: number
  intercept: number
  r: number
  r2: number
}

export function linearRegression(xs: number[], ys: number[]): Regression | null {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return null
  let sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0
  for (let i = 0; i < n; i++) {
    sx += xs[i]; sy += ys[i]; sxy += xs[i] * ys[i]; sxx += xs[i] ** 2; syy += ys[i] ** 2
  }
  const den = n * sxx - sx * sx
  if (den === 0) return null
  const slope = (n * sxy - sx * sy) / den
  const intercept = (sy - slope * sx) / n
  const r = (n * sxy - sx * sy) / Math.sqrt(den * (n * syy - sy * sy))
  return { slope, intercept, r, r2: r * r }
}

/** Parses "x y" or "x, y" or "x;y" pairs, one per line. */
export function parsePairs(text: string): { xs: number[]; ys: number[] } {
  const xs: number[] = []
  const ys: number[] = []
  text.split(/\n+/).forEach((line) => {
    const parts = line.trim().split(/[\s;,]+/).map(Number).filter(Number.isFinite)
    if (parts.length >= 2) { xs.push(parts[0]); ys.push(parts[1]) }
  })
  return { xs, ys }
}

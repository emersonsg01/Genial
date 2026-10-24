const formatters = new Map<number, Intl.NumberFormat>()
const nf = (digits: number) => {
  let f = formatters.get(digits)
  if (!f) formatters.set(digits, (f = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits })))
  return f
}
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Human formatting: locale digits, scientific notation for very large/small magnitudes. */
export function fmt(x: number, digits = 6): string {
  if (Number.isNaN(x)) return 'indefinido'
  if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞'
  if (x === 0) return '0'
  const ax = Math.abs(x)
  if (ax >= 1e12 || ax < 1e-6) return x.toExponential(Math.min(digits, 6)).replace('.', ',').replace('e', ' × 10^')
  // toPrecision(12) strips float noise such as 0.1 + 0.2 = 0.30000000000000004
  return nf(digits).format(Number(x.toPrecision(12)))
}

/** TeX-friendly number: uses \times 10^{n} for scientific notation. */
export function texNum(x: number, digits = 6): string {
  if (Number.isNaN(x)) return String.raw`\text{indefinido}`
  if (!Number.isFinite(x)) return x > 0 ? String.raw`\infty` : String.raw`-\infty`
  if (x === 0) return '0'
  const ax = Math.abs(x)
  if (ax >= 1e12 || ax < 1e-6) {
    const [m, e] = x.toExponential(Math.min(digits, 6)).split('e')
    return `${m.replace('.', '{,}')} \\times 10^{${Number(e)}}`
  }
  // decimal comma first: the thin-space macro "\," inserted for thousands also contains a comma
  return fmt(x, digits).replace(',', '{,}').replace(/\./g, '\\,')
}

export const brl = (x: number) => money.format(x)

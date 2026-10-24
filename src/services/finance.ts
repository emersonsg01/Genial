export function simpleInterest(C: number, i: number, t: number) {
  const J = C * i * t
  return { result: J, formula: `J = C · i · t = ${C} · ${i} · ${t} = ${J}`, tex: String.raw`J = C \cdot i \cdot t = ${C} \cdot ${i} \cdot ${t} = ${J}` }
}

export function compoundInterest(C: number, i: number, t: number) {
  const M = C * Math.pow(1 + i, t)
  return { result: M, formula: `M = C (1 + i)^t = ${C} (1 + ${i})^${t} = ${M}`, tex: String.raw`M = C (1 + i)^{t} = ${C} (1 + ${i})^{${t}} = ${M}` }
}

export function compoundSeries(C: number, i: number, periods: number) {
  // returns array of balances per period
  const values: number[] = []
  for (let k = 0; k <= periods; k++) {
    values.push(C * Math.pow(1 + i, k))
  }
  return values
}

export interface InvestmentPoint {
  period: number
  invested: number
  balance: number
  interest: number
}

/** Initial capital plus a contribution at the end of each period, compounded at rate i. */
export function investmentSeries(initial: number, monthly: number, i: number, periods: number): InvestmentPoint[] {
  const out: InvestmentPoint[] = [{ period: 0, invested: initial, balance: initial, interest: 0 }]
  let balance = initial
  let invested = initial
  for (let k = 1; k <= periods; k++) {
    balance = balance * (1 + i) + monthly
    invested += monthly
    out.push({ period: k, invested, balance, interest: balance - invested })
  }
  return out
}

/** Periods needed to reach a target balance (null if never reached within 1200 periods). */
export function periodsToGoal(initial: number, monthly: number, i: number, goal: number) {
  let balance = initial
  for (let k = 0; k <= 1200; k++) {
    if (balance >= goal) return k
    balance = balance * (1 + i) + monthly
  }
  return null
}

export interface AmortizationRow {
  n: number
  payment: number
  interest: number
  amortization: number
  balance: number
}

/** Tabela Price: constant payments. */
export function priceTable(principal: number, i: number, n: number): AmortizationRow[] {
  const pmt = i === 0 ? principal / n : (principal * i) / (1 - Math.pow(1 + i, -n))
  const rows: AmortizationRow[] = []
  let balance = principal
  for (let k = 1; k <= n; k++) {
    const interest = balance * i
    const amortization = pmt - interest
    balance = Math.max(0, balance - amortization)
    rows.push({ n: k, payment: pmt, interest, amortization, balance })
  }
  return rows
}

/** SAC: constant amortization, decreasing payments. */
export function sacTable(principal: number, i: number, n: number): AmortizationRow[] {
  const amortization = principal / n
  const rows: AmortizationRow[] = []
  let balance = principal
  for (let k = 1; k <= n; k++) {
    const interest = balance * i
    balance = Math.max(0, balance - amortization)
    rows.push({ n: k, payment: amortization + interest, interest, amortization, balance })
  }
  return rows
}

/** Equivalent rate between periods: e.g. annual -> monthly with ratio 1/12. */
export function equivalentRate(rate: number, ratio: number) {
  return Math.pow(1 + rate, ratio) - 1
}

/** Real (inflation-adjusted) rate via the Fisher equation. */
export function realRate(nominal: number, inflation: number) {
  return (1 + nominal) / (1 + inflation) - 1
}

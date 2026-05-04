export function simpleInterest(C: number, i: number, t: number) {
  const J = C * i * t
  return { result: J, formula: `J = C · i · t = ${C} · ${i} · ${t} = ${J}`, tex: `J = C \cdot i \cdot t = ${C} \cdot ${i} \cdot ${t} = ${J}` }
}

export function compoundInterest(C: number, i: number, t: number) {
  const M = C * Math.pow(1 + i, t)
  return { result: M, formula: `M = C (1 + i)^t = ${C} (1 + ${i})^${t} = ${M}`, tex: `M = C (1 + i)^{t} = ${C} (1 + ${i})^{${t}} = ${M}` }
}

export function compoundSeries(C: number, i: number, periods: number) {
  // returns array of balances per period
  const values: number[] = []
  for (let k = 0; k <= periods; k++) {
    values.push(C * Math.pow(1 + i, k))
  }
  return values
}

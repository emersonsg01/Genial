export function massFromForce(F: number, a: number) {
  const m = F / a
  return { result: m, formula: `m = F / a = ${F} / ${a} = ${m}`, tex: `m = \dfrac{F}{a} = \dfrac{${F}}{${a}} = ${m}` }
}

export function velocity(deltaS: number, deltaT: number) {
  const v = deltaS / deltaT
  return { result: v, formula: `v = Δs / Δt = ${deltaS} / ${deltaT} = ${v}`, tex: `v = \dfrac{\Delta s}{\Delta t} = \dfrac{${deltaS}}{${deltaT}} = ${v}` }
}

export function displacement(v: number, t: number) {
  const ds = v * t
  return { result: ds, formula: `Δs = v · t = ${v} · ${t} = ${ds}`, tex: `\Delta s = v \cdot t = ${v} \cdot ${t} = ${ds}` }
}

export function pressure(F: number, A: number) {
  const P = F / A
  return { result: P, formula: `P = F / A = ${F} / ${A} = ${P}`, tex: `P = \dfrac{F}{A} = \dfrac{${F}}{${A}} = ${P}` }
}

export function gravityForce(m: number, g = 9.80665) {
  const F = m * g
  return { result: F, formula: `F = m · g = ${m} · ${g} = ${F}`, tex: `F = m \cdot g = ${m} \cdot ${g} = ${F}` }
}

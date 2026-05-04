export function cToF(c: number) {
  const f = (c * 9) / 5 + 32
  return { result: f, formula: `${c}°C · 9/5 + 32 = ${f}°F`, tex: `${c}^{\circ}\mathrm{C} \cdot \dfrac{9}{5} + 32 = ${f}^{\circ}\mathrm{F}` }
}

export function fToC(f: number) {
  const c = ((f - 32) * 5) / 9
  return { result: c, formula: `${f}°F → (${f} - 32) · 5/9 = ${c}°C`, tex: `${f}^{\circ}\mathrm{F} \to ( ${f} - 32 ) \cdot \dfrac{5}{9} = ${c}^{\circ}\mathrm{C}` }
}

export function kmToM(km: number) {
  const m = km * 1000
  return { result: m, formula: `${km} km = ${m} m`, tex: `${km}\ \mathrm{km} = ${m}\ \mathrm{m}` }
}

export function mToKm(m: number) {
  const km = m / 1000
  return { result: km, formula: `${m} m = ${km} km`, tex: `${m}\ \mathrm{m} = ${km}\ \mathrm{km}` }
}

export function kgToG(kg: number) {
  const g = kg * 1000
  return { result: g, formula: `${kg} kg = ${g} g`, tex: `${kg}\ \mathrm{kg} = ${g}\ \mathrm{g}` }
}

export function gToKg(g: number) {
  const kg = g / 1000
  return { result: kg, formula: `${g} g = ${kg} kg`, tex: `${g}\ \mathrm{g} = ${kg}\ \mathrm{kg}` }
}

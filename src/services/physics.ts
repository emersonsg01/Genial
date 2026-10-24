export function massFromForce(F: number, a: number) {
  const m = F / a
  return { result: m, formula: `m = F / a = ${F} / ${a} = ${m}`, tex: String.raw`m = \dfrac{F}{a} = \dfrac{${F}}{${a}} = ${m}` }
}

export function velocity(deltaS: number, deltaT: number) {
  const v = deltaS / deltaT
  return { result: v, formula: `v = Δs / Δt = ${deltaS} / ${deltaT} = ${v}`, tex: String.raw`v = \dfrac{\Delta s}{\Delta t} = \dfrac{${deltaS}}{${deltaT}} = ${v}` }
}

export function displacement(v: number, t: number) {
  const ds = v * t
  return { result: ds, formula: `Δs = v · t = ${v} · ${t} = ${ds}`, tex: String.raw`\Delta s = v \cdot t = ${v} \cdot ${t} = ${ds}` }
}

export function pressure(F: number, A: number) {
  const P = F / A
  return { result: P, formula: `P = F / A = ${F} / ${A} = ${P}`, tex: String.raw`P = \dfrac{F}{A} = \dfrac{${F}}{${A}} = ${P}` }
}

export function gravityForce(m: number, g = 9.80665) {
  const F = m * g
  return { result: F, formula: `F = m · g = ${m} · ${g} = ${F}`, tex: String.raw`F = m \cdot g = ${m} \cdot ${g} = ${F}` }
}

// ---------------------------------------------------------------------------

export interface PhysicalConstant {
  symbol: string // TeX
  name: string
  value: number
  unit: string // TeX
}

export const CONSTANTS: PhysicalConstant[] = [
  { symbol: 'c', name: 'Velocidade da luz no vácuo', value: 299792458, unit: String.raw`\mathrm{m/s}` },
  { symbol: 'G', name: 'Constante gravitacional', value: 6.6743e-11, unit: String.raw`\mathrm{N\,m^2/kg^2}` },
  { symbol: 'g', name: 'Gravidade padrão', value: 9.80665, unit: String.raw`\mathrm{m/s^2}` },
  { symbol: 'h', name: 'Constante de Planck', value: 6.62607015e-34, unit: String.raw`\mathrm{J\,s}` },
  { symbol: String.raw`\hbar`, name: 'Planck reduzida', value: 1.054571817e-34, unit: String.raw`\mathrm{J\,s}` },
  { symbol: 'e', name: 'Carga elementar', value: 1.602176634e-19, unit: String.raw`\mathrm{C}` },
  { symbol: String.raw`k_B`, name: 'Constante de Boltzmann', value: 1.380649e-23, unit: String.raw`\mathrm{J/K}` },
  { symbol: String.raw`N_A`, name: 'Número de Avogadro', value: 6.02214076e23, unit: String.raw`\mathrm{mol^{-1}}` },
  { symbol: 'R', name: 'Constante dos gases', value: 8.314462618, unit: String.raw`\mathrm{J/(mol\,K)}` },
  { symbol: String.raw`k_e`, name: 'Constante de Coulomb', value: 8.9875517923e9, unit: String.raw`\mathrm{N\,m^2/C^2}` },
  { symbol: String.raw`\varepsilon_0`, name: 'Permissividade do vácuo', value: 8.8541878128e-12, unit: String.raw`\mathrm{F/m}` },
  { symbol: String.raw`\mu_0`, name: 'Permeabilidade do vácuo', value: 1.25663706212e-6, unit: String.raw`\mathrm{N/A^2}` },
  { symbol: String.raw`m_e`, name: 'Massa do elétron', value: 9.1093837015e-31, unit: String.raw`\mathrm{kg}` },
  { symbol: String.raw`m_p`, name: 'Massa do próton', value: 1.67262192369e-27, unit: String.raw`\mathrm{kg}` },
  { symbol: String.raw`\sigma`, name: 'Constante de Stefan–Boltzmann', value: 5.670374419e-8, unit: String.raw`\mathrm{W/(m^2\,K^4)}` },
  { symbol: String.raw`M_\oplus`, name: 'Massa da Terra', value: 5.972e24, unit: String.raw`\mathrm{kg}` },
  { symbol: String.raw`R_\oplus`, name: 'Raio médio da Terra', value: 6.371e6, unit: String.raw`\mathrm{m}` },
  { symbol: String.raw`M_\odot`, name: 'Massa do Sol', value: 1.989e30, unit: String.raw`\mathrm{kg}` },
]

export const PLANETS = [
  { id: 'terra', name: 'Terra', g: 9.80665, emoji: '🌍' },
  { id: 'lua', name: 'Lua', g: 1.62, emoji: '🌙' },
  { id: 'marte', name: 'Marte', g: 3.721, emoji: '🔴' },
  { id: 'venus', name: 'Vênus', g: 8.87, emoji: '🟡' },
  { id: 'jupiter', name: 'Júpiter', g: 24.79, emoji: '🪐' },
  { id: 'mercurio', name: 'Mercúrio', g: 3.7, emoji: '⚫' },
  { id: 'sol', name: 'Sol', g: 274, emoji: '☀️' },
]

export interface ProjectileResult {
  flightTime: number
  range: number
  maxHeight: number
  impactSpeed: number
  points: { x: number; y: number; t: number }[]
}

/** Oblique launch without drag, from height h0, landing at y = 0. */
export function projectile(v0: number, angleDeg: number, h0: number, g: number, samples = 160): ProjectileResult {
  const th = (angleDeg * Math.PI) / 180
  const vx = v0 * Math.cos(th)
  const vy = v0 * Math.sin(th)
  const flightTime = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g
  const maxHeight = h0 + (vy > 0 ? (vy * vy) / (2 * g) : 0)
  const points = Array.from({ length: samples + 1 }, (_, k) => {
    const t = (flightTime * k) / samples
    return { t, x: vx * t, y: Math.max(0, h0 + vy * t - (g * t * t) / 2) }
  })
  const vyImpact = vy - g * flightTime
  return { flightTime, range: vx * flightTime, maxHeight, impactSpeed: Math.hypot(vx, vyImpact), points }
}

/** Damped harmonic oscillator x(t) = A e^{-γt} cos(ω_d t + φ). */
export function dampedOscillator(A: number, k: number, m: number, b: number, tMax: number, samples = 400) {
  const w0 = Math.sqrt(k / m)
  const gamma = b / (2 * m)
  const wd = Math.sqrt(Math.max(0, w0 * w0 - gamma * gamma))
  const regime = gamma === 0 ? 'Sem amortecimento' : gamma < w0 ? 'Subamortecido' : gamma === w0 ? 'Crítico' : 'Superamortecido'
  const points = Array.from({ length: samples + 1 }, (_, i) => {
    const t = (tMax * i) / samples
    let x: number
    if (gamma < w0) x = A * Math.exp(-gamma * t) * Math.cos(wd * t)
    else if (gamma === w0) x = A * (1 + gamma * t) * Math.exp(-gamma * t)
    else {
      const s = Math.sqrt(gamma * gamma - w0 * w0)
      const r1 = -gamma + s
      const r2 = -gamma - s
      // x(0) = A, x'(0) = 0
      x = (A / (r2 - r1)) * (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t))
    }
    return { t, x }
  })
  return { w0, gamma, wd, period: wd > 0 ? (2 * Math.PI) / wd : Infinity, regime, points }
}

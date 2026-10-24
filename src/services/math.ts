export function add(a: number, b: number) {
  return a + b
}

export function sub(a: number, b: number) {
  return a - b
}

export function mul(a: number, b: number) {
  return a * b
}

export function div(a: number, b: number) {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}

export function pow(a: number, b: number) {
  return Math.pow(a, b)
}

export function sqrt(a: number) {
  const res = Math.sqrt(a)
  return { result: res, formula: String.raw`\sqrt{${a}} = ${res}` }
}

export function log(a: number, base = 10) {
  const res = Math.log(a) / Math.log(base)
  return { result: res, formula: String.raw`\log_{${base}}(${a}) = ${res}` }
}

export function sin(a: number) {
  return Math.sin(a)
}

export function cos(a: number) {
  return Math.cos(a)
}

export function tan(a: number) {
  return Math.tan(a)
}

// ---------------------------------------------------------------------------

export interface QuadraticResult {
  delta: number
  roots: { re: number; im: number }[]
  vertex: { x: number; y: number }
}

export function quadratic(a: number, b: number, c: number): QuadraticResult {
  if (a === 0) throw new Error('O coeficiente a não pode ser zero')
  const delta = b * b - 4 * a * c
  const vertex = { x: -b / (2 * a), y: -delta / (4 * a) }
  if (delta >= 0) {
    const s = Math.sqrt(delta)
    const r1 = (-b + s) / (2 * a)
    const r2 = (-b - s) / (2 * a)
    return { delta, vertex, roots: delta === 0 ? [{ re: r1, im: 0 }] : [{ re: r1, im: 0 }, { re: r2, im: 0 }] }
  }
  const re = -b / (2 * a)
  const im = Math.sqrt(-delta) / (2 * Math.abs(a))
  return { delta, vertex, roots: [{ re, im }, { re, im: -im }] }
}

/** Solves a 2x2 linear system via Cramer's rule. Null when the determinant is zero. */
export function linear2x2(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number) {
  const det = a1 * b2 - a2 * b1
  if (det === 0) return null
  return { det, x: (c1 * b2 - c2 * b1) / det, y: (a1 * c2 - a2 * c1) / det }
}

export function isPrime(n: number) {
  if (!Number.isInteger(n) || n < 2) return false
  if (n % 2 === 0) return n === 2
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false
  return true
}

export function primeFactors(n: number): [number, number][] {
  const out: [number, number][] = []
  n = Math.abs(Math.round(n))
  for (let p = 2; p * p <= n; p++) {
    let k = 0
    while (n % p === 0) { n /= p; k++ }
    if (k) out.push([p, k])
  }
  if (n > 1) out.push([n, 1])
  return out
}

// Numeric helpers shared by the plotter and the formula solver.

export type RealFn = (x: number) => number

export function derivative(f: RealFn, x: number, h = 1e-5) {
  return (f(x + h) - f(x - h)) / (2 * h)
}

export function simpson(f: RealFn, a: number, b: number, n = 1000) {
  if (n % 2) n++
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2)
  return (s * h) / 3
}

export function bisect(f: RealFn, a: number, b: number, tol = 1e-12, maxIter = 200) {
  let fa = f(a)
  for (let i = 0; i < maxIter; i++) {
    const m = (a + b) / 2
    const fm = f(m)
    if (Math.abs(fm) < tol || (b - a) / 2 < tol) return m
    if (Math.sign(fm) === Math.sign(fa)) { a = m; fa = fm } else b = m
  }
  return (a + b) / 2
}

/** Finds roots of f in [a, b] by scanning for sign changes, then bisecting. */
export function findRoots(f: RealFn, a: number, b: number, samples = 2000) {
  const roots: number[] = []
  const step = (b - a) / samples
  let x0 = a
  let y0 = f(x0)
  for (let i = 1; i <= samples; i++) {
    const x1 = a + i * step
    const y1 = f(x1)
    if (Number.isFinite(y0) && Number.isFinite(y1)) {
      if (y0 === 0) roots.push(x0)
      else if (Math.sign(y0) !== Math.sign(y1) && y1 !== 0) {
        const r = bisect(f, x0, x1)
        // discard sign changes caused by poles (|f| blows up instead of vanishing)
        if (Math.abs(f(r)) < 1e-6) roots.push(r)
      }
    }
    x0 = x1
    y0 = y1
  }
  return roots.filter((r, i) => i === 0 || Math.abs(r - roots[i - 1]) > step / 2)
}

/**
 * Solves g(x) = 0 with no bracket known in advance: tries Newton from several seeds,
 * then falls back to scanning growing intervals for a sign change.
 */
export function solve(g: RealFn, hint = 1): number | null {
  const ok = (x: number) => Number.isFinite(x) && Math.abs(g(x)) < 1e-9 * Math.max(1, Math.abs(x))
  const seeds = [hint, 1, 0.5, 2, 10, 0.1, 100, -1, 1000, 0.01, -10, 1e4, 1e-3]
  for (const s of seeds) {
    let x = s
    for (let i = 0; i < 80; i++) {
      const y = g(x)
      if (!Number.isFinite(y)) break
      const d = derivative(g, x, Math.max(1e-7, Math.abs(x) * 1e-6))
      if (!Number.isFinite(d) || d === 0) break
      const nx = x - y / d
      if (!Number.isFinite(nx)) break
      if (Math.abs(nx - x) < 1e-13 * Math.max(1, Math.abs(x))) { x = nx; break }
      x = nx
    }
    if (ok(x)) return x
  }
  for (let span = 1; span <= 1e9; span *= 10) {
    const r = findRoots(g, -span, span, 4000)
    if (r.length) return r.find((x) => x > 0) ?? r[0]
  }
  return null
}

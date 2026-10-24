import { describe, it, expect } from 'vitest'
import { derivative, findRoots, simpson, solve } from '../../src/lib/numeric'
import { fmt, texNum } from '../../src/lib/format'

describe('numeric helpers', () => {
  it('differentiates and integrates', () => {
    expect(derivative((x) => x ** 3, 2)).toBeCloseTo(12, 5)
    expect(simpson(Math.sin, 0, Math.PI)).toBeCloseTo(2, 8)
  })

  it('finds roots without counting poles', () => {
    const roots = findRoots((x) => x * x - 4, -5, 5)
    expect(roots.map((r) => +r.toFixed(6))).toEqual([-2, 2])
    // tan has poles at ±π/2 — only the zero crossings should be reported
    const tanRoots = findRoots(Math.tan, -2, 2)
    expect(tanRoots).toHaveLength(1)
    expect(tanRoots[0]).toBeCloseTo(0, 8)
  })

  it('solves equations with no bracket', () => {
    expect(solve((x) => x * x - 2)).toBeCloseTo(Math.SQRT2, 9)
    expect(solve((x) => Math.exp(x) - 10)).toBeCloseTo(Math.log(10), 9)
    expect(solve((x) => x * x + 1)).toBeNull()
  })
})

describe('formatting', () => {
  it('formats numbers in pt-BR and strips float noise', () => {
    expect(fmt(0.1 + 0.2)).toBe('0,3')
    expect(fmt(1234.5)).toBe('1.234,5')
    expect(fmt(Infinity)).toBe('∞')
  })

  it('uses scientific notation for extreme magnitudes', () => {
    expect(texNum(6.02214076e23)).toContain('\\times 10^{23}')
    expect(texNum(1.5)).toBe('1{,}5')
    expect(texNum(299792458)).toBe('299\\,792\\,458')
    expect(texNum(1234.5)).toBe('1\\,234{,}5')
  })
})

import { describe, it, expect } from 'vitest'
import { convert, convertBase, UNIT_CATEGORIES } from '../../src/services/units'
import { priceTable, sacTable, investmentSeries, equivalentRate, periodsToGoal, realRate } from '../../src/services/finance'
import { summarize, parseNumbers, linearRegression, histogram, parsePairs } from '../../src/services/stats'
import { quadratic, linear2x2, isPrime, primeFactors } from '../../src/services/math'
import { projectile, dampedOscillator } from '../../src/services/physics'

describe('unit converter', () => {
  it('converts across categories', () => {
    expect(convert('length', 'mi', 'km', 1)).toBeCloseTo(1.609344)
    expect(convert('temperature', 'c', 'f', 100)).toBeCloseTo(212)
    expect(convert('temperature', 'f', 'k', 32)).toBeCloseTo(273.15)
    expect(convert('speed', 'kmh', 'ms', 36)).toBeCloseTo(10)
    expect(convert('data', 'GiB', 'MB', 1)).toBeCloseTo(1073.741824)
    expect(convert('consumption', 'kml', 'l100', 10)).toBeCloseTo(10)
    expect(convert('area', 'alq', 'ha', 1)).toBeCloseTo(2.42)
  })

  it('round-trips every unit through its base', () => {
    UNIT_CATEGORIES.forEach((c) => c.units.forEach((u) => {
      expect(convert(c.id, u.id, c.units[0].id, convert(c.id, c.units[0].id, u.id, 3.7))).toBeCloseTo(3.7, 9)
    }))
  })

  it('converts number bases', () => {
    expect(convertBase('255', 10)).toEqual({ bin: '11111111', oct: '377', dec: '255', hex: 'FF' })
    expect(convertBase('0xff', 16)?.dec).toBe('255')
    expect(convertBase('102', 2)).toBeNull()
  })
})

describe('finance', () => {
  it('amortization tables pay off the principal', () => {
    const p = priceTable(100000, 0.01, 120)
    const s = sacTable(100000, 0.01, 120)
    expect(p[p.length - 1].balance).toBeCloseTo(0, 4)
    expect(s[s.length - 1].balance).toBeCloseTo(0, 4)
    expect(p[0].payment).toBeCloseTo(1434.71, 2)
    expect(s[0].payment).toBeCloseTo(1833.33, 2)
    const sum = (r: typeof p) => r.reduce((a, x) => a + x.payment, 0)
    expect(sum(s)).toBeLessThan(sum(p))
  })

  it('compounds contributions', () => {
    const last = investmentSeries(0, 100, 0, 12).pop()!
    expect(last.balance).toBe(1200)
    expect(equivalentRate(0.12682503, 1 / 12)).toBeCloseTo(0.01, 6)
    expect(periodsToGoal(1000, 0, 0.1, 2000)).toBe(8)
    expect(realRate(0.1, 0.1)).toBeCloseTo(0)
  })
})

describe('stats', () => {
  it('summarizes data', () => {
    const s = summarize([2, 4, 4, 4, 5, 5, 7, 9])!
    expect(s.mean).toBe(5)
    expect(s.median).toBe(4.5)
    expect(s.modes).toEqual([4])
    expect(s.stdPop).toBe(2)
    expect(summarize([])).toBeNull()
  })

  it('parses numbers with either decimal style', () => {
    expect(parseNumbers('1, 2, 3.5\n4')).toEqual([1, 2, 3.5, 4])
    expect(parseNumbers('1,5; 2,25; 3')).toEqual([1.5, 2.25, 3])
    expect(parsePairs('1 2\n3, 4\n5;6')).toEqual({ xs: [1, 3, 5], ys: [2, 4, 6] })
  })

  it('fits a regression line and builds histograms', () => {
    const r = linearRegression([1, 2, 3, 4], [3, 5, 7, 9])!
    expect(r.slope).toBeCloseTo(2)
    expect(r.intercept).toBeCloseTo(1)
    expect(r.r2).toBeCloseTo(1)
    const h = histogram([1, 2, 2, 3, 3, 3, 4, 4, 5])
    expect(h.counts.reduce((a, b) => a + b, 0)).toBe(9)
  })
})

describe('math & physics extras', () => {
  it('solves quadratics including complex roots', () => {
    expect(quadratic(1, -3, 2).roots.map((r) => r.re)).toEqual([2, 1])
    const c = quadratic(1, 0, 1)
    expect(c.roots[0]).toEqual({ re: -0, im: 1 })
    expect(linear2x2(2, 1, 5, 1, -1, 1)).toEqual({ det: -3, x: 2, y: 1 })
    expect(isPrime(97)).toBe(true)
    expect(primeFactors(360)).toEqual([[2, 3], [3, 2], [5, 1]])
  })

  it('simulates a projectile and an oscillator', () => {
    const p = projectile(20, 45, 0, 10)
    expect(p.range).toBeCloseTo(40, 6)
    expect(p.maxHeight).toBeCloseTo(10, 6)
    const o = dampedOscillator(1, 4, 1, 0, 10)
    expect(o.w0).toBe(2)
    expect(o.regime).toBe('Sem amortecimento')
    expect(o.points[0].x).toBe(1)
  })
})

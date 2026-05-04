import { describe, it, expect } from 'vitest'
import { simpleInterest, compoundInterest } from '../../src/services/finance'

describe('finance service', () => {
  it('computes simple interest', () => {
    const r = simpleInterest(1000, 0.05, 2)
    expect(r.result).toBe(100)
  })

  it('computes compound interest', () => {
    const r = compoundInterest(1000, 0.1, 2)
    expect(r.result).toBeCloseTo(1210)
  })
})

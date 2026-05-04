import { describe, it, expect } from 'vitest'
import { add, sqrt } from '../../src/services/math'

describe('math service', () => {
  it('adds two numbers', () => {
    expect(add(2,3)).toBe(5)
  })

  it('sqrt returns formula and result', () => {
    const r = sqrt(9)
    expect(r.result).toBe(3)
    expect(typeof r.formula).toBe('string')
  })
})

import { describe, it, expect } from 'vitest'
import { massFromForce, velocity, pressure } from '../../src/services/physics'

describe('physics service', () => {
  it('computes mass from force and acceleration', () => {
    const r = massFromForce(10, 2)
    expect(r.result).toBe(5)
    expect(typeof r.tex).toBe('string')
  })

  it('computes velocity', () => {
    const r = velocity(100, 10)
    expect(r.result).toBe(10)
  })

  it('computes pressure', () => {
    const r = pressure(20, 2)
    expect(r.result).toBe(10)
  })
})

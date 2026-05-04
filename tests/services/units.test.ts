import { describe, it, expect } from 'vitest'
import { cToF, fToC, kmToM, mToKm, kgToG, gToKg } from '../../src/services/units'

describe('units service', () => {
  it('converts Celsius to Fahrenheit', () => {
    const r = cToF(0)
    expect(r.result).toBe(32)
  })

  it('converts km to m and back', () => {
    expect(kmToM(1).result).toBe(1000)
    expect(mToKm(1000).result).toBe(1)
  })

  it('converts kg to g and back', () => {
    expect(kgToG(2).result).toBe(2000)
    expect(gToKg(2000).result).toBe(2)
  })
})

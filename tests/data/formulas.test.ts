import { describe, it, expect } from 'vitest'
import { FORMULAS, EqFormula } from '../../src/data/formulas'
import { solve } from '../../src/lib/numeric'

const eqs = FORMULAS.filter((f): f is EqFormula => f.kind === 'eq')
const defaults = (f: EqFormula) => Object.fromEntries(f.vars.map((v) => [v.key, v.def]))

describe('formula library', () => {
  it('has unique ids and an output among its variables', () => {
    const ids = FORMULAS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
    eqs.forEach((f) => expect(f.vars.some((v) => v.key === f.out)).toBe(true))
  })

  it('every default example is consistent with its own formula (within 1%)', () => {
    eqs.forEach((f) => {
      const vals = defaults(f)
      const out = f.fn(vals)
      expect(Number.isFinite(out), f.id).toBe(true)
      expect(Math.abs(out - vals[f.out]) / Math.max(1e-12, Math.abs(out)), f.id).toBeLessThan(0.01)
    })
  })

  // Round trip: solving for any input with the computed output must recover that input.
  it('can solve every eq formula for every variable', () => {
    eqs.forEach((f) => {
      const vals = defaults(f)
      vals[f.out] = f.fn(vals)
      f.vars.filter((v) => v.key !== f.out).forEach((v) => {
        const target = vals[f.out]
        const g = (x: number) => f.fn({ ...vals, [v.key]: x }) - target
        const x = solve(g, vals[v.key] || 1)
        expect(x, `${f.id} → ${v.key}`).not.toBeNull()
        // the recovered value must reproduce the output (some formulas have several valid inputs, e.g. cos θ)
        expect(Math.abs(f.fn({ ...vals, [v.key]: x! }) - target) / Math.max(1e-12, Math.abs(target)), `${f.id} → ${v.key}`).toBeLessThan(1e-6)
      })
    })
  })

  it('custom formulas compute outputs', () => {
    const bhaskara = FORMULAS.find((f) => f.id === 'bhaskara')!
    if (bhaskara.kind !== 'custom') throw new Error('expected custom')
    const out = bhaskara.compute({ a: 1, b: -3, c: 2 })
    expect(out.map((o) => o.value)).toEqual(expect.arrayContaining(['2', '1']))
  })
})

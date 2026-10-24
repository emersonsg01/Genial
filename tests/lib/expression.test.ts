import { describe, it, expect } from 'vitest'
import { evaluate, compile, freeVariables, factorial, nCr } from '../../src/lib/expression'

describe('expression engine', () => {
  it('respects precedence and associativity', () => {
    expect(evaluate('2 + 3 * 4')).toBe(14)
    expect(evaluate('2^3^2')).toBe(512)
    expect(evaluate('-2^2')).toBe(-4)
    expect(evaluate('(1 + 2) * 3')).toBe(9)
    expect(evaluate('2^-1')).toBe(0.5)
  })

  it('supports implicit multiplication and constants', () => {
    expect(evaluate('2pi')).toBeCloseTo(2 * Math.PI)
    expect(evaluate('3(4 + 1)')).toBe(15)
    expect(evaluate('2x', { vars: { x: 5 } })).toBe(10)
    expect(evaluate('(1+1)(2+2)')).toBe(8)
  })

  it('handles unicode operators, postfix ! and %', () => {
    expect(evaluate('6 × 7')).toBe(42)
    expect(evaluate('9 ÷ 3 − 1')).toBe(2)
    expect(evaluate('5!')).toBe(120)
    expect(evaluate('50%')).toBe(0.5)
    expect(evaluate('√16')).toBe(4)
    expect(evaluate('π')).toBeCloseTo(Math.PI)
  })

  it('evaluates functions in degrees and radians', () => {
    expect(evaluate('sin(30)', { angle: 'deg' })).toBeCloseTo(0.5)
    expect(evaluate('sin(pi/6)')).toBeCloseTo(0.5)
    expect(evaluate('asin(1)', { angle: 'deg' })).toBeCloseTo(90)
    expect(evaluate('log(1000)')).toBeCloseTo(3)
    expect(evaluate('log(8, 2)')).toBeCloseTo(3)
    expect(evaluate('root(-27, 3)')).toBeCloseTo(-3)
    expect(evaluate('nCr(49, 6)')).toBe(13983816)
    expect(evaluate('gcd(84, 36)')).toBe(12)
    expect(evaluate('2e3')).toBe(2000)
  })

  it('compiles once and evaluates many times', () => {
    const f = compile('x^2 - 3x + 2')
    expect(f({ x: 1 })).toBe(0)
    expect(f({ x: 2 })).toBe(0)
    expect(f({ x: 3 })).toBe(2)
  })

  it('reports helpful errors', () => {
    expect(() => evaluate('')).toThrow(/vazia/)
    expect(() => evaluate('(1 + 2')).toThrow()
    expect(() => evaluate('2 +')).toThrow()
    expect(() => evaluate('y + 1')).toThrow(/Variável desconhecida/)
    expect(() => evaluate('2 $ 3')).toThrow(/Símbolo/)
  })

  it('lists free variables', () => {
    expect(freeVariables('a*x^2 + b*x + c + pi').sort()).toEqual(['a', 'b', 'c', 'x'])
  })

  it('computes factorials and combinations', () => {
    expect(factorial(0)).toBe(1)
    expect(factorial(10)).toBe(3628800)
    expect(factorial(0.5)).toBeCloseTo(Math.sqrt(Math.PI) / 2, 6)
    expect(nCr(5, 2)).toBe(10)
  })
})

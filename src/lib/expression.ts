// Safe math expression engine: tokenizer -> recursive-descent parser -> compiled closure.
// Supports implicit multiplication (2x, 3(4), 2pi), postfix ! and %, right-assoc ^,
// functions, constants and free variables (e.g. x for plotting).

export type AngleMode = 'rad' | 'deg'

type Token =
  | { t: 'num'; v: number }
  | { t: 'id'; v: string }
  | { t: 'op'; v: string }

type Node =
  | { k: 'num'; v: number }
  | { k: 'var'; name: string }
  | { k: 'neg'; a: Node }
  | { k: 'bin'; op: string; a: Node; b: Node }
  | { k: 'post'; op: string; a: Node }
  | { k: 'call'; name: string; args: Node[] }

export interface EvalContext {
  angle?: AngleMode
  vars?: Record<string, number>
}

export class ExpressionError extends Error {}

const ALIASES: Record<string, string> = {
  '×': '*', '·': '*', '÷': '/', '−': '-', '–': '-', '**': '^', 'π': 'pi', 'τ': 'tau', 'φ': 'phi', '√': 'sqrt',
}

export const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: 2 * Math.PI,
  phi: (1 + Math.sqrt(5)) / 2,
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const s = src.replace(/\*\*/g, '^')
  while (i < s.length) {
    let c = s[i]
    if (/\s/.test(c)) { i++; continue }
    if (ALIASES[c]) c = ALIASES[c]
    if (/[0-9.]/.test(c)) {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i))
      if (!m) throw new ExpressionError(`Número inválido perto de "${s.slice(i, i + 5)}"`)
      tokens.push({ t: 'num', v: parseFloat(m[0]) })
      i += m[0].length
      continue
    }
    if (c === 'pi' || c === 'tau' || c === 'phi' || c === 'sqrt') {
      tokens.push({ t: 'id', v: c }); i++; continue
    }
    if (/[a-zA-Z_]/.test(c)) {
      const m = /^[a-zA-Z_][a-zA-Z_0-9]*/.exec(s.slice(i))!
      tokens.push({ t: 'id', v: m[0] })
      i += m[0].length
      continue
    }
    if ('+-*/^()!%,'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue }
    throw new ExpressionError(`Símbolo desconhecido: "${s[i]}"`)
  }
  return tokens
}

class Parser {
  private p = 0
  constructor(private tk: Token[]) {}

  parse(): Node {
    if (this.tk.length === 0) throw new ExpressionError('Expressão vazia')
    const n = this.additive()
    if (this.p < this.tk.length) throw new ExpressionError('Sobrou algo na expressão — confira os parênteses')
    return n
  }

  private peek() { return this.tk[this.p] }
  private isOp(v: string) { const t = this.peek(); return !!t && t.t === 'op' && t.v === v }
  private eat(v: string) {
    if (!this.isOp(v)) throw new ExpressionError(`Esperava "${v}"`)
    this.p++
  }

  private additive(): Node {
    let n = this.multiplicative()
    while (this.isOp('+') || this.isOp('-')) {
      const op = (this.tk[this.p++] as { v: string }).v
      n = { k: 'bin', op, a: n, b: this.multiplicative() }
    }
    return n
  }

  private startsOperand() {
    const t = this.peek()
    return !!t && (t.t === 'num' || t.t === 'id' || (t.t === 'op' && t.v === '('))
  }

  private multiplicative(): Node {
    let n = this.unary()
    for (;;) {
      if (this.isOp('*') || this.isOp('/')) {
        const op = (this.tk[this.p++] as { v: string }).v
        n = { k: 'bin', op, a: n, b: this.unary() }
      } else if (this.startsOperand()) {
        n = { k: 'bin', op: '*', a: n, b: this.power() }
      } else break
    }
    return n
  }

  private unary(): Node {
    if (this.isOp('-')) { this.p++; return { k: 'neg', a: this.unary() } }
    if (this.isOp('+')) { this.p++; return this.unary() }
    return this.power()
  }

  private power(): Node {
    const base = this.postfix()
    if (this.isOp('^')) { this.p++; return { k: 'bin', op: '^', a: base, b: this.unary() } }
    return base
  }

  private postfix(): Node {
    let n = this.primary()
    while (this.isOp('!') || this.isOp('%')) {
      n = { k: 'post', op: (this.tk[this.p++] as { v: string }).v, a: n }
    }
    return n
  }

  private primary(): Node {
    const t = this.peek()
    if (!t) throw new ExpressionError('Expressão incompleta')
    if (t.t === 'num') { this.p++; return { k: 'num', v: t.v } }
    if (t.t === 'op' && t.v === '(') {
      this.p++
      const n = this.additive()
      this.eat(')')
      return n
    }
    if (t.t === 'id') {
      this.p++
      const name = t.v
      if (FUNCTIONS[name]) {
        if (this.isOp('(')) {
          this.p++
          const args: Node[] = []
          if (!this.isOp(')')) {
            args.push(this.additive())
            while (this.isOp(',')) { this.p++; args.push(this.additive()) }
          }
          this.eat(')')
          return { k: 'call', name, args }
        }
        // allow "sqrt 9" / "√9" / "sin x" style: bind to the next power-level operand
        return { k: 'call', name, args: [this.power()] }
      }
      return { k: 'var', name }
    }
    throw new ExpressionError(`Operador inesperado: "${t.v}"`)
  }
}

// Lanczos approximation for Γ(z)
export function gamma(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z))
  const g = 7
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  z -= 1
  let x = c[0]
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i)
  const t = z + g + 0.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x
}

export function factorial(n: number): number {
  if (n < 0 && Number.isInteger(n)) return NaN
  if (Number.isInteger(n)) {
    if (n > 170) return Infinity
    let r = 1
    for (let i = 2; i <= n; i++) r *= i
    return r
  }
  return gamma(n + 1)
}

export function nCr(n: number, r: number) {
  if (r < 0 || r > n) return 0
  r = Math.min(r, n - r)
  let res = 1
  for (let i = 1; i <= r; i++) res = (res * (n - r + i)) / i
  return Math.round(res)
}

export function nPr(n: number, r: number) {
  if (r < 0 || r > n) return 0
  let res = 1
  for (let i = 0; i < r; i++) res *= n - i
  return res
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b))
  while (b) [a, b] = [b, a % b]
  return a
}

export function lcm(a: number, b: number) {
  if (a === 0 || b === 0) return 0
  return Math.abs(Math.round(a) * Math.round(b)) / gcd(a, b)
}

type Fn = (args: number[], toRad: (x: number) => number, fromRad: (x: number) => number) => number

const one = (f: (x: number) => number): Fn => (a) => f(a[0])

const FUNCTIONS: Record<string, Fn> = {
  sin: (a, r) => Math.sin(r(a[0])),
  cos: (a, r) => Math.cos(r(a[0])),
  tan: (a, r) => Math.tan(r(a[0])),
  asin: (a, _r, f) => f(Math.asin(a[0])),
  acos: (a, _r, f) => f(Math.acos(a[0])),
  atan: (a, _r, f) => f(Math.atan(a[0])),
  sinh: one(Math.sinh), cosh: one(Math.cosh), tanh: one(Math.tanh),
  sqrt: one(Math.sqrt), cbrt: one(Math.cbrt), abs: one(Math.abs),
  ln: one(Math.log), log2: one(Math.log2), exp: one(Math.exp),
  log: (a) => (a.length > 1 ? Math.log(a[0]) / Math.log(a[1]) : Math.log10(a[0])),
  root: (a) => (a[1] % 2 === 1 && a[0] < 0 ? -Math.pow(-a[0], 1 / a[1]) : Math.pow(a[0], 1 / a[1])),
  floor: one(Math.floor), ceil: one(Math.ceil), round: one(Math.round), sign: one(Math.sign),
  min: (a) => Math.min(...a), max: (a) => Math.max(...a),
  mod: (a) => ((a[0] % a[1]) + a[1]) % a[1],
  fact: (a) => factorial(a[0]),
  gamma: one(gamma),
  nCr: (a) => nCr(a[0], a[1]), nPr: (a) => nPr(a[0], a[1]),
  gcd: (a) => a.reduce((x, y) => gcd(x, y)), lcm: (a) => a.reduce((x, y) => lcm(x, y)),
}

export const FUNCTION_NAMES = Object.keys(FUNCTIONS)

export type Compiled = (vars?: Record<string, number>) => number

function compileNode(n: Node, ctx: EvalContext): Compiled {
  switch (n.k) {
    case 'num': { const v = n.v; return () => v }
    case 'var': {
      const name = n.name
      if (name in CONSTANTS) { const v = CONSTANTS[name]; return () => v }
      const fixed = ctx.vars?.[name]
      return (vars) => {
        const v = vars?.[name] ?? fixed
        if (v === undefined) throw new ExpressionError(`Variável desconhecida: "${name}"`)
        return v
      }
    }
    case 'neg': { const a = compileNode(n.a, ctx); return (v) => -a(v) }
    case 'post': {
      const a = compileNode(n.a, ctx)
      return n.op === '!' ? (v) => factorial(a(v)) : (v) => a(v) / 100
    }
    case 'bin': {
      const a = compileNode(n.a, ctx), b = compileNode(n.b, ctx)
      switch (n.op) {
        case '+': return (v) => a(v) + b(v)
        case '-': return (v) => a(v) - b(v)
        case '*': return (v) => a(v) * b(v)
        case '/': return (v) => a(v) / b(v)
        case '^': return (v) => Math.pow(a(v), b(v))
      }
      throw new ExpressionError(`Operador inválido ${n.op}`)
    }
    case 'call': {
      const f = FUNCTIONS[n.name]
      const args = n.args.map((x) => compileNode(x, ctx))
      const deg = ctx.angle === 'deg'
      const toRad = deg ? (x: number) => (x * Math.PI) / 180 : (x: number) => x
      const fromRad = deg ? (x: number) => (x * 180) / Math.PI : (x: number) => x
      return (v) => f(args.map((g) => g(v)), toRad, fromRad)
    }
  }
}

export function compile(expr: string, ctx: EvalContext = {}): Compiled {
  return compileNode(new Parser(tokenize(expr)).parse(), ctx)
}

export function evaluate(expr: string, ctx: EvalContext = {}): number {
  return compile(expr, ctx)(ctx.vars)
}

/** Returns the free (non-constant) variable names used in an expression. */
export function freeVariables(expr: string): string[] {
  const found = new Set<string>()
  const walk = (n: Node) => {
    if (n.k === 'var' && !(n.name in CONSTANTS)) found.add(n.name)
    if (n.k === 'neg' || n.k === 'post') walk(n.a)
    if (n.k === 'bin') { walk(n.a); walk(n.b) }
    if (n.k === 'call') n.args.forEach(walk)
  }
  walk(new Parser(tokenize(expr)).parse())
  return [...found]
}

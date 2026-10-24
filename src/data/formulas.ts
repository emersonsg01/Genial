// Data-driven formula library. "eq" formulas define one output computed from the
// other variables; the UI can solve for ANY variable numerically. "custom" formulas
// return a list of results (e.g. both roots of a quadratic).
import { quadratic, linear2x2, isPrime, primeFactors } from '../services/math'
import { gcd, lcm, nCr, nPr, factorial } from '../lib/expression'
import { texNum } from '../lib/format'

export type Area = 'math' | 'physics'
export type Vals = Record<string, number>

export interface FormulaVar {
  key: string
  sym: string // TeX
  name: string
  unit: string
  def: number
}

interface Base {
  id: string
  title: string
  area: Area
  topic: string
  tex: string
  note?: string
}

export interface EqFormula extends Base {
  kind: 'eq'
  vars: FormulaVar[]
  out: string
  fn: (v: Vals) => number
}

export interface CustomOutput {
  label: string // TeX
  value: string // TeX
}

export interface CustomFormula extends Base {
  kind: 'custom'
  vars: FormulaVar[]
  compute: (v: Vals) => CustomOutput[]
}

export type Formula = EqFormula | CustomFormula

const v = (key: string, sym: string, name: string, unit: string, def: number): FormulaVar => ({ key, sym, name, unit, def })
const rad = (deg: number) => (deg * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI
const R = String.raw

const G = 6.6743e-11
const KE = 8.9875517923e9
const C = 299792458
const H = 6.62607015e-34
const RGAS = 8.314462618

const eq = (f: Omit<EqFormula, 'kind'>): EqFormula => ({ kind: 'eq', ...f })
const custom = (f: Omit<CustomFormula, 'kind'>): CustomFormula => ({ kind: 'custom', ...f })

export const FORMULAS: Formula[] = [
  // ------------------------------------------------------------- MATEMÁTICA
  custom({
    id: 'bhaskara', title: 'Equação do 2º grau', area: 'math', topic: 'Álgebra',
    tex: R`ax^2 + bx + c = 0 \;\Rightarrow\; x = \dfrac{-b \pm \sqrt{\Delta}}{2a},\quad \Delta = b^2 - 4ac`,
    vars: [v('a', 'a', 'Coeficiente a', '', 1), v('b', 'b', 'Coeficiente b', '', -3), v('c', 'c', 'Coeficiente c', '', 2)],
    compute: ({ a, b, c }) => {
      const r = quadratic(a, b, c)
      const root = (x: { re: number; im: number }) =>
        x.im === 0 ? texNum(x.re) : `${texNum(x.re)} ${x.im > 0 ? '+' : '-'} ${texNum(Math.abs(x.im))}\\,i`
      return [
        { label: R`\Delta`, value: texNum(r.delta) },
        ...r.roots.map((x, i) => ({ label: r.roots.length === 1 ? 'x' : `x_${i + 1}`, value: root(x) })),
        { label: R`\text{Vértice}`, value: R`(${texNum(r.vertex.x)},\ ${texNum(r.vertex.y)})` },
        { label: R`\text{Concavidade}`, value: a > 0 ? R`\text{para cima} \smile` : R`\text{para baixo} \frown` },
      ]
    },
  }),
  custom({
    id: 'sistema2x2', title: 'Sistema linear 2×2', area: 'math', topic: 'Álgebra',
    tex: R`\begin{cases} a_1x + b_1y = c_1 \\ a_2x + b_2y = c_2 \end{cases}`,
    note: 'Resolvido pela regra de Cramer.',
    vars: [
      v('a1', 'a_1', 'a₁', '', 2), v('b1', 'b_1', 'b₁', '', 1), v('c1', 'c_1', 'c₁', '', 5),
      v('a2', 'a_2', 'a₂', '', 1), v('b2', 'b_2', 'b₂', '', -1), v('c2', 'c_2', 'c₂', '', 1),
    ],
    compute: ({ a1, b1, c1, a2, b2, c2 }) => {
      const r = linear2x2(a1, b1, c1, a2, b2, c2)
      if (!r) return [{ label: R`\det`, value: R`0 \;\Rightarrow\; \text{sem solução única}` }]
      return [{ label: R`\det`, value: texNum(r.det) }, { label: 'x', value: texNum(r.x) }, { label: 'y', value: texNum(r.y) }]
    },
  }),
  custom({
    id: 'combinatoria', title: 'Análise combinatória', area: 'math', topic: 'Combinatória',
    tex: R`C_{n,k} = \dfrac{n!}{k!\,(n-k)!} \qquad A_{n,k} = \dfrac{n!}{(n-k)!}`,
    vars: [v('n', 'n', 'Total de elementos', '', 10), v('k', 'k', 'Escolhidos', '', 3)],
    compute: ({ n, k }) => [
      { label: 'n!', value: texNum(factorial(n)) },
      { label: R`C_{n,k}`, value: texNum(nCr(n, k)) },
      { label: R`A_{n,k}`, value: texNum(nPr(n, k)) },
      { label: R`\text{Com repetição } n^k`, value: texNum(n ** k) },
    ],
  }),
  custom({
    id: 'mdcmmc', title: 'MDC, MMC e primos', area: 'math', topic: 'Aritmética',
    tex: R`\mathrm{mdc}(a,b)\cdot\mathrm{mmc}(a,b) = |a\cdot b|`,
    vars: [v('a', 'a', 'Número a', '', 84), v('b', 'b', 'Número b', '', 36)],
    compute: ({ a, b }) => {
      const factor = (n: number) => primeFactors(n).map(([p, k]) => (k > 1 ? `${p}^{${k}}` : `${p}`)).join(R` \cdot `) || String(n)
      return [
        { label: R`\mathrm{mdc}`, value: texNum(gcd(a, b)) },
        { label: R`\mathrm{mmc}`, value: texNum(lcm(a, b)) },
        { label: 'a', value: `${factor(a)}${isPrime(a) ? R`\ \text{(primo)}` : ''}` },
        { label: 'b', value: `${factor(b)}${isPrime(b) ? R`\ \text{(primo)}` : ''}` },
      ]
    },
  }),
  eq({
    id: 'regra3', title: 'Regra de três', area: 'math', topic: 'Aritmética',
    tex: R`\dfrac{a}{b} = \dfrac{c}{x}`,
    vars: [v('a', 'a', 'a', '', 2), v('b', 'b', 'b', '', 10), v('c', 'c', 'c', '', 5), v('x', 'x', 'x', '', 25)],
    out: 'x', fn: ({ a, b, c }) => (b * c) / a,
  }),
  eq({
    id: 'porcentagem', title: 'Porcentagem', area: 'math', topic: 'Aritmética',
    tex: R`P = V \cdot \dfrac{p}{100}`,
    vars: [v('V', 'V', 'Valor', '', 250), v('p', 'p', 'Percentual', '%', 15), v('P', 'P', 'Parte', '', 37.5)],
    out: 'P', fn: ({ V, p }) => (V * p) / 100,
  }),
  eq({
    id: 'pitagoras', title: 'Teorema de Pitágoras', area: 'math', topic: 'Geometria',
    tex: R`c = \sqrt{a^2 + b^2}`,
    vars: [v('a', 'a', 'Cateto a', '', 3), v('b', 'b', 'Cateto b', '', 4), v('c', 'c', 'Hipotenusa', '', 5)],
    out: 'c', fn: ({ a, b }) => Math.hypot(a, b),
  }),
  eq({
    id: 'leicossenos', title: 'Lei dos cossenos', area: 'math', topic: 'Trigonometria',
    tex: R`c = \sqrt{a^2 + b^2 - 2ab\cos\gamma}`,
    vars: [v('a', 'a', 'Lado a', '', 7), v('b', 'b', 'Lado b', '', 5), v('g', R`\gamma`, 'Ângulo entre a e b', '°', 60), v('c', 'c', 'Lado c', '', 6.245)],
    out: 'c', fn: ({ a, b, g }) => Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad(g))),
  }),
  eq({
    id: 'distancia', title: 'Distância entre pontos', area: 'math', topic: 'Geometria analítica',
    tex: R`d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}`,
    vars: [v('x1', 'x_1', 'x₁', '', 1), v('y1', 'y_1', 'y₁', '', 2), v('x2', 'x_2', 'x₂', '', 4), v('y2', 'y_2', 'y₂', '', 6), v('d', 'd', 'Distância', '', 5)],
    out: 'd', fn: ({ x1, y1, x2, y2 }) => Math.hypot(x2 - x1, y2 - y1),
  }),
  eq({
    id: 'circulo', title: 'Área do círculo', area: 'math', topic: 'Geometria',
    tex: R`A = \pi r^2`,
    vars: [v('r', 'r', 'Raio', '', 2), v('A', 'A', 'Área', '', 12.566)],
    out: 'A', fn: ({ r }) => Math.PI * r * r,
  }),
  eq({
    id: 'circunferencia', title: 'Comprimento da circunferência', area: 'math', topic: 'Geometria',
    tex: R`C = 2\pi r`,
    vars: [v('r', 'r', 'Raio', '', 2), v('C', 'C', 'Comprimento', '', 12.566)],
    out: 'C', fn: ({ r }) => 2 * Math.PI * r,
  }),
  eq({
    id: 'triangulo', title: 'Área do triângulo', area: 'math', topic: 'Geometria',
    tex: R`A = \dfrac{b \cdot h}{2}`,
    vars: [v('b', 'b', 'Base', '', 6), v('h', 'h', 'Altura', '', 4), v('A', 'A', 'Área', '', 12)],
    out: 'A', fn: ({ b, h }) => (b * h) / 2,
  }),
  eq({
    id: 'heron', title: 'Fórmula de Heron', area: 'math', topic: 'Geometria',
    tex: R`A = \sqrt{s(s-a)(s-b)(s-c)},\quad s = \tfrac{a+b+c}{2}`,
    vars: [v('a', 'a', 'Lado a', '', 3), v('b', 'b', 'Lado b', '', 4), v('c', 'c', 'Lado c', '', 5), v('A', 'A', 'Área', '', 6)],
    out: 'A', fn: ({ a, b, c }) => { const s = (a + b + c) / 2; return Math.sqrt(s * (s - a) * (s - b) * (s - c)) },
  }),
  eq({
    id: 'trapezio', title: 'Área do trapézio', area: 'math', topic: 'Geometria',
    tex: R`A = \dfrac{(B + b)\,h}{2}`,
    vars: [v('B', 'B', 'Base maior', '', 8), v('b', 'b', 'Base menor', '', 4), v('h', 'h', 'Altura', '', 3), v('A', 'A', 'Área', '', 18)],
    out: 'A', fn: ({ B, b, h }) => ((B + b) * h) / 2,
  }),
  eq({
    id: 'esfera', title: 'Volume da esfera', area: 'math', topic: 'Geometria espacial',
    tex: R`V = \dfrac{4}{3}\pi r^3`,
    vars: [v('r', 'r', 'Raio', '', 3), v('V', 'V', 'Volume', '', 113.1)],
    out: 'V', fn: ({ r }) => (4 / 3) * Math.PI * r ** 3,
  }),
  eq({
    id: 'cilindro', title: 'Volume do cilindro', area: 'math', topic: 'Geometria espacial',
    tex: R`V = \pi r^2 h`,
    vars: [v('r', 'r', 'Raio', '', 2), v('h', 'h', 'Altura', '', 5), v('V', 'V', 'Volume', '', 62.83)],
    out: 'V', fn: ({ r, h }) => Math.PI * r * r * h,
  }),
  eq({
    id: 'cone', title: 'Volume do cone', area: 'math', topic: 'Geometria espacial',
    tex: R`V = \dfrac{\pi r^2 h}{3}`,
    vars: [v('r', 'r', 'Raio', '', 2), v('h', 'h', 'Altura', '', 6), v('V', 'V', 'Volume', '', 25.13)],
    out: 'V', fn: ({ r, h }) => (Math.PI * r * r * h) / 3,
  }),
  eq({
    id: 'pa', title: 'Termo geral da PA', area: 'math', topic: 'Sequências',
    tex: R`a_n = a_1 + (n - 1)\,r`,
    vars: [v('a1', 'a_1', 'Primeiro termo', '', 3), v('n', 'n', 'Posição', '', 10), v('r', 'r', 'Razão', '', 4), v('an', 'a_n', 'Termo', '', 39)],
    out: 'an', fn: ({ a1, n, r }) => a1 + (n - 1) * r,
  }),
  eq({
    id: 'somapa', title: 'Soma da PA', area: 'math', topic: 'Sequências',
    tex: R`S_n = \dfrac{(a_1 + a_n)\,n}{2}`,
    vars: [v('a1', 'a_1', 'Primeiro termo', '', 1), v('an', 'a_n', 'Último termo', '', 100), v('n', 'n', 'Nº de termos', '', 100), v('S', 'S_n', 'Soma', '', 5050)],
    out: 'S', fn: ({ a1, an, n }) => ((a1 + an) * n) / 2,
  }),
  eq({
    id: 'pg', title: 'Termo geral da PG', area: 'math', topic: 'Sequências',
    tex: R`a_n = a_1 \cdot q^{\,n-1}`,
    vars: [v('a1', 'a_1', 'Primeiro termo', '', 2), v('q', 'q', 'Razão', '', 3), v('n', 'n', 'Posição', '', 5), v('an', 'a_n', 'Termo', '', 162)],
    out: 'an', fn: ({ a1, q, n }) => a1 * q ** (n - 1),
  }),
  eq({
    id: 'logaritmo', title: 'Logaritmo', area: 'math', topic: 'Funções',
    tex: R`y = \log_b x \iff b^y = x`,
    vars: [v('b', 'b', 'Base', '', 2), v('x', 'x', 'Logaritmando', '', 1024), v('y', 'y', 'Logaritmo', '', 10)],
    out: 'y', fn: ({ b, x }) => Math.log(x) / Math.log(b),
  }),

  // ---------------------------------------------------------------- FÍSICA
  eq({
    id: 'mru', title: 'Movimento uniforme (MRU)', area: 'physics', topic: 'Cinemática',
    tex: R`s = s_0 + v\,t`,
    vars: [v('s0', 's_0', 'Posição inicial', 'm', 0), v('v', 'v', 'Velocidade', 'm/s', 20), v('t', 't', 'Tempo', 's', 5), v('s', 's', 'Posição', 'm', 100)],
    out: 's', fn: ({ s0, v: vel, t }) => s0 + vel * t,
  }),
  eq({
    id: 'vmedia', title: 'Velocidade média', area: 'physics', topic: 'Cinemática',
    tex: R`v_m = \dfrac{\Delta s}{\Delta t}`,
    vars: [v('ds', R`\Delta s`, 'Deslocamento', 'm', 100), v('dt', R`\Delta t`, 'Intervalo de tempo', 's', 10), v('vm', 'v_m', 'Velocidade média', 'm/s', 10)],
    out: 'vm', fn: ({ ds, dt }) => ds / dt,
  }),
  eq({
    id: 'mruv-v', title: 'MRUV — velocidade', area: 'physics', topic: 'Cinemática',
    tex: R`v = v_0 + a\,t`,
    vars: [v('v0', 'v_0', 'Velocidade inicial', 'm/s', 0), v('a', 'a', 'Aceleração', 'm/s²', 3), v('t', 't', 'Tempo', 's', 4), v('v', 'v', 'Velocidade', 'm/s', 12)],
    out: 'v', fn: ({ v0, a, t }) => v0 + a * t,
  }),
  eq({
    id: 'mruv-s', title: 'MRUV — função horária', area: 'physics', topic: 'Cinemática',
    tex: R`s = s_0 + v_0 t + \dfrac{a t^2}{2}`,
    vars: [v('s0', 's_0', 'Posição inicial', 'm', 0), v('v0', 'v_0', 'Velocidade inicial', 'm/s', 2), v('a', 'a', 'Aceleração', 'm/s²', 4), v('t', 't', 'Tempo', 's', 3), v('s', 's', 'Posição', 'm', 24)],
    out: 's', fn: ({ s0, v0, a, t }) => s0 + v0 * t + (a * t * t) / 2,
  }),
  eq({
    id: 'torricelli', title: 'Equação de Torricelli', area: 'physics', topic: 'Cinemática',
    tex: R`v^2 = v_0^2 + 2\,a\,\Delta s`,
    vars: [v('v0', 'v_0', 'Velocidade inicial', 'm/s', 0), v('a', 'a', 'Aceleração', 'm/s²', 2), v('ds', R`\Delta s`, 'Deslocamento', 'm', 25), v('v', 'v', 'Velocidade final', 'm/s', 10)],
    out: 'v', fn: ({ v0, a, ds }) => Math.sqrt(v0 * v0 + 2 * a * ds),
  }),
  eq({
    id: 'queda', title: 'Queda livre', area: 'physics', topic: 'Cinemática',
    tex: R`h = \dfrac{g\,t^2}{2}`,
    vars: [v('g', 'g', 'Gravidade', 'm/s²', 9.81), v('t', 't', 'Tempo de queda', 's', 3), v('h', 'h', 'Altura', 'm', 44.1)],
    out: 'h', fn: ({ g, t }) => (g * t * t) / 2,
  }),
  eq({
    id: 'mcu', title: 'Aceleração centrípeta', area: 'physics', topic: 'Cinemática',
    tex: R`a_c = \dfrac{v^2}{r} = \omega^2 r`,
    vars: [v('v', 'v', 'Velocidade', 'm/s', 10), v('r', 'r', 'Raio', 'm', 5), v('ac', 'a_c', 'Aceleração centrípeta', 'm/s²', 20)],
    out: 'ac', fn: ({ v: vel, r }) => (vel * vel) / r,
  }),
  eq({
    id: 'newton', title: '2ª Lei de Newton', area: 'physics', topic: 'Dinâmica',
    tex: R`F = m \cdot a`,
    vars: [v('m', 'm', 'Massa', 'kg', 10), v('a', 'a', 'Aceleração', 'm/s²', 2), v('F', 'F', 'Força resultante', 'N', 20)],
    out: 'F', fn: ({ m, a }) => m * a,
  }),
  eq({
    id: 'peso', title: 'Força peso', area: 'physics', topic: 'Dinâmica',
    tex: R`P = m \cdot g`,
    vars: [v('m', 'm', 'Massa', 'kg', 70), v('g', 'g', 'Gravidade', 'm/s²', 9.81), v('P', 'P', 'Peso', 'N', 686.7)],
    out: 'P', fn: ({ m, g }) => m * g,
  }),
  eq({
    id: 'atrito', title: 'Força de atrito', area: 'physics', topic: 'Dinâmica',
    tex: R`F_{at} = \mu \cdot N`,
    vars: [v('mu', R`\mu`, 'Coeficiente de atrito', '', 0.3), v('N', 'N', 'Força normal', 'N', 100), v('Fat', 'F_{at}', 'Atrito', 'N', 30)],
    out: 'Fat', fn: ({ mu, N }) => mu * N,
  }),
  eq({
    id: 'hooke', title: 'Lei de Hooke', area: 'physics', topic: 'Dinâmica',
    tex: R`F = k \cdot x`,
    vars: [v('k', 'k', 'Constante elástica', 'N/m', 200), v('x', 'x', 'Deformação', 'm', 0.1), v('F', 'F', 'Força elástica', 'N', 20)],
    out: 'F', fn: ({ k, x }) => k * x,
  }),
  eq({
    id: 'centripeta', title: 'Força centrípeta', area: 'physics', topic: 'Dinâmica',
    tex: R`F_c = \dfrac{m\,v^2}{r}`,
    vars: [v('m', 'm', 'Massa', 'kg', 2), v('v', 'v', 'Velocidade', 'm/s', 6), v('r', 'r', 'Raio', 'm', 3), v('Fc', 'F_c', 'Força centrípeta', 'N', 24)],
    out: 'Fc', fn: ({ m, v: vel, r }) => (m * vel * vel) / r,
  }),
  eq({
    id: 'gravitacao', title: 'Gravitação universal', area: 'physics', topic: 'Gravitação',
    tex: R`F = G\,\dfrac{m_1\,m_2}{d^2}`,
    vars: [v('m1', 'm_1', 'Massa 1', 'kg', 5.972e24), v('m2', 'm_2', 'Massa 2', 'kg', 7.348e22), v('d', 'd', 'Distância', 'm', 3.844e8), v('F', 'F', 'Força', 'N', 1.98e20)],
    out: 'F', fn: ({ m1, m2, d }) => (G * m1 * m2) / (d * d),
  }),
  eq({
    id: 'escape', title: 'Velocidade de escape', area: 'physics', topic: 'Gravitação',
    tex: R`v_e = \sqrt{\dfrac{2GM}{R}}`,
    vars: [v('M', 'M', 'Massa do astro', 'kg', 5.972e24), v('R', 'R', 'Raio', 'm', 6.371e6), v('ve', 'v_e', 'Velocidade de escape', 'm/s', 11186)],
    out: 've', fn: ({ M, R: r }) => Math.sqrt((2 * G * M) / r),
  }),
  eq({
    id: 'kepler3', title: '3ª Lei de Kepler', area: 'physics', topic: 'Gravitação',
    tex: R`T = 2\pi\sqrt{\dfrac{a^3}{GM}}`,
    vars: [v('a', 'a', 'Semieixo maior', 'm', 1.496e11), v('M', 'M', 'Massa central', 'kg', 1.989e30), v('T', 'T', 'Período orbital', 's', 3.156e7)],
    out: 'T', fn: ({ a, M }) => 2 * Math.PI * Math.sqrt(a ** 3 / (G * M)),
  }),
  eq({
    id: 'ec', title: 'Energia cinética', area: 'physics', topic: 'Energia',
    tex: R`E_c = \dfrac{m\,v^2}{2}`,
    vars: [v('m', 'm', 'Massa', 'kg', 1000), v('v', 'v', 'Velocidade', 'm/s', 20), v('Ec', 'E_c', 'Energia cinética', 'J', 200000)],
    out: 'Ec', fn: ({ m, v: vel }) => (m * vel * vel) / 2,
  }),
  eq({
    id: 'ep', title: 'Energia potencial gravitacional', area: 'physics', topic: 'Energia',
    tex: R`E_p = m\,g\,h`,
    vars: [v('m', 'm', 'Massa', 'kg', 10), v('g', 'g', 'Gravidade', 'm/s²', 9.81), v('h', 'h', 'Altura', 'm', 5), v('Ep', 'E_p', 'Energia potencial', 'J', 490.5)],
    out: 'Ep', fn: ({ m, g, h }) => m * g * h,
  }),
  eq({
    id: 'epel', title: 'Energia potencial elástica', area: 'physics', topic: 'Energia',
    tex: R`E_{el} = \dfrac{k\,x^2}{2}`,
    vars: [v('k', 'k', 'Constante elástica', 'N/m', 500), v('x', 'x', 'Deformação', 'm', 0.2), v('E', 'E_{el}', 'Energia elástica', 'J', 10)],
    out: 'E', fn: ({ k, x }) => (k * x * x) / 2,
  }),
  eq({
    id: 'trabalho', title: 'Trabalho de uma força', area: 'physics', topic: 'Energia',
    tex: R`W = F\,d\,\cos\theta`,
    vars: [v('F', 'F', 'Força', 'N', 50), v('d', 'd', 'Deslocamento', 'm', 10), v('th', R`\theta`, 'Ângulo', '°', 0), v('W', 'W', 'Trabalho', 'J', 500)],
    out: 'W', fn: ({ F, d, th }) => F * d * Math.cos(rad(th)),
  }),
  eq({
    id: 'potencia', title: 'Potência mecânica', area: 'physics', topic: 'Energia',
    tex: R`P = \dfrac{W}{\Delta t}`,
    vars: [v('W', 'W', 'Trabalho', 'J', 3000), v('dt', R`\Delta t`, 'Tempo', 's', 60), v('P', 'P', 'Potência', 'W', 50)],
    out: 'P', fn: ({ W, dt }) => W / dt,
  }),
  eq({
    id: 'momento', title: 'Quantidade de movimento', area: 'physics', topic: 'Energia',
    tex: R`\vec{p} = m\,\vec{v}`,
    vars: [v('m', 'm', 'Massa', 'kg', 0.16), v('v', 'v', 'Velocidade', 'm/s', 40), v('p', 'p', 'Momento linear', 'kg·m/s', 6.4)],
    out: 'p', fn: ({ m, v: vel }) => m * vel,
  }),
  eq({
    id: 'densidade', title: 'Densidade', area: 'physics', topic: 'Fluidos',
    tex: R`\rho = \dfrac{m}{V}`,
    vars: [v('m', 'm', 'Massa', 'kg', 1), v('V', 'V', 'Volume', 'm³', 0.001), v('rho', R`\rho`, 'Densidade', 'kg/m³', 1000)],
    out: 'rho', fn: ({ m, V }) => m / V,
  }),
  eq({
    id: 'pressao', title: 'Pressão', area: 'physics', topic: 'Fluidos',
    tex: R`p = \dfrac{F}{A}`,
    vars: [v('F', 'F', 'Força', 'N', 600), v('A', 'A', 'Área', 'm²', 0.04), v('p', 'p', 'Pressão', 'Pa', 15000)],
    out: 'p', fn: ({ F, A }) => F / A,
  }),
  eq({
    id: 'stevin', title: 'Lei de Stevin', area: 'physics', topic: 'Fluidos',
    tex: R`p = p_0 + \rho\,g\,h`,
    vars: [v('p0', 'p_0', 'Pressão na superfície', 'Pa', 101325), v('rho', R`\rho`, 'Densidade', 'kg/m³', 1000), v('g', 'g', 'Gravidade', 'm/s²', 9.81), v('h', 'h', 'Profundidade', 'm', 10), v('p', 'p', 'Pressão', 'Pa', 199425)],
    out: 'p', fn: ({ p0, rho, g, h }) => p0 + rho * g * h,
  }),
  eq({
    id: 'empuxo', title: 'Empuxo (Arquimedes)', area: 'physics', topic: 'Fluidos',
    tex: R`E = \rho_f\,V_{sub}\,g`,
    vars: [v('rho', R`\rho_f`, 'Densidade do fluido', 'kg/m³', 1000), v('V', 'V_{sub}', 'Volume submerso', 'm³', 0.002), v('g', 'g', 'Gravidade', 'm/s²', 9.81), v('E', 'E', 'Empuxo', 'N', 19.62)],
    out: 'E', fn: ({ rho, V, g }) => rho * V * g,
  }),
  eq({
    id: 'calor', title: 'Calor sensível', area: 'physics', topic: 'Termologia',
    tex: R`Q = m\,c\,\Delta T`,
    vars: [v('m', 'm', 'Massa', 'g', 500), v('c', 'c', 'Calor específico', 'cal/g°C', 1), v('dT', R`\Delta T`, 'Variação de temperatura', '°C', 20), v('Q', 'Q', 'Calor', 'cal', 10000)],
    out: 'Q', fn: ({ m, c, dT }) => m * c * dT,
  }),
  eq({
    id: 'dilatacao', title: 'Dilatação linear', area: 'physics', topic: 'Termologia',
    tex: R`\Delta L = L_0\,\alpha\,\Delta T`,
    vars: [v('L0', 'L_0', 'Comprimento inicial', 'm', 10), v('alpha', R`\alpha`, 'Coef. de dilatação', '1/°C', 1.2e-5), v('dT', R`\Delta T`, 'Variação de temperatura', '°C', 50), v('dL', R`\Delta L`, 'Dilatação', 'm', 0.006)],
    out: 'dL', fn: ({ L0, alpha, dT }) => L0 * alpha * dT,
  }),
  eq({
    id: 'gasideal', title: 'Gás ideal (Clapeyron)', area: 'physics', topic: 'Termologia',
    tex: R`pV = nRT`,
    vars: [v('n', 'n', 'Quantidade de matéria', 'mol', 1), v('T', 'T', 'Temperatura', 'K', 273.15), v('V', 'V', 'Volume', 'm³', 0.022414), v('p', 'p', 'Pressão', 'Pa', 101325)],
    out: 'p', fn: ({ n, T, V }) => (n * RGAS * T) / V,
  }),
  eq({
    id: 'carnot', title: 'Rendimento de Carnot', area: 'physics', topic: 'Termologia',
    tex: R`\eta = 1 - \dfrac{T_f}{T_q}`,
    vars: [v('Tf', 'T_f', 'Fonte fria', 'K', 300), v('Tq', 'T_q', 'Fonte quente', 'K', 600), v('eta', R`\eta`, 'Rendimento', '', 0.5)],
    out: 'eta', fn: ({ Tf, Tq }) => 1 - Tf / Tq,
  }),
  eq({
    id: 'onda', title: 'Equação fundamental da onda', area: 'physics', topic: 'Ondulatória',
    tex: R`v = \lambda \cdot f`,
    vars: [v('lambda', R`\lambda`, 'Comprimento de onda', 'm', 0.5), v('f', 'f', 'Frequência', 'Hz', 680), v('v', 'v', 'Velocidade', 'm/s', 340)],
    out: 'v', fn: ({ lambda, f }) => lambda * f,
  }),
  eq({
    id: 'pendulo', title: 'Pêndulo simples', area: 'physics', topic: 'Ondulatória',
    tex: R`T = 2\pi\sqrt{\dfrac{L}{g}}`,
    vars: [v('L', 'L', 'Comprimento', 'm', 1), v('g', 'g', 'Gravidade', 'm/s²', 9.81), v('T', 'T', 'Período', 's', 2.006)],
    out: 'T', fn: ({ L, g }) => 2 * Math.PI * Math.sqrt(L / g),
  }),
  eq({
    id: 'mola', title: 'Oscilador massa-mola', area: 'physics', topic: 'Ondulatória',
    tex: R`T = 2\pi\sqrt{\dfrac{m}{k}}`,
    vars: [v('m', 'm', 'Massa', 'kg', 0.5), v('k', 'k', 'Constante elástica', 'N/m', 50), v('T', 'T', 'Período', 's', 0.628)],
    out: 'T', fn: ({ m, k }) => 2 * Math.PI * Math.sqrt(m / k),
  }),
  eq({
    id: 'doppler', title: 'Efeito Doppler (fonte se aproximando)', area: 'physics', topic: 'Ondulatória',
    tex: R`f' = f\,\dfrac{v}{v - v_s}`,
    vars: [v('f', 'f', 'Frequência emitida', 'Hz', 440), v('v', 'v', 'Velocidade do som', 'm/s', 343), v('vs', 'v_s', 'Velocidade da fonte', 'm/s', 30), v('fl', "f'", 'Frequência percebida', 'Hz', 482.2)],
    out: 'fl', fn: ({ f, v: vel, vs }) => (f * vel) / (vel - vs),
  }),
  eq({
    id: 'snell', title: 'Lei de Snell', area: 'physics', topic: 'Óptica',
    tex: R`n_1 \sin\theta_1 = n_2 \sin\theta_2`,
    vars: [v('n1', 'n_1', 'Índice meio 1', '', 1), v('t1', R`\theta_1`, 'Ângulo de incidência', '°', 30), v('n2', 'n_2', 'Índice meio 2', '', 1.33), v('t2', R`\theta_2`, 'Ângulo de refração', '°', 22.08)],
    out: 't2', fn: ({ n1, t1, n2 }) => deg(Math.asin((n1 * Math.sin(rad(t1))) / n2)),
  }),
  eq({
    id: 'lente', title: 'Equação de Gauss (lentes)', area: 'physics', topic: 'Óptica',
    tex: R`\dfrac{1}{f} = \dfrac{1}{p} + \dfrac{1}{p'}`,
    vars: [v('f', 'f', 'Distância focal', 'cm', 10), v('p', 'p', 'Distância do objeto', 'cm', 30), v('pl', "p'", 'Distância da imagem', 'cm', 15)],
    out: 'pl', fn: ({ f, p }) => 1 / (1 / f - 1 / p),
  }),
  eq({
    id: 'ohm', title: 'Lei de Ohm', area: 'physics', topic: 'Eletricidade',
    tex: R`U = R \cdot i`,
    vars: [v('R', 'R', 'Resistência', 'Ω', 100), v('i', 'i', 'Corrente', 'A', 0.12), v('U', 'U', 'Tensão', 'V', 12)],
    out: 'U', fn: ({ R: r, i }) => r * i,
  }),
  eq({
    id: 'potel', title: 'Potência elétrica', area: 'physics', topic: 'Eletricidade',
    tex: R`P = U \cdot i = \dfrac{U^2}{R}`,
    vars: [v('U', 'U', 'Tensão', 'V', 220), v('i', 'i', 'Corrente', 'A', 10), v('P', 'P', 'Potência', 'W', 2200)],
    out: 'P', fn: ({ U, i }) => U * i,
  }),
  eq({
    id: 'energiael', title: 'Consumo de energia', area: 'physics', topic: 'Eletricidade',
    tex: R`E = P \cdot \Delta t`,
    note: 'Potência em kW e tempo em horas → energia em kWh.',
    vars: [v('P', 'P', 'Potência', 'kW', 5.5), v('t', R`\Delta t`, 'Tempo de uso', 'h', 0.5), v('E', 'E', 'Energia', 'kWh', 2.75)],
    out: 'E', fn: ({ P, t }) => P * t,
  }),
  eq({
    id: 'coulomb', title: 'Lei de Coulomb', area: 'physics', topic: 'Eletricidade',
    tex: R`F = k\,\dfrac{|q_1\,q_2|}{d^2}`,
    vars: [v('q1', 'q_1', 'Carga 1', 'C', 1e-6), v('q2', 'q_2', 'Carga 2', 'C', 2e-6), v('d', 'd', 'Distância', 'm', 0.1), v('F', 'F', 'Força elétrica', 'N', 1.797)],
    out: 'F', fn: ({ q1, q2, d }) => (KE * Math.abs(q1 * q2)) / (d * d),
  }),
  eq({
    id: 'capacitor', title: 'Capacitor', area: 'physics', topic: 'Eletricidade',
    tex: R`Q = C \cdot U`,
    vars: [v('C', 'C', 'Capacitância', 'F', 1e-4), v('U', 'U', 'Tensão', 'V', 12), v('Q', 'Q', 'Carga', 'C', 1.2e-3)],
    out: 'Q', fn: ({ C: cap, U }) => cap * U,
  }),
  custom({
    id: 'resistores', title: 'Associação de resistores', area: 'physics', topic: 'Eletricidade',
    tex: R`R_s = \sum R_i \qquad \dfrac{1}{R_p} = \sum \dfrac{1}{R_i}`,
    vars: [v('r1', 'R_1', 'R₁', 'Ω', 100), v('r2', 'R_2', 'R₂', 'Ω', 220), v('r3', 'R_3', 'R₃ (0 = ausente)', 'Ω', 330)],
    compute: ({ r1, r2, r3 }) => {
      const rs = [r1, r2, r3].filter((x) => x > 0)
      const series = rs.reduce((a, b) => a + b, 0)
      const parallel = 1 / rs.reduce((a, b) => a + 1 / b, 0)
      return [
        { label: R`R_{\text{série}}`, value: R`${texNum(series)}\ \Omega` },
        { label: R`R_{\text{paralelo}}`, value: R`${texNum(parallel)}\ \Omega` },
      ]
    },
  }),
  eq({
    id: 'einstein', title: 'Equivalência massa-energia', area: 'physics', topic: 'Física moderna',
    tex: R`E = m\,c^2`,
    vars: [v('m', 'm', 'Massa', 'kg', 0.001), v('E', 'E', 'Energia', 'J', 8.988e13)],
    out: 'E', fn: ({ m }) => m * C * C,
  }),
  eq({
    id: 'foton', title: 'Energia do fóton', area: 'physics', topic: 'Física moderna',
    tex: R`E = h\,f = \dfrac{h\,c}{\lambda}`,
    vars: [v('lambda', R`\lambda`, 'Comprimento de onda', 'm', 5.5e-7), v('E', 'E', 'Energia', 'J', 3.61e-19)],
    out: 'E', fn: ({ lambda }) => (H * C) / lambda,
  }),
  eq({
    id: 'lorentz', title: 'Dilatação do tempo', area: 'physics', topic: 'Física moderna',
    tex: R`\Delta t = \dfrac{\Delta t_0}{\sqrt{1 - v^2/c^2}}`,
    note: 'Velocidade como fração de c (0 a 1).',
    vars: [v('t0', R`\Delta t_0`, 'Tempo próprio', 's', 1), v('beta', R`v/c`, 'Velocidade relativa', 'c', 0.8), v('t', R`\Delta t`, 'Tempo dilatado', 's', 1.667)],
    out: 't', fn: ({ t0, beta }) => t0 / Math.sqrt(1 - beta * beta),
  }),
  eq({
    id: 'meiavida', title: 'Decaimento radioativo', area: 'physics', topic: 'Física moderna',
    tex: R`N = N_0 \left(\tfrac{1}{2}\right)^{t / T_{1/2}}`,
    vars: [v('N0', 'N_0', 'Quantidade inicial', '', 1000), v('t', 't', 'Tempo decorrido', 'anos', 11460), v('T', R`T_{1/2}`, 'Meia-vida', 'anos', 5730), v('N', 'N', 'Quantidade restante', '', 250)],
    out: 'N', fn: ({ N0, t, T }) => N0 * 0.5 ** (t / T),
  }),
]

export const TOPICS = (area: Area) => [...new Set(FORMULAS.filter((f) => f.area === area).map((f) => f.topic))]

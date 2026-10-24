import React, { useEffect, useMemo, useState } from 'react'
import { MODULES } from '../modules/registry'
import { FORMULAS } from '../data/formulas'
import { UNIT_CATEGORIES } from '../services/units'
import { CONSTANTS } from '../services/physics'
import { evaluate } from '../lib/expression'
import { fmt, texNum } from '../lib/format'
import { navigate } from '../lib/route'
import { Tex } from '../components/ui'
import Icon from '../components/Icon'

const R = String.raw

const FAMOUS = [
  { tex: R`e^{i\pi} + 1 = 0`, name: 'Identidade de Euler' },
  { tex: R`\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}`, name: 'Integral de Gauss' },
  { tex: R`E = mc^2`, name: 'Equivalência massa-energia' },
  { tex: R`x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}`, name: 'Fórmula de Bhaskara' },
  { tex: R`\nabla \cdot \vec{E} = \dfrac{\rho}{\varepsilon_0}`, name: 'Lei de Gauss (Maxwell)' },
  { tex: R`\sum_{n=1}^{\infty} \dfrac{1}{n^2} = \dfrac{\pi^2}{6}`, name: 'Problema de Basileia' },
  { tex: R`F = G\dfrac{m_1 m_2}{r^2}`, name: 'Gravitação universal' },
  { tex: R`i\hbar\dfrac{\partial}{\partial t}\Psi = \hat{H}\Psi`, name: 'Equação de Schrödinger' },
]

const GLYPHS = ['∫', '∑', 'π', '√', '∞', 'Δ', 'λ', 'θ', 'ƒ(x)', '∂', 'Ω', 'φ']

export default function Home() {
  const [idx, setIdx] = useState(0)
  const [quick, setQuick] = useState('')
  const constant = useMemo(() => CONSTANTS[Math.floor(Math.random() * CONSTANTS.length)], [])

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % FAMOUS.length), 4500)
    return () => clearInterval(id)
  }, [])

  let quickResult: string | null = null
  try { if (quick.trim()) quickResult = fmt(evaluate(quick, { angle: 'deg' }), 10) } catch { quickResult = null }

  const counts = [
    { n: FORMULAS.filter((f) => f.area === 'math').length, label: 'fórmulas de matemática' },
    { n: FORMULAS.filter((f) => f.area === 'physics').length, label: 'fórmulas de física' },
    { n: UNIT_CATEGORIES.reduce((a, c) => a + c.units.length, 0), label: 'unidades em 15 grandezas' },
    { n: 4, label: 'temas visuais' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="card relative overflow-hidden !p-6 md:!p-10">
        {GLYPHS.map((g, i) => (
          <span key={g} className="glyph hidden md:block" style={{
            left: `${45 + ((i * 37) % 52)}%`, top: `${(i * 53) % 85}%`, fontSize: `${1.2 + (i % 4) * 0.6}rem`, animationDelay: `${-i * 0.8}s`,
          }}>{g}</span>
        ))}
        <div className="relative grid grid-cols-1 items-center gap-8 xl:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="chip mb-4"><Icon name="sparkles" size={14} /> Laboratório de cálculo</span>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Matemática e física, <span className="gradient-text">genialmente simples.</span>
            </h1>
            <p className="muted mt-4 max-w-xl text-base md:text-lg">
              Calculadora científica, gráficos de funções, mais de {FORMULAS.length} fórmulas que se resolvem para qualquer variável,
              simulações animadas, conversor de unidades, finanças e estatística — tudo em um só lugar.
            </p>
            <div className="mt-6 max-w-xl">
              <div className="calc-screen flex items-center gap-3">
                <Icon name="calc" className="muted shrink-0" />
                <input
                  className="calc-input !text-left !text-lg"
                  placeholder="Calcule algo agora: 2^10 + sqrt(144)"
                  value={quick}
                  onChange={(e) => setQuick(e.target.value)}
                  aria-label="Cálculo rápido"
                />
                <span className="mono shrink-0 text-lg font-semibold gradient-text">{quickResult !== null ? `= ${quickResult}` : ''}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn btn-primary" onClick={() => navigate('calculadora')}>Abrir calculadora <Icon name="arrow" size={16} /></button>
                <button className="btn" onClick={() => navigate('graficos')}>Plotar funções</button>
              </div>
            </div>
          </div>

          <div className="tex-out relative flex min-h-[220px] flex-col items-center justify-center !p-6 text-center" style={{ background: 'color-mix(in srgb, var(--bg) 55%, transparent)' }}>
            <div key={idx} className="max-w-full overflow-x-auto text-lg md:text-2xl" style={{ animation: 'rise 500ms ease both' }}>
              <Tex block>{FAMOUS[idx].tex}</Tex>
            </div>
            <div className="muted mt-3 text-sm">{FAMOUS[idx].name}</div>
            <div className="mt-4 flex gap-1.5">
              {FAMOUS.map((_, i) => (
                <button key={i} aria-label={`Equação ${i + 1}`} onClick={() => setIdx(i)} className="h-1.5 rounded-full transition-all"
                  style={{ width: i === idx ? 22 : 8, background: i === idx ? 'var(--accent)' : 'var(--border)' }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {counts.map((c) => (
          <div key={c.label} className="card !p-4">
            <div className="gradient-text text-3xl font-bold mono">{c.n}</div>
            <div className="muted text-sm">{c.label}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MODULES.filter((m) => m.id !== 'inicio').map((m, i) => (
          <button key={m.id} className="card module-card" style={{ animationDelay: `${i * 50}ms` }} onClick={() => navigate(m.id)}>
            <span className="brand-mark !h-11 !w-11 !rounded-2xl"><Icon name={m.icon} size={20} /></span>
            <span className="mt-4 block text-base font-semibold">{m.name}</span>
            <span className="muted mt-1 block text-sm">{m.description}</span>
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="muted mb-2 flex items-center gap-2 text-xs uppercase tracking-wider"><Icon name="atom" size={14} /> Constante do momento</div>
          <div className="text-lg font-semibold">{constant.name}</div>
          <div className="mt-2 text-xl"><Tex>{`${constant.symbol} = ${texNum(constant.value, 9)}\\ ${constant.unit}`}</Tex></div>
        </div>
        <div className="card">
          <div className="muted mb-2 flex items-center gap-2 text-xs uppercase tracking-wider"><Icon name="search" size={14} /> Atalho</div>
          <div className="text-lg font-semibold">Encontre qualquer coisa em segundos</div>
          <p className="muted mt-2 text-sm">
            Pressione <span className="kbd">Ctrl</span> + <span className="kbd">K</span> e digite “Ohm”, “Bhaskara”, “pressão” ou “ano-luz”.
            Todos os campos numéricos aceitam expressões como <span className="mono">2pi</span> ou <span className="mono">3e8</span>.
          </p>
        </div>
      </section>
    </div>
  )
}

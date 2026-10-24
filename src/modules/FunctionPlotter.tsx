import React, { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { compile } from '../lib/expression'
import { derivative, findRoots, simpson } from '../lib/numeric'
import { fmt } from '../lib/format'
import { alpha, baseOptions } from '../lib/chart'
import { useTheme } from '../theme/ThemeContext'
import { Card, ChartBox, NumberField, Stat } from '../components/ui'
import Icon from '../components/Icon'

interface Fn { id: number; expr: string; visible: boolean }

const PRESETS: { label: string; fns: string[]; range: [number, number] }[] = [
  { label: 'Trigonometria', fns: ['sin(x)', 'cos(x)', 'tan(x)'], range: [-2 * Math.PI, 2 * Math.PI] },
  { label: 'Parábola e reta', fns: ['x^2 - 4', '2x + 1'], range: [-5, 5] },
  { label: 'Exponencial × log', fns: ['exp(x)', 'ln(x)', 'x'], range: [-3, 5] },
  { label: 'Onda amortecida', fns: ['exp(-x/5) sin(3x)', 'exp(-x/5)', '-exp(-x/5)'], range: [0, 20] },
  { label: 'Gaussiana', fns: ['exp(-x^2/2) / sqrt(2pi)'], range: [-4, 4] },
  { label: 'Polinômio cúbico', fns: ['x^3 - 3x^2 - x + 3'], range: [-3, 5] },
  { label: 'Sinc', fns: ['sin(x)/x'], range: [-20, 20] },
  { label: 'Coração ♥', fns: ['sqrt(1 - (abs(x) - 1)^2)', 'acos(1 - abs(x)) - pi'], range: [-2, 2] },
]

const SAMPLES = 600

export default function FunctionPlotter() {
  const { theme } = useTheme()
  const [fns, setFns] = useState<Fn[]>([
    { id: 1, expr: 'sin(x) * x', visible: true },
    { id: 2, expr: 'x^2 / 10 - 2', visible: true },
  ])
  const [xmin, setXmin] = useState(-10)
  const [xmax, setXmax] = useState(10)
  const [focus, setFocus] = useState(0)
  const [showDeriv, setShowDeriv] = useState(false)
  const [x0, setX0] = useState(1)
  const nextId = React.useRef(3)

  const compiled = useMemo(() => fns.map((f) => {
    try {
      const g = compile(f.expr, { angle: 'rad' })
      g({ x: 1 }) // surfaces unknown-variable errors early
      return { fn: (x: number) => g({ x }), error: null as string | null }
    } catch (e) {
      return { fn: null, error: (e as Error).message }
    }
  }), [fns])

  const lo = Math.min(xmin, xmax)
  const hi = Math.max(xmin, xmax) === lo ? lo + 1 : Math.max(xmin, xmax)

  const { datasets, yRange } = useMemo(() => {
    const ys: number[] = []
    const sets: any[] = []
    const sample = (f: (x: number) => number) => {
      const pts: { x: number; y: number | null }[] = []
      let prev: number | null = null
      for (let i = 0; i <= SAMPLES; i++) {
        const x = lo + ((hi - lo) * i) / SAMPLES
        let y: number | null = f(x)
        if (!Number.isFinite(y)) y = null
        // break the line across poles (huge jump with sign change)
        if (y !== null && prev !== null && Math.sign(y) !== Math.sign(prev) && Math.abs(y - prev) > 50 * (hi - lo)) {
          pts.push({ x, y: null })
        }
        pts.push({ x, y })
        if (y !== null) ys.push(y)
        prev = y
      }
      return pts
    }
    fns.forEach((f, i) => {
      const c = compiled[i]
      if (!f.visible || !c.fn) return
      const color = theme.series[i % theme.series.length]
      sets.push({
        label: `f${sub(i + 1)}(x) = ${f.expr}`, data: sample(c.fn), borderColor: color, backgroundColor: alpha(color, 0.12),
        borderWidth: i === focus ? 3 : 2, pointRadius: 0, spanGaps: false, tension: 0, fill: false,
      })
      if (showDeriv && i === focus) {
        const g = c.fn
        sets.push({
          label: `f${sub(i + 1)}′(x)`, data: sample((x) => derivative(g, x)), borderColor: alpha(color, 0.8),
          borderDash: [6, 5], borderWidth: 1.5, pointRadius: 0, spanGaps: false,
        })
      }
    })
    const focusFn = compiled[focus]?.fn
    if (focusFn && Number.isFinite(focusFn(x0)) && x0 >= lo && x0 <= hi) {
      const y0 = focusFn(x0)
      const m = derivative(focusFn, x0)
      const color = theme.vars.accent3
      sets.push({
        label: 'Tangente em x₀', data: [{ x: lo, y: y0 + m * (lo - x0) }, { x: hi, y: y0 + m * (hi - x0) }],
        borderColor: alpha(color, 0.6), borderWidth: 1, borderDash: [2, 4], pointRadius: 0,
      })
      sets.push({ label: 'P(x₀)', data: [{ x: x0, y: y0 }], borderColor: color, backgroundColor: color, pointRadius: 6, pointHoverRadius: 8, showLine: false })
    }
    // robust auto range: clip outliers (poles) using quantiles
    const sorted = ys.sort((a, b) => a - b)
    let ylo = sorted[Math.floor(sorted.length * 0.02)] ?? -1
    let yhi = sorted[Math.ceil(sorted.length * 0.98) - 1] ?? 1
    if (ylo === yhi) { ylo -= 1; yhi += 1 }
    const pad = (yhi - ylo) * 0.12
    return { datasets: sets, yRange: [ylo - pad, yhi + pad] }
  }, [fns, compiled, lo, hi, theme, showDeriv, focus, x0])

  const analysis = useMemo(() => {
    const f = compiled[focus]?.fn
    if (!f) return null
    const roots = findRoots(f, lo, hi)
    let min = { x: NaN, y: Infinity }
    let max = { x: NaN, y: -Infinity }
    for (let i = 0; i <= 2000; i++) {
      const x = lo + ((hi - lo) * i) / 2000
      const y = f(x)
      if (!Number.isFinite(y)) continue
      if (y < min.y) min = { x, y }
      if (y > max.y) max = { x, y }
    }
    const integral = simpson(f, lo, hi, 2000)
    return { roots, min, max, integral, fx0: f(x0), dfx0: derivative(f, x0) }
  }, [compiled, focus, lo, hi, x0])

  const options = useMemo(() => {
    const o = baseOptions(theme, { linearX: true })
    o.scales.x.min = lo
    o.scales.x.max = hi
    o.scales.y.min = yRange[0]
    o.scales.y.max = yRange[1]
    o.animation = false
    o.plugins.legend.labels.filter = (item: any) => !String(item.text).startsWith('Tangente')
    o.plugins.tooltip.callbacks = { label: (c: any) => `${c.dataset.label.split(' = ')[0]}: (${fmt(c.parsed.x, 4)}, ${fmt(c.parsed.y, 4)})` }
    return o
  }, [theme, lo, hi, yRange])

  const update = (id: number, patch: Partial<Fn>) => setFns((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  const addFn = () => fns.length < 5 && setFns((l) => [...l, { id: nextId.current++, expr: '', visible: true }])
  const applyPreset = (p: typeof PRESETS[number]) => {
    setFns(p.fns.map((expr) => ({ id: nextId.current++, expr, visible: true })))
    setXmin(+p.range[0].toFixed(4)); setXmax(+p.range[1].toFixed(4)); setFocus(0)
  }

  return (
    <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        <Card title="Funções" subtitle="Use x como variável. Ângulos em radianos." actions={
          <button className="btn" onClick={addFn} disabled={fns.length >= 5}><Icon name="plus" size={16} /> Adicionar</button>
        }>
          <div className="flex flex-col gap-2.5">
            {fns.map((f, i) => {
              const color = theme.series[i % theme.series.length]
              return (
                <div key={f.id} className="flex items-center gap-2">
                  <button
                    className="h-9 w-9 shrink-0 rounded-xl border text-xs font-bold mono"
                    style={{ borderColor: color, background: f.visible ? alpha(color, 0.25) : 'transparent', color }}
                    title={f.visible ? 'Ocultar' : 'Mostrar'}
                    onClick={() => update(f.id, { visible: !f.visible })}
                  >
                    f{sub(i + 1)}
                  </button>
                  <div className={`field-wrap flex-1 ${compiled[i].error && f.expr ? 'field-bad' : ''}`}>
                    <input
                      className="field"
                      value={f.expr}
                      placeholder="ex.: x^2 - 3x + 1"
                      aria-label={`Função ${i + 1}`}
                      onFocus={() => setFocus(i)}
                      onChange={(e) => update(f.id, { expr: e.target.value })}
                      style={i === focus ? { borderColor: color } : undefined}
                    />
                  </div>
                  <button className="btn btn-ghost btn-icon" aria-label="Remover" onClick={() => setFns((l) => l.filter((x) => x.id !== f.id))}>
                    <Icon name="x" size={16} />
                  </button>
                </div>
              )
            })}
            {compiled[focus]?.error && fns[focus]?.expr && <p className="bad text-xs">{compiled[focus].error}</p>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <NumberField label="x mínimo" value={xmin} onChange={setXmin} />
            <NumberField label="x máximo" value={xmax} onChange={setXmax} />
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={showDeriv} onChange={(e) => setShowDeriv(e.target.checked)} className="accent-[var(--accent)]" />
            Mostrar derivada da função em foco
          </label>
        </Card>
        <Card title="Galeria">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => <button key={p.label} className="chip" onClick={() => applyPreset(p)}>{p.label}</button>)}
          </div>
        </Card>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <Card title="Plano cartesiano" subtitle={`Função em foco: f${sub(focus + 1)} — clique em um campo para trocar.`}>
          <ChartBox height={440}>
            <Line data={{ datasets }} options={options} />
          </ChartBox>
        </Card>

        <Card title={`Análise de f${sub(focus + 1)} em [${fmt(lo, 3)}; ${fmt(hi, 3)}]`}>
          {analysis ? (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Raízes encontradas" value={analysis.roots.length ? analysis.roots.slice(0, 6).map((r) => fmt(r, 4)).join(' · ') : 'nenhuma'} sub={analysis.roots.length > 6 ? `+${analysis.roots.length - 6} outras` : undefined} />
                <Stat label="Mínimo no intervalo" value={fmt(analysis.min.y, 4)} sub={`em x = ${fmt(analysis.min.x, 4)}`} />
                <Stat label="Máximo no intervalo" value={fmt(analysis.max.y, 4)} sub={`em x = ${fmt(analysis.max.x, 4)}`} />
                <Stat label="Integral definida ∫" value={fmt(analysis.integral, 6)} sub="regra de Simpson" accent />
              </div>
              <div className="mt-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
                <NumberField label="Ponto x₀ (tangente)" value={x0} onChange={setX0} />
                <Stat label="f(x₀)" value={fmt(analysis.fx0, 6)} />
                <Stat label="f′(x₀) — inclinação" value={fmt(analysis.dfx0, 6)} />
              </div>
            </>
          ) : <p className="muted text-sm">Digite uma função válida para ver a análise.</p>}
        </Card>
      </div>
    </div>
  )
}

function sub(n: number) {
  return String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[+d])
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Area, CustomFormula, EqFormula, FORMULAS, Formula, TOPICS, Vals } from '../data/formulas'
import { CONSTANTS } from '../services/physics'
import { solve } from '../lib/numeric'
import { fmt, texNum } from '../lib/format'
import { navigate } from '../lib/route'
import { alpha, baseOptions } from '../lib/chart'
import { useTheme } from '../theme/ThemeContext'
import { Card, ChartBox, NumberField, Tex } from '../components/ui'
import Icon from '../components/Icon'

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const unitTex = (u: string) => (u ? String.raw`\ \text{${u}}` : '')
const defaults = (f: Formula): Vals => Object.fromEntries(f.vars.map((x) => [x.key, x.def]))

/** Value of `unknown` given every other variable of an eq formula. */
function solveFor(f: EqFormula, vals: Vals, unknown: string): number | null {
  if (unknown === f.out) return f.fn(vals)
  const target = vals[f.out]
  const g = (x: number) => f.fn({ ...vals, [unknown]: x }) - target
  return solve(g, vals[unknown] || 1)
}

function EqPanel({ f }: { f: EqFormula }) {
  const { theme } = useTheme()
  const [vals, setVals] = useState<Vals>(() => defaults(f))
  const [unknown, setUnknown] = useState(f.out)
  const inputs = f.vars.filter((x) => x.key !== unknown)
  const [axis, setAxis] = useState(inputs[0].key)
  const axisKey = inputs.some((x) => x.key === axis) ? axis : inputs[0].key
  const uVar = f.vars.find((x) => x.key === unknown)!

  const result = useMemo(() => {
    try { return solveFor(f, vals, unknown) } catch { return null }
  }, [f, vals, unknown])

  // Relationship chart: unknown as a function of one chosen input, from 0 to 2× its current value.
  const series = useMemo(() => {
    const base = vals[axisKey]
    const span = base === 0 ? 10 : Math.abs(base) * 2
    const start = base === 0 ? -span / 2 : Math.min(0, base * 2)
    const end = base === 0 ? span / 2 : Math.max(0, base * 2)
    const pts: { x: number; y: number | null }[] = []
    for (let i = 0; i <= 60; i++) {
      const x = start + ((end - start) * i) / 60
      let y: number | null = null
      try { y = solveFor(f, { ...vals, [axisKey]: x }, unknown) } catch { /* ignore */ }
      pts.push({ x, y: y !== null && Number.isFinite(y) ? y : null })
    }
    return pts
  }, [f, vals, unknown, axisKey])

  const axisVar = f.vars.find((x) => x.key === axisKey)!
  const color = theme.vars.accent
  const options = useMemo(() => {
    const o = baseOptions(theme, { linearX: true, x: `${axisVar.name}${axisVar.unit ? ` (${axisVar.unit})` : ''}`, y: `${uVar.name}${uVar.unit ? ` (${uVar.unit})` : ''}` })
    o.plugins.legend.display = false
    o.plugins.tooltip.callbacks = { label: (c: any) => `${uVar.name}: ${fmt(c.parsed.y, 5)}` }
    return o
  }, [theme, axisVar, uVar])

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="muted text-sm">Resolver para</span>
        {f.vars.map((x) => (
          <button key={x.key} title={`Resolver para ${x.name}`} aria-pressed={x.key === unknown} className={`chip ${x.key === unknown ? 'chip-active' : ''}`} onClick={() => {
            // keep the solved value in the field when switching unknowns
            if (result !== null && Number.isFinite(result)) setVals((v) => ({ ...v, [unknown]: result }))
            setUnknown(x.key)
          }}>
            <Tex>{x.sym}</Tex>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {inputs.map((x) => (
          <NumberField key={x.key} sym={x.sym} label={x.name} unit={x.unit} value={vals[x.key]} onChange={(n) => setVals((v) => ({ ...v, [x.key]: n }))} />
        ))}
      </div>

      <div className="stat stat-accent mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="stat-label">{uVar.name}</div>
          <div className="stat-value" data-testid="formula-result">
            {result !== null && Number.isFinite(result)
              ? <Tex>{`${uVar.sym} = ${texNum(result)}${unitTex(uVar.unit)}`}</Tex>
              : <span className="bad text-base">Sem solução real para esses valores</span>}
          </div>
        </div>
        {result !== null && Number.isFinite(result) && (
          <button className="btn btn-ghost btn-icon" title="Copiar valor" onClick={() => navigator.clipboard?.writeText(String(result))}>
            <Icon name="copy" size={16} />
          </button>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold">Como <Tex>{uVar.sym}</Tex> varia com…</span>
          <select className="field select !w-auto !py-1.5 text-sm" value={axisKey} onChange={(e) => setAxis(e.target.value)} aria-label="Variável do eixo x">
            {inputs.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}
          </select>
        </div>
        <ChartBox height={240}>
          <Line
            data={{ datasets: [{ data: series, borderColor: color, backgroundColor: alpha(color, 0.15), fill: 'origin', pointRadius: 0, borderWidth: 2.5, tension: 0.25, spanGaps: false }] }}
            options={options}
          />
        </ChartBox>
      </div>
    </>
  )
}

function CustomPanel({ f }: { f: CustomFormula }) {
  const [vals, setVals] = useState<Vals>(() => defaults(f))
  const outputs = useMemo(() => {
    try { return f.compute(vals) } catch (e) { return [{ label: String.raw`\text{Erro}`, value: String.raw`\text{${(e as Error).message}}` }] }
  }, [f, vals])
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {f.vars.map((x) => (
          <NumberField key={x.key} sym={x.sym} label={x.name} unit={x.unit} value={vals[x.key]} onChange={(n) => setVals((v) => ({ ...v, [x.key]: n }))} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" data-testid="formula-result">
        {outputs.map((o, i) => (
          <div key={i} className={`stat ${i === 0 ? 'stat-accent' : ''}`}>
            <div className="stat-value"><Tex>{`${o.label} = ${o.value}`}</Tex></div>
          </div>
        ))}
      </div>
    </>
  )
}

function ConstantsCard() {
  return (
    <Card title="Constantes físicas" subtitle="Clique para copiar o valor.">
      <div className="table-wrap max-h-96">
        <table className="table">
          <thead><tr><th>Constante</th><th>Símbolo</th><th>Valor</th></tr></thead>
          <tbody>
            {CONSTANTS.map((c) => (
              <tr key={c.name} className="cursor-pointer" onClick={() => navigator.clipboard?.writeText(String(c.value))}>
                <td className="!font-sans">{c.name}</td>
                <td><Tex>{c.symbol}</Tex></td>
                <td><Tex>{`${texNum(c.value, 9)}\\ ${c.unit}`}</Tex></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default function FormulaExplorer({ area, selected }: { area: Area; selected?: string }) {
  const [topic, setTopic] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const all = FORMULAS.filter((f) => f.area === area)
  const topics = TOPICS(area)
  const current = all.find((f) => f.id === selected) ?? all[0]
  const list = all.filter((f) => (!topic || f.topic === topic) && normalize(`${f.title} ${f.topic}`).includes(normalize(q)))
  const moduleId = area === 'math' ? 'matematica' : 'fisica'
  const listRef = useRef<HTMLDivElement>(null)

  // keep the selected formula visible in the side list without scrolling the page
  useEffect(() => {
    const box = listRef.current
    const el = box?.querySelector<HTMLElement>('.nav-item.active')
    if (box && el && (el.offsetTop < box.scrollTop + box.offsetTop || el.offsetTop > box.scrollTop + box.offsetTop + box.clientHeight - 40)) {
      box.scrollTop = el.offsetTop - box.offsetTop - box.clientHeight / 3
    }
  }, [current.id])

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="!hidden xl:sticky xl:top-6 xl:!flex xl:max-h-[calc(100vh-3rem)] xl:flex-col xl:overflow-hidden">
        <div className="field-wrap mb-3">
          <input className="field !font-sans" placeholder={`Buscar entre ${all.length} fórmulas…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar fórmula" />
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button className={`chip ${!topic ? 'chip-active' : ''}`} onClick={() => setTopic(null)}>Todas</button>
          {topics.map((t) => <button key={t} className={`chip ${topic === t ? 'chip-active' : ''}`} onClick={() => setTopic(t)}>{t}</button>)}
        </div>
        <div ref={listRef} className="min-h-0 overflow-y-auto xl:flex-1">
          <ul className="flex flex-col gap-1">
            {list.map((f) => (
              <li key={f.id}>
                <button className={`nav-item !whitespace-normal ${f.id === current.id ? 'active' : ''}`} onClick={() => navigate(moduleId, f.id)}>
                  <span className="min-w-0">
                    <span className="block text-sm">{f.title}</span>
                    <span className="muted block text-xs">{f.topic}</span>
                  </span>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="muted p-3 text-sm">Nenhuma fórmula encontrada.</li>}
          </ul>
        </div>
      </Card>

      <div className="flex min-w-0 flex-col gap-5">
        <label className="block xl:hidden">
          <span className="label">Escolha a fórmula ({all.length})</span>
          <select className="field select" value={current.id} onChange={(e) => navigate(moduleId, e.target.value)} aria-label="Fórmula">
            {topics.map((t) => (
              <optgroup key={t} label={t}>
                {all.filter((f) => f.topic === t).map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <Card key={current.id} title={current.title} subtitle={current.topic}>
          <div className="tex-out mb-4 text-center">
            <Tex block>{current.tex}</Tex>
          </div>
          {current.note && <p className="muted mb-4 text-sm">💡 {current.note}</p>}
          {current.kind === 'eq' ? <EqPanel f={current} /> : <CustomPanel f={current} />}
        </Card>
        {area === 'physics' && <ConstantsCard />}
      </div>
    </div>
  )
}


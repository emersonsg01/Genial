import React, { useMemo, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { histogram, linearRegression, parseNumbers, parsePairs, summarize } from '../services/stats'
import { fmt, texNum } from '../lib/format'
import { alpha, baseOptions } from '../lib/chart'
import { useTheme } from '../theme/ThemeContext'
import { Card, ChartBox, NumberField, Segmented, Stat, Tex } from '../components/ui'

const SAMPLE = '7.2 8.5 6.9 9.1 7.8 8.0 5.5 9.6 8.3 7.1 6.4 8.8 7.9 9.0 6.7 8.2 7.5 8.6 7.0 9.3'
const SAMPLE_PAIRS = '1 2.1\n2 3.9\n3 6.2\n4 7.8\n5 10.1\n6 12.2\n7 13.8\n8 16.1'

function BoxPlot({ min, q1, median, q3, max }: { min: number; q1: number; median: number; q3: number; max: number }) {
  const span = max - min || 1
  const X = (v: number) => 20 + ((v - min) / span) * 560
  return (
    <svg viewBox="0 0 600 90" className="w-full" role="img" aria-label="Diagrama de caixa">
      <line x1={X(min)} y1="40" x2={X(q1)} y2="40" stroke="var(--muted)" strokeWidth="2" />
      <line x1={X(q3)} y1="40" x2={X(max)} y2="40" stroke="var(--muted)" strokeWidth="2" />
      <line x1={X(min)} y1="28" x2={X(min)} y2="52" stroke="var(--muted)" strokeWidth="2" />
      <line x1={X(max)} y1="28" x2={X(max)} y2="52" stroke="var(--muted)" strokeWidth="2" />
      <rect x={X(q1)} y="18" width={Math.max(2, X(q3) - X(q1))} height="44" rx="8" fill="color-mix(in srgb, var(--accent) 30%, transparent)" stroke="var(--accent)" strokeWidth="2" />
      <line x1={X(median)} y1="18" x2={X(median)} y2="62" stroke="var(--accent-2)" strokeWidth="3" />
      {[['mín', min], ['Q1', q1], ['Md', median], ['Q3', q3], ['máx', max]].map(([l, v], i) => (
        <text key={i} x={X(v as number)} y={i % 2 ? 84 : 12} textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">
          {l} {fmt(v as number, 3)}
        </text>
      ))}
    </svg>
  )
}

function Descriptive() {
  const { theme } = useTheme()
  const [text, setText] = useState(SAMPLE)
  const data = useMemo(() => parseNumbers(text), [text])
  const s = useMemo(() => summarize(data), [data])
  const h = useMemo(() => histogram(data), [data])
  const options = useMemo(() => {
    const o = baseOptions(theme, { x: 'Classe', y: 'Frequência' })
    o.plugins.legend.display = false
    return o
  }, [theme])

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card title="Dados" subtitle="Separe por espaço, vírgula ou nova linha. Use ; se usar vírgula decimal.">
        <textarea className="field !min-h-[12rem]" value={text} onChange={(e) => setText(e.target.value)} aria-label="Dados" />
        <div className="mt-3 flex items-center justify-between">
          <span className="muted text-xs">{data.length} valores lidos</span>
          <button className="chip" onClick={() => setText(Array.from({ length: 200 }, () => {
            // Box–Muller: normal sample with mean 50, sd 10
            const z = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random())
            return (50 + 10 * z).toFixed(1)
          }).join(' '))}>🎲 Gerar 200 valores normais</button>
        </div>
      </Card>
      <div className="flex min-w-0 flex-col gap-5">
        {s ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Média" value={fmt(s.mean, 5)} accent />
              <Stat label="Mediana" value={fmt(s.median, 5)} />
              <Stat label="Moda" value={s.modes.length ? s.modes.slice(0, 3).map((m) => fmt(m, 4)).join(' · ') : 'amodal'} />
              <Stat label="Desvio padrão (amostral)" value={fmt(s.stdSample, 5)} sub={`populacional: ${fmt(s.stdPop, 5)}`} />
              <Stat label="Variância (amostral)" value={fmt(s.varianceSample, 5)} sub={`populacional: ${fmt(s.variancePop, 5)}`} />
              <Stat label="Amplitude" value={fmt(s.range, 5)} sub={`${fmt(s.min, 4)} a ${fmt(s.max, 4)}`} />
              <Stat label="Coef. de variação" value={Number.isFinite(s.cv) ? `${fmt(s.cv * 100, 3)}%` : '—'} />
              <Stat label="Soma" value={fmt(s.sum, 6)} sub={`n = ${s.n}`} />
              <Stat label="Média geométrica" value={fmt(s.geometricMean, 5)} />
              <Stat label="Média harmônica" value={fmt(s.harmonicMean, 5)} />
              <Stat label="Q1 · Q3" value={`${fmt(s.q1, 4)} · ${fmt(s.q3, 4)}`} />
              <Stat label="Intervalo interquartil" value={fmt(s.iqr, 5)} />
            </div>
            <Card title="Diagrama de caixa"><BoxPlot {...s} /></Card>
            <Card title="Histograma" subtitle="Número de classes pela regra de Sturges.">
              <ChartBox height={280}>
                <Bar data={{ labels: h.labels, datasets: [{ data: h.counts, backgroundColor: alpha(theme.vars.accent, 0.7), hoverBackgroundColor: theme.vars.accent2, borderRadius: 8 }] }} options={options} />
              </ChartBox>
            </Card>
          </>
        ) : <Card><p className="muted">Digite alguns números para ver as estatísticas.</p></Card>}
      </div>
    </div>
  )
}

function Regression() {
  const { theme } = useTheme()
  const [text, setText] = useState(SAMPLE_PAIRS)
  const [xq, setXq] = useState(10)
  const { xs, ys } = useMemo(() => parsePairs(text), [text])
  const reg = useMemo(() => linearRegression(xs, ys), [xs, ys])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)

  const data = {
    datasets: [
      { label: 'Dados', data: xs.map((x, i) => ({ x, y: ys[i] })), showLine: false, pointRadius: 6, backgroundColor: alpha(theme.vars.accent2, 0.8), borderColor: theme.vars.accent2 },
      ...(reg ? [{ label: 'Reta ajustada', data: [minX, maxX].map((x) => ({ x, y: reg.slope * x + reg.intercept })), borderColor: theme.vars.accent, borderWidth: 2.5, pointRadius: 0 }] : []),
    ],
  }
  const options = useMemo(() => baseOptions(theme, { linearX: true, x: 'x', y: 'y' }), [theme])
  const strength = reg ? (Math.abs(reg.r) > 0.9 ? 'muito forte' : Math.abs(reg.r) > 0.7 ? 'forte' : Math.abs(reg.r) > 0.4 ? 'moderada' : 'fraca') : ''

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card title="Pares (x, y)" subtitle="Um par por linha.">
        <textarea className="field !min-h-[14rem]" value={text} onChange={(e) => setText(e.target.value)} aria-label="Pares" />
        <p className="muted mt-2 text-xs">{xs.length} pares lidos</p>
      </Card>
      <div className="flex min-w-0 flex-col gap-5">
        {reg ? (
          <>
            <Card>
              <div className="tex-out mb-4 text-center">
                <Tex block>{`\\hat{y} = ${texNum(reg.slope, 5)}\\,x ${reg.intercept < 0 ? '-' : '+'} ${texNum(Math.abs(reg.intercept), 5)}`}</Tex>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Coef. angular (a)" value={fmt(reg.slope, 6)} />
                <Stat label="Coef. linear (b)" value={fmt(reg.intercept, 6)} />
                <Stat label="Correlação r" value={fmt(reg.r, 5)} sub={`correlação ${strength} ${reg.r >= 0 ? 'positiva' : 'negativa'}`} />
                <Stat label="R²" value={fmt(reg.r2, 5)} sub={`${fmt(reg.r2 * 100, 2)}% da variação explicada`} accent />
              </div>
              <div className="mt-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
                <NumberField label="Prever y para x =" value={xq} onChange={setXq} />
                <Stat label="ŷ previsto" value={fmt(reg.slope * xq + reg.intercept, 6)} />
              </div>
            </Card>
            <Card title="Dispersão">
              <ChartBox height={320}><Line data={data} options={options} /></ChartBox>
            </Card>
          </>
        ) : <Card><p className="muted">Informe ao menos dois pares com x distintos.</p></Card>}
      </div>
    </div>
  )
}

export default function StatsLab() {
  const [tab, setTab] = useState<'desc' | 'reg'>('desc')
  return (
    <div className="flex flex-col gap-5">
      <Segmented value={tab} onChange={setTab} options={[{ value: 'desc', label: '📊 Estatística descritiva' }, { value: 'reg', label: '📉 Regressão linear' }]} />
      {tab === 'desc' ? <Descriptive /> : <Regression />}
    </div>
  )
}

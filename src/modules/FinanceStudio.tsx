import React, { useMemo, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { equivalentRate, investmentSeries, periodsToGoal, priceTable, realRate, sacTable, compoundSeries } from '../services/finance'
import { brl, fmt } from '../lib/format'
import { alpha, baseOptions } from '../lib/chart'
import { useTheme } from '../theme/ThemeContext'
import { Card, ChartBox, NumberField, Segmented, Stat, Tex } from '../components/ui'

const pct = (x: number, d = 4) => `${fmt(x * 100, d)}%`
const moneyTick = (v: number | string) => {
  const n = Number(v)
  return Math.abs(n) >= 1e6 ? `R$ ${fmt(n / 1e6, 1)} mi` : Math.abs(n) >= 1e3 ? `R$ ${fmt(n / 1e3, 1)} mil` : `R$ ${fmt(n, 0)}`
}

function Investment() {
  const { theme } = useTheme()
  const [initial, setInitial] = useState(5000)
  const [monthly, setMonthly] = useState(800)
  const [annual, setAnnual] = useState(11)
  const [years, setYears] = useState(15)
  const [goal, setGoal] = useState(1000000)
  const i = equivalentRate(annual / 100, 1 / 12)
  const n = Math.max(1, Math.round(years * 12))
  const series = useMemo(() => investmentSeries(initial, monthly, i, n), [initial, monthly, i, n])
  const last = series[series.length - 1]
  const goalMonths = periodsToGoal(initial, monthly, i, goal)
  const yearly = series.filter((p) => p.period % 12 === 0)

  const data = {
    labels: yearly.map((p) => `Ano ${p.period / 12}`),
    datasets: [
      { label: 'Total investido', data: yearly.map((p) => p.invested), backgroundColor: alpha(theme.series[1], 0.75), borderRadius: 6, stack: 's' },
      { label: 'Juros acumulados', data: yearly.map((p) => p.interest), backgroundColor: alpha(theme.series[0], 0.85), borderRadius: 6, stack: 's' },
    ],
  }
  const options = useMemo(() => {
    const o = baseOptions(theme)
    o.scales.x.stacked = true
    o.scales.y.stacked = true
    o.scales.y.ticks.callback = moneyTick
    o.plugins.tooltip.callbacks = { label: (c: any) => `${c.dataset.label}: ${brl(c.parsed.y)}` }
    return o
  }, [theme])

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card title="Simulador de investimento" subtitle="Aportes mensais com juros compostos.">
        <div className="flex flex-col gap-3">
          <NumberField label="Valor inicial" unit="R$" value={initial} onChange={setInitial} />
          <NumberField label="Aporte mensal" unit="R$" value={monthly} onChange={setMonthly} />
          <NumberField label="Rentabilidade anual" unit="% a.a." value={annual} onChange={setAnnual} />
          <NumberField label="Prazo" unit="anos" value={years} onChange={setYears} />
          <NumberField label="Meta" unit="R$" value={goal} onChange={setGoal} />
          <p className="muted text-xs">Taxa mensal equivalente: <span className="mono">{pct(i)}</span> a.m.</p>
        </div>
      </Card>
      <div className="flex min-w-0 flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Saldo final" value={brl(last.balance)} accent />
          <Stat label="Total investido" value={brl(last.invested)} />
          <Stat label="Juros ganhos" value={<span className="good">{brl(last.interest)}</span>} sub={`${fmt((last.interest / Math.max(1, last.balance)) * 100, 1)}% do saldo`} />
          <Stat label="Tempo até a meta" value={goalMonths === null ? '> 100 anos' : `${Math.floor(goalMonths / 12)}a ${goalMonths % 12}m`} sub={brl(goal)} />
        </div>
        <Card title="Evolução ano a ano">
          <ChartBox height={360}><Bar data={data} options={options} /></ChartBox>
        </Card>
      </div>
    </div>
  )
}

function Loan() {
  const { theme } = useTheme()
  const [principal, setPrincipal] = useState(300000)
  const [annual, setAnnual] = useState(10.5)
  const [months, setMonths] = useState(360)
  const [table, setTable] = useState<'price' | 'sac'>('sac')
  const i = equivalentRate(annual / 100, 1 / 12)
  const n = Math.max(1, Math.round(months))
  const price = useMemo(() => priceTable(principal, i, n), [principal, i, n])
  const sac = useMemo(() => sacTable(principal, i, n), [principal, i, n])
  const total = (rows: typeof price) => rows.reduce((a, r) => a + r.payment, 0)
  const step = Math.max(1, Math.floor(n / 120))
  const sampled = (rows: typeof price) => rows.filter((r) => r.n % step === 0 || r.n === 1)

  const data = {
    labels: sampled(price).map((r) => r.n),
    datasets: [
      { label: 'Price', data: sampled(price).map((r) => r.payment), borderColor: theme.series[0], backgroundColor: alpha(theme.series[0], 0.1), pointRadius: 0, borderWidth: 2.5 },
      { label: 'SAC', data: sampled(sac).map((r) => r.payment), borderColor: theme.series[1], backgroundColor: alpha(theme.series[1], 0.1), pointRadius: 0, borderWidth: 2.5 },
    ],
  }
  const options = useMemo(() => {
    const o = baseOptions(theme, { x: 'Parcela nº', y: 'Valor da parcela' })
    o.scales.y.ticks.callback = moneyTick
    o.plugins.tooltip.callbacks = { title: (c: any) => `Parcela ${c[0].label}`, label: (c: any) => `${c.dataset.label}: ${brl(c.parsed.y)}` }
    return o
  }, [theme])
  const rows = table === 'price' ? price : sac

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card title="Financiamento" subtitle="Compare Tabela Price e SAC.">
        <div className="flex flex-col gap-3">
          <NumberField label="Valor financiado" unit="R$" value={principal} onChange={setPrincipal} />
          <NumberField label="Juros anuais" unit="% a.a." value={annual} onChange={setAnnual} />
          <NumberField label="Prazo" unit="meses" value={months} onChange={setMonths} />
          <p className="muted text-xs">Taxa mensal equivalente: <span className="mono">{pct(i)}</span> a.m.</p>
        </div>
      </Card>
      <div className="flex min-w-0 flex-col gap-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {([['Price', price], ['SAC', sac]] as const).map(([name, r]) => (
            <div key={name} className="card !p-4">
              <div className="mb-2 font-semibold">{name}</div>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="1ª parcela" value={brl(r[0].payment)} />
                <Stat label="Última parcela" value={brl(r[r.length - 1].payment)} />
                <Stat label="Total pago" value={brl(total(r))} />
                <Stat label="Total de juros" value={<span className="bad">{brl(total(r) - principal)}</span>} />
              </div>
            </div>
          ))}
        </div>
        <p className="muted text-sm">
          {total(sac) < total(price)
            ? <>No SAC você economiza <b className="good">{brl(total(price) - total(sac))}</b> em juros, mas começa pagando parcelas maiores.</>
            : <>Nesse cenário, a Price sai mais barata em <b className="good">{brl(total(sac) - total(price))}</b>.</>}
        </p>
        <Card title="Parcelas ao longo do tempo">
          <ChartBox height={300}><Line data={data} options={options} /></ChartBox>
        </Card>
        <Card title="Tabela de amortização" actions={<Segmented size="sm" value={table} onChange={setTable} options={[{ value: 'sac', label: 'SAC' }, { value: 'price', label: 'Price' }]} />}>
          <div className="table-wrap max-h-96">
            <table className="table">
              <thead><tr><th>Nº</th><th>Parcela</th><th>Juros</th><th>Amortização</th><th>Saldo devedor</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.n}><td>{r.n}</td><td>{brl(r.payment)}</td><td>{brl(r.interest)}</td><td>{brl(r.amortization)}</td><td>{brl(r.balance)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Rates() {
  const { theme } = useTheme()
  const [annual, setAnnual] = useState(12)
  const [inflation, setInflation] = useState(4.5)
  const [capital, setCapital] = useState(1000)
  const [rate, setRate] = useState(5)
  const [periods, setPeriods] = useState(20)
  const monthly = equivalentRate(annual / 100, 1 / 12)
  const daily = equivalentRate(annual / 100, 1 / 252)
  const real = realRate(annual / 100, inflation / 100)
  const compound = compoundSeries(capital, rate / 100, Math.max(1, Math.round(periods)))
  const simple = compound.map((_, k) => capital * (1 + (rate / 100) * k))

  const data = {
    labels: compound.map((_, k) => k),
    datasets: [
      { label: 'Juros compostos', data: compound, borderColor: theme.series[0], backgroundColor: alpha(theme.series[0], 0.15), fill: '+1', pointRadius: 2, borderWidth: 2.5 },
      { label: 'Juros simples', data: simple, borderColor: theme.series[1], pointRadius: 2, borderWidth: 2.5 },
    ],
  }
  const options = useMemo(() => {
    const o = baseOptions(theme, { x: 'Período', y: 'Montante' })
    o.scales.y.ticks.callback = moneyTick
    o.plugins.tooltip.callbacks = { label: (c: any) => `${c.dataset.label}: ${brl(c.parsed.y)}` }
    return o
  }, [theme])

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <Card title="Equivalência e taxa real">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField label="Taxa nominal anual" unit="% a.a." value={annual} onChange={setAnnual} />
          <NumberField label="Inflação anual" unit="% a.a." value={inflation} onChange={setInflation} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Mensal equivalente" value={pct(monthly)} />
          <Stat label="Diária (252 d.u.)" value={pct(daily, 5)} />
          <Stat label="Taxa real (Fisher)" value={pct(real, 3)} accent />
        </div>
        <div className="tex-out mt-4 text-center">
          <Tex block>{String.raw`(1 + i_a) = (1 + i_m)^{12} \qquad 1 + r = \dfrac{1 + i}{1 + \pi}`}</Tex>
        </div>
      </Card>
      <Card title="Simples × compostos">
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="Capital" unit="R$" value={capital} onChange={setCapital} />
          <NumberField label="Taxa" unit="%" value={rate} onChange={setRate} />
          <NumberField label="Períodos" value={periods} onChange={setPeriods} />
        </div>
        <div className="mt-4"><ChartBox height={260}><Line data={data} options={options} /></ChartBox></div>
        <p className="muted mt-3 text-sm">Diferença no fim: <b className="good">{brl(compound[compound.length - 1] - simple[simple.length - 1])}</b> a favor dos compostos.</p>
      </Card>
    </div>
  )
}

export default function FinanceStudio() {
  const [tab, setTab] = useState<'inv' | 'loan' | 'rates'>('inv')
  return (
    <div className="flex flex-col gap-5">
      <Segmented value={tab} onChange={setTab} options={[
        { value: 'inv', label: '📈 Investimentos' }, { value: 'loan', label: '🏠 Financiamento' }, { value: 'rates', label: '％ Taxas' },
      ]} />
      {tab === 'inv' ? <Investment /> : tab === 'loan' ? <Loan /> : <Rates />}
    </div>
  )
}

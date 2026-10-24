import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { PLANETS, dampedOscillator, projectile } from '../services/physics'
import { fmt } from '../lib/format'
import { alpha, baseOptions } from '../lib/chart'
import { useTheme } from '../theme/ThemeContext'
import { Card, ChartBox, NumberField, Segmented, Stat, Tex } from '../components/ui'
import Icon from '../components/Icon'

/** Drives a 0..duration clock with requestAnimationFrame while `playing`. */
function useClock(duration: number, playing: boolean, onEnd: () => void, speed = 1) {
  const [t, setT] = useState(duration)
  const tRef = useRef(t)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    if (tRef.current >= duration) tRef.current = 0
    const tick = (now: number) => {
      tRef.current = Math.min(duration, tRef.current + ((now - last) / 1000) * speed)
      last = now
      setT(tRef.current)
      if (tRef.current >= duration) { onEnd(); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, duration, speed]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { tRef.current = duration; setT(duration) }, [duration])
  return t
}

interface Pinned { label: string; points: { x: number; y: number }[] }

function ProjectileSim() {
  const { theme } = useTheme()
  const [v0, setV0] = useState(30)
  const [angle, setAngle] = useState(45)
  const [h0, setH0] = useState(0)
  const [planet, setPlanet] = useState('terra')
  const [playing, setPlaying] = useState(false)
  const [pinned, setPinned] = useState<Pinned[]>([])
  const g = PLANETS.find((p) => p.id === planet)!.g

  const r = useMemo(() => projectile(v0, angle, h0, g), [v0, angle, h0, g])
  // play in real time, but keep very long or very short flights watchable (1.5 s … 6 s)
  const speed = r.flightTime > 6 ? r.flightTime / 6 : r.flightTime < 1.5 ? r.flightTime / 1.5 : 1
  const t = useClock(r.flightTime, playing, () => setPlaying(false), speed)

  const th = (angle * Math.PI) / 180
  const ball = { x: v0 * Math.cos(th) * t, y: Math.max(0, h0 + v0 * Math.sin(th) * t - (g * t * t) / 2) }
  const trail = r.points.filter((p) => p.t <= t)

  const data = useMemo(() => ({
    datasets: [
      ...pinned.map((p, i) => ({
        label: p.label, data: p.points, borderColor: alpha(theme.series[(i + 1) % theme.series.length], 0.7),
        borderDash: [5, 5], borderWidth: 1.5, pointRadius: 0,
      })),
      { label: 'Trajetória', data: trail, borderColor: theme.vars.accent, backgroundColor: alpha(theme.vars.accent, 0.12), fill: 'origin', borderWidth: 3, pointRadius: 0 },
      { label: 'Projétil', data: [ball], borderColor: theme.vars.accent2, backgroundColor: theme.vars.accent2, pointRadius: 8, pointHoverRadius: 8, showLine: false },
      { label: 'Altura máx.', data: [{ x: (v0 * Math.cos(th) * Math.max(0, v0 * Math.sin(th))) / g, y: r.maxHeight }], pointStyle: 'triangle', pointRadius: 6, borderColor: theme.vars.accent3, backgroundColor: theme.vars.accent3, showLine: false },
    ],
  }), [pinned, trail, ball, theme, r, v0, th, g])

  const maxX = Math.max(r.range, ...pinned.map((p) => p.points[p.points.length - 1].x)) * 1.05 || 1
  const maxY = Math.max(r.maxHeight, ...pinned.map((p) => Math.max(...p.points.map((q) => q.y)))) * 1.2 || 1
  const options = useMemo(() => {
    const o = baseOptions(theme, { linearX: true, x: 'Distância (m)', y: 'Altura (m)' })
    o.animation = false
    o.scales.x.min = 0
    o.scales.x.max = maxX
    o.scales.y.min = 0
    o.scales.y.max = maxY
    o.plugins.tooltip.callbacks = { label: (c: any) => `(${fmt(c.parsed.x, 3)} m, ${fmt(c.parsed.y, 3)} m)` }
    return o
  }, [theme, maxX, maxY])

  const planetInfo = PLANETS.find((p) => p.id === planet)!
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card title="Lançamento oblíquo" subtitle="Sem resistência do ar.">
        <div className="flex flex-col gap-3">
          <NumberField label="Velocidade inicial" sym="v_0" unit="m/s" value={v0} onChange={setV0} />
          <div>
            <NumberField label="Ângulo de lançamento" sym={String.raw`\theta`} unit="°" value={angle} onChange={setAngle} />
            <input type="range" min={0} max={90} step={1} value={angle} onChange={(e) => setAngle(+e.target.value)} className="mt-2 w-full accent-[var(--accent)]" aria-label="Ângulo" />
          </div>
          <NumberField label="Altura inicial" sym="h_0" unit="m" value={h0} onChange={setH0} />
          <div>
            <span className="label">Onde você está?</span>
            <div className="grid grid-cols-4 gap-1.5">
              {PLANETS.map((p) => (
                <button key={p.id} className={`chip justify-center !px-1 ${p.id === planet ? 'chip-active' : ''}`} onClick={() => setPlanet(p.id)} title={`g = ${p.g} m/s²`}>
                  <span>{p.emoji}</span><span className="text-[0.7rem]">{p.name}</span>
                </button>
              ))}
            </div>
            <p className="muted mt-2 text-xs">g = {fmt(planetInfo.g, 3)} m/s²</p>
          </div>
          <div className="mt-1 flex gap-2">
            <button className="btn btn-primary flex-1" onClick={() => setPlaying((p) => !p)}>
              <Icon name={playing ? 'pause' : 'play'} size={16} /> {playing ? 'Pausar' : 'Lançar'}
            </button>
            <button className="btn" title="Fixar trajetória para comparar" onClick={() => setPinned((l) => [...l, { label: `${planetInfo.emoji} ${fmt(v0, 3)} m/s · ${fmt(angle, 3)}°`, points: r.points.map(({ x, y }) => ({ x, y })) }].slice(-4))}>
              Fixar
            </button>
            {pinned.length > 0 && <button className="btn btn-icon" title="Limpar fixadas" onClick={() => setPinned([])}><Icon name="trash" size={16} /></button>}
          </div>
        </div>
      </Card>

      <div className="flex min-w-0 flex-col gap-5">
        <Card>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Alcance" value={`${fmt(r.range, 4)} m`} accent />
            <Stat label="Altura máxima" value={`${fmt(r.maxHeight, 4)} m`} />
            <Stat label="Tempo de voo" value={`${fmt(r.flightTime, 4)} s`} />
            <Stat label="Velocidade no impacto" value={`${fmt(r.impactSpeed, 4)} m/s`} />
          </div>
          <ChartBox height={380}>
            <Line data={data} options={options} />
          </ChartBox>
          <div className="muted mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>t = {fmt(t, 3)} s · x = {fmt(ball.x, 4)} m · y = {fmt(ball.y, 4)} m</span>
            <span>Dica: no vácuo, 45° maximiza o alcance quando h₀ = 0.</span>
          </div>
        </Card>
        <Card title="Equações do movimento">
          <div className="tex-out grid gap-2 text-center sm:grid-cols-3">
            <Tex block>{String.raw`x(t) = v_0\cos\theta\; t`}</Tex>
            <Tex block>{String.raw`y(t) = h_0 + v_0\sin\theta\; t - \tfrac{g t^2}{2}`}</Tex>
            <Tex block>{String.raw`H = h_0 + \dfrac{(v_0 \sin\theta)^2}{2g}`}</Tex>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Spring({ x, amplitude }: { x: number; amplitude: number }) {
  // x in [-A, A] mapped to the mass position inside the SVG
  const center = 260
  const scale = 120 / Math.max(1e-9, amplitude)
  const massX = center + x * scale
  const coils = 14
  const start = 30
  const end = massX - 30
  const pts = Array.from({ length: coils * 2 + 1 }, (_, i) => {
    const px = start + 14 + ((end - start - 28) * i) / (coils * 2)
    const py = i === 0 || i === coils * 2 ? 70 : i % 2 ? 52 : 88
    return `${px},${py}`
  })
  return (
    <svg viewBox="0 0 440 120" className="w-full" role="img" aria-label="Sistema massa-mola">
      <rect x="10" y="20" width="20" height="100" rx="3" fill="var(--surface-2)" stroke="var(--border)" />
      <line x1="10" y1="110" x2="430" y2="110" stroke="var(--border)" strokeWidth="2" />
      <line x1={center} y1="18" x2={center} y2="110" stroke="var(--muted)" strokeDasharray="3 4" opacity="0.5" />
      <polyline points={`${start},70 ${pts.join(' ')} ${end},70`} fill="none" stroke="var(--accent-2)" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x={massX - 30} y="40" width="60" height="60" rx="10" fill="url(#massGrad)" />
      <text x={massX} y="76" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--accent-text)" fontFamily="var(--font-mono)">m</text>
      <defs>
        <linearGradient id="massGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-3)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function OscillatorSim() {
  const { theme } = useTheme()
  const [A, setA] = useState(1)
  const [k, setK] = useState(20)
  const [m, setM] = useState(1)
  const [b, setB] = useState(0.6)
  const [tMax, setTMax] = useState(15)
  const [playing, setPlaying] = useState(false)
  const r = useMemo(() => dampedOscillator(A, k, m, b, tMax), [A, k, m, b, tMax])
  const t = useClock(tMax, playing, () => setPlaying(false))
  const idx = Math.min(r.points.length - 1, Math.round((t / tMax) * (r.points.length - 1)))
  const x = r.points[idx].x
  const envelope = r.gamma > 0 && r.gamma < r.w0

  const data = useMemo(() => ({
    datasets: [
      { label: 'x(t)', data: r.points.map((p) => ({ x: p.t, y: p.x })), borderColor: theme.vars.accent, borderWidth: 2.5, pointRadius: 0 },
      ...(envelope ? [
        { label: 'Envoltória', data: r.points.map((p) => ({ x: p.t, y: A * Math.exp(-r.gamma * p.t) })), borderColor: alpha(theme.vars.accent3, 0.6), borderDash: [5, 5], borderWidth: 1.5, pointRadius: 0 },
        { label: '−Envoltória', data: r.points.map((p) => ({ x: p.t, y: -A * Math.exp(-r.gamma * p.t) })), borderColor: alpha(theme.vars.accent3, 0.6), borderDash: [5, 5], borderWidth: 1.5, pointRadius: 0 },
      ] : []),
      { label: 'Agora', data: [{ x: r.points[idx].t, y: x }], borderColor: theme.vars.accent2, backgroundColor: theme.vars.accent2, pointRadius: 6, showLine: false },
    ],
  }), [r, theme, envelope, A, idx, x])

  const options = useMemo(() => {
    const o = baseOptions(theme, { linearX: true, x: 'Tempo (s)', y: 'Posição (m)' })
    o.animation = false
    o.scales.x.min = 0
    o.scales.x.max = tMax
    o.scales.y.min = -Math.abs(A) * 1.15
    o.scales.y.max = Math.abs(A) * 1.15
    o.plugins.legend.labels.filter = (i: any) => !String(i.text).startsWith('−')
    return o
  }, [theme, tMax, A])

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card title="Oscilador amortecido" subtitle="Massa-mola com atrito viscoso.">
        <div className="flex flex-col gap-3">
          <NumberField label="Amplitude inicial" sym="A" unit="m" value={A} onChange={setA} />
          <NumberField label="Constante elástica" sym="k" unit="N/m" value={k} onChange={setK} />
          <NumberField label="Massa" sym="m" unit="kg" value={m} onChange={setM} />
          <div>
            <NumberField label="Amortecimento" sym="b" unit="kg/s" value={b} onChange={setB} />
            <input type="range" min={0} max={Math.ceil(4 * Math.sqrt(k * m))} step={0.05} value={b} onChange={(e) => setB(+e.target.value)} className="mt-2 w-full accent-[var(--accent)]" aria-label="Amortecimento" />
          </div>
          <NumberField label="Duração" sym="t" unit="s" value={tMax} onChange={setTMax} />
          <button className="btn btn-primary mt-1" onClick={() => setPlaying((p) => !p)}>
            <Icon name={playing ? 'pause' : 'play'} size={16} /> {playing ? 'Pausar' : 'Animar'}
          </button>
        </div>
      </Card>
      <div className="flex min-w-0 flex-col gap-5">
        <Card>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Regime" value={r.regime} accent />
            <Stat label={<>Frequência natural <Tex>{String.raw`\omega_0`}</Tex></>} value={`${fmt(r.w0, 4)} rad/s`} />
            <Stat label={<>Coef. de amortecimento <Tex>{String.raw`\gamma`}</Tex></>} value={`${fmt(r.gamma, 4)} 1/s`} />
            <Stat label="Período amortecido" value={Number.isFinite(r.period) ? `${fmt(r.period, 4)} s` : '—'} />
          </div>
          <div className="chart-box mb-4"><Spring x={x} amplitude={Math.abs(A)} /></div>
          <ChartBox height={280}><Line data={data} options={options} /></ChartBox>
        </Card>
        <Card title="Modelo">
          <div className="tex-out text-center">
            <Tex block>{String.raw`m\ddot{x} + b\dot{x} + kx = 0 \quad\Rightarrow\quad x(t) = A\,e^{-\gamma t}\cos(\omega_d t),\;\; \gamma = \tfrac{b}{2m},\;\; \omega_d = \sqrt{\omega_0^2 - \gamma^2}`}</Tex>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function Simulations() {
  const [tab, setTab] = useState<'projetil' | 'oscilador'>('projetil')
  return (
    <div className="flex flex-col gap-5">
      <Segmented value={tab} onChange={setTab} options={[{ value: 'projetil', label: '🎯 Lançamento de projéteis' }, { value: 'oscilador', label: '〰️ Oscilador amortecido' }]} />
      {tab === 'projetil' ? <ProjectileSim /> : <OscillatorSim />}
    </div>
  )
}

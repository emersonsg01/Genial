import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import katex from 'katex'
import { evaluate } from '../lib/expression'

export function Tex({ children, block = false, className = '' }: { children: string; block?: boolean; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(children, { displayMode: block, throwOnError: false, strict: 'ignore' }),
    [children, block],
  )
  return <span className={`tex ${block ? 'tex-block' : ''} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}

export function Card({ title, subtitle, actions, children, className = '' }: {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

/** Parses "1,5" as a decimal comma, otherwise evaluates the text as an expression ("2pi", "3e8", "1/3"). */
export function parseInput(text: string): number | null {
  const t = text.trim()
  if (!t) return null
  if (/^-?\d+,\d+$/.test(t)) return parseFloat(t.replace(',', '.'))
  try {
    const n = evaluate(t)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

/** Numeric field that accepts math expressions; only reports valid numbers upward. */
export function NumberField({ label, value, onChange, unit, hint, sym, id }: {
  label: React.ReactNode
  value: number
  onChange: (n: number) => void
  unit?: string
  hint?: string
  sym?: string
  id?: string
}) {
  const [text, setText] = useState(() => String(value))
  const last = useRef(value)
  const [bad, setBad] = useState(false)

  useEffect(() => {
    if (value !== last.current) {
      last.current = value
      setText(String(+value.toPrecision(10)))
      setBad(false)
    }
  }, [value])

  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <label className="block" htmlFor={inputId}>
      <span className="label">
        {sym && <Tex>{sym}</Tex>}
        <span>{label}</span>
      </span>
      <span className={`field-wrap ${bad ? 'field-bad' : ''}`}>
        <input
          id={inputId}
          className="field"
          inputMode="decimal"
          value={text}
          title={hint ?? 'Aceita expressões: 2pi, 3e8, sqrt(2)…'}
          onChange={(e) => {
            setText(e.target.value)
            const n = parseInput(e.target.value)
            setBad(n === null)
            if (n !== null) { last.current = n; onChange(n) }
          }}
        />
        {unit && <span className="field-unit">{unit}</span>}
      </span>
    </label>
  )
}

export function Segmented<T extends string>({ options, value, onChange, size = 'md' }: {
  options: { value: T; label: React.ReactNode }[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
}) {
  return (
    <div className={`seg ${size === 'sm' ? 'seg-sm' : ''}`} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          className={`seg-item ${o.value === value ? 'seg-active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Stat({ label, value, accent = false, sub }: { label: React.ReactNode; value: React.ReactNode; accent?: boolean; sub?: React.ReactNode }) {
  return (
    <div className={`stat ${accent ? 'stat-accent' : ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export function Select({ value, onChange, children, label }: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  label?: React.ReactNode
}) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <select className="field select" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </label>
  )
}

export function ChartBox({ children, height = 320 }: { children: React.ReactNode; height?: number }) {
  return <div className="chart-box" style={{ height }}>{children}</div>
}

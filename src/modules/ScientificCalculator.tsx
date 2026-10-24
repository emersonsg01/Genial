import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AngleMode, evaluate } from '../lib/expression'
import { fmt } from '../lib/format'
import { load, save } from '../lib/storage'
import { Card, Segmented, Stat, Tex } from '../components/ui'
import Icon from '../components/Icon'

interface HistoryEntry { expr: string; result: number }

/** Best rational approximation via continued fractions (denominator ≤ maxDen). */
export function toFraction(x: number, maxDen = 10000): [number, number] | null {
  if (!Number.isFinite(x) || Number.isInteger(x)) return null
  let [h0, h1, k0, k1] = [0, 1, 1, 0]
  let b = x
  for (let i = 0; i < 40; i++) {
    const a = Math.floor(b)
    ;[h0, h1] = [h1, a * h1 + h0]
    ;[k0, k1] = [k1, a * k1 + k0]
    if (k1 > maxDen) { [h1, k1] = [h0, k0]; break }
    if (Math.abs(x - h1 / k1) < 1e-12) break
    b = 1 / (b - a)
  }
  return Math.abs(x - h1 / k1) < 1e-9 && k1 !== 1 ? [h1, k1] : null
}

type Key = { label: string; insert?: string; action?: 'clear' | 'back' | 'eval' | 'ans'; kind?: 'fn' | 'op' | 'eq' | 'danger' }

const KEYS: Key[] = [
  { label: 'sin', insert: 'sin(', kind: 'fn' }, { label: 'cos', insert: 'cos(', kind: 'fn' }, { label: 'tan', insert: 'tan(', kind: 'fn' },
  { label: 'ln', insert: 'ln(', kind: 'fn' }, { label: 'log', insert: 'log(', kind: 'fn' }, { label: 'AC', action: 'clear', kind: 'danger' },
  { label: 'asin', insert: 'asin(', kind: 'fn' }, { label: 'acos', insert: 'acos(', kind: 'fn' }, { label: 'atan', insert: 'atan(', kind: 'fn' },
  { label: 'eˣ', insert: 'exp(', kind: 'fn' }, { label: '10ˣ', insert: '10^', kind: 'fn' }, { label: '⌫', action: 'back', kind: 'danger' },
  { label: 'x²', insert: '^2', kind: 'fn' }, { label: 'xʸ', insert: '^', kind: 'fn' }, { label: '√', insert: 'sqrt(', kind: 'fn' },
  { label: '∛', insert: 'cbrt(', kind: 'fn' }, { label: 'n!', insert: '!', kind: 'fn' }, { label: '%', insert: '%', kind: 'fn' },
  { label: '(', insert: '(' }, { label: ')', insert: ')' }, { label: '7', insert: '7' }, { label: '8', insert: '8' }, { label: '9', insert: '9' }, { label: '÷', insert: '/', kind: 'op' },
  { label: 'π', insert: 'π' }, { label: 'e', insert: 'e' }, { label: '4', insert: '4' }, { label: '5', insert: '5' }, { label: '6', insert: '6' }, { label: '×', insert: '*', kind: 'op' },
  { label: 'nCr', insert: 'nCr(', kind: 'fn' }, { label: ',', insert: ',' }, { label: '1', insert: '1' }, { label: '2', insert: '2' }, { label: '3', insert: '3' }, { label: '−', insert: '-', kind: 'op' },
  { label: 'Ans', action: 'ans', kind: 'fn' }, { label: 'φ', insert: 'φ' }, { label: '0', insert: '0' }, { label: '.', insert: '.' }, { label: '=', action: 'eval', kind: 'eq' }, { label: '+', insert: '+', kind: 'op' },
]

const EXAMPLES = ['2^10 - 24', 'sqrt(2) * sin(45)', '5! / (2! * 3!)', 'log(1000) + ln(e^3)', 'nCr(49, 6)', '(1 + 1/1000)^1000', 'gcd(84, 36)', '15% * 380']

export default function ScientificCalculator() {
  const [expr, setExpr] = useState('')
  const [angle, setAngle] = useState<AngleMode>(() => load('calc-angle', 'deg'))
  const [history, setHistory] = useState<HistoryEntry[]>(() => load('calc-history', []))
  const [flash, setFlash] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const ans = history[0]?.result ?? 0

  useEffect(() => save('calc-angle', angle), [angle])
  useEffect(() => save('calc-history', history.slice(0, 50)), [history])

  const preview = useMemo(() => {
    if (!expr.trim()) return { value: null as number | null, error: null as string | null }
    try {
      return { value: evaluate(expr, { angle, vars: { ans, Ans: ans } }), error: null }
    } catch (e) {
      return { value: null, error: (e as Error).message }
    }
  }, [expr, angle, ans])

  const insert = (text: string) => {
    const el = inputRef.current
    const start = el?.selectionStart ?? expr.length
    const end = el?.selectionEnd ?? expr.length
    const next = expr.slice(0, start) + text + expr.slice(end)
    setExpr(next)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + text.length, start + text.length)
    })
  }

  const commit = () => {
    if (preview.value === null || Number.isNaN(preview.value)) return
    setHistory((h) => [{ expr, result: preview.value as number }, ...h].slice(0, 50))
    setExpr(fmtPlain(preview.value as number))
    setFlash(true)
    setTimeout(() => setFlash(false), 350)
  }

  const press = (k: Key) => {
    if (k.action === 'clear') { setExpr(''); inputRef.current?.focus(); return }
    if (k.action === 'back') { setExpr((s) => s.slice(0, -1)); inputRef.current?.focus(); return }
    if (k.action === 'eval') { commit(); return }
    if (k.action === 'ans') { insert('ans'); return }
    insert(k.insert ?? k.label)
  }

  const v = preview.value
  const frac = v !== null ? toFraction(v) : null

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Segmented size="sm" value={angle} onChange={setAngle} options={[{ value: 'deg', label: 'Graus' }, { value: 'rad', label: 'Radianos' }]} />
          <span className="muted text-xs">Digite livremente · <span className="kbd">Enter</span> calcula · <span className="kbd">Esc</span> limpa</span>
        </div>

        <div className="calc-screen" style={flash ? { boxShadow: '0 0 0 2px var(--accent), inset 0 2px 20px rgba(0,0,0,.25)' } : undefined}>
          <input
            ref={inputRef}
            aria-label="Expressão"
            placeholder="Ex.: 2sin(30) + sqrt(16)"
            className="calc-input"
            value={expr}
            autoFocus
            spellCheck={false}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commit() }
              if (e.key === 'Escape') setExpr('')
            }}
          />
          <div className="calc-result mt-2" aria-live="polite" data-testid="calc-result">
            {v !== null ? <span className="gradient-text">= {fmt(v, 10)}</span> : <span className="muted text-base">{preview.error ?? '0'}</span>}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-6 gap-2">
          {KEYS.map((k) => (
            <button key={k.label} type="button" className={`key ${k.kind ? `key-${k.kind}` : ''}`} onClick={() => press(k)}>
              {k.label}
            </button>
          ))}
        </div>

        {v !== null && Number.isFinite(v) && (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Notação científica" value={<Tex>{sciTex(v)}</Tex>} />
            <Stat label="Fração" value={frac ? <Tex>{String.raw`\dfrac{${frac[0]}}{${frac[1]}}`}</Tex> : '—'} />
            <Stat label="Binário" value={Number.isInteger(v) && Math.abs(v) < 2 ** 53 ? v.toString(2) : '—'} />
            <Stat label="Hexadecimal" value={Number.isInteger(v) && Math.abs(v) < 2 ** 53 ? v.toString(16).toUpperCase() : '—'} />
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-5">
        <Card title="Histórico" actions={history.length > 0 && (
          <button className="btn btn-ghost btn-icon" title="Limpar histórico" onClick={() => setHistory([])}><Icon name="trash" size={16} /></button>
        )}>
          {history.length === 0 ? (
            <p className="muted text-sm">Os cálculos confirmados com <span className="kbd">=</span> aparecem aqui.</p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {history.map((h, i) => (
                <li key={i}>
                  <button className="w-full rounded-xl px-3 py-2 text-right hover:bg-[var(--surface-2)]" onClick={() => setExpr(h.expr)} title="Reusar expressão">
                    <div className="muted mono truncate text-xs">{h.expr}</div>
                    <div className="mono font-semibold">= {fmt(h.result, 10)}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Experimente">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((x) => <button key={x} className="chip mono" onClick={() => setExpr(x)}>{x}</button>)}
          </div>
          <p className="muted mt-4 text-xs leading-relaxed">
            Funções: sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, sqrt, cbrt, root(x,n), ln, log, log(x,b), log2, exp, abs,
            floor, ceil, round, min, max, mod, gcd, lcm, nCr, nPr, gamma. Constantes: π, e, φ, τ. Multiplicação implícita: <span className="mono">2πr</span>.
          </p>
        </Card>
      </div>
    </div>
  )
}

function fmtPlain(x: number) {
  if (!Number.isFinite(x)) return ''
  return String(+x.toPrecision(12))
}

function sciTex(x: number) {
  const [m, e] = x.toExponential(6).split('e')
  return String.raw`${+m} \times 10^{${Number(e)}}`.replace('.', '{,}')
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon'
import { MODULES } from '../modules/registry'
import { FORMULAS } from '../data/formulas'
import { UNIT_CATEGORIES } from '../services/units'
import { navigate } from '../lib/route'

interface Item {
  key: string
  keywords?: string
  label: string
  hint: string
  icon: string
  go: () => void
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo<Item[]>(() => [
    ...MODULES.map((m) => ({ key: `m-${m.id}`, label: m.name, hint: 'Módulo', icon: m.icon, go: () => navigate(m.id) })),
    ...FORMULAS.map((f) => ({
      key: `f-${f.id}`, label: f.title, keywords: f.id, hint: `${f.area === 'math' ? 'Matemática' : 'Física'} · ${f.topic}`,
      icon: f.area === 'math' ? 'sigma' : 'atom', go: () => navigate(f.area === 'math' ? 'matematica' : 'fisica', f.id),
    })),
    ...UNIT_CATEGORIES.map((c) => ({ key: `u-${c.id}`, label: `Converter ${c.name.toLowerCase()}`, hint: 'Conversor', icon: 'convert', go: () => navigate('conversor', c.id) })),
  ], [])

  const results = useMemo(() => {
    const n = normalize(q.trim())
    if (!n) return items.slice(0, 12)
    return items.filter((i) => normalize(`${i.label} ${i.hint} ${i.keywords ?? ''}`).includes(n)).slice(0, 30)
  }, [q, items])

  useEffect(() => {
    if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 0) }
  }, [open])
  useEffect(() => setSel(0), [q])

  if (!open) return null

  const choose = (i: Item | undefined) => { if (i) { i.go(); onClose() } }

  return (
    <div className="palette-overlay" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-label="Busca rápida" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
          <Icon name="search" className="muted" />
          <input
            ref={inputRef}
            className="w-full bg-transparent text-base outline-none"
            placeholder="Buscar módulos, fórmulas, unidades…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)) }
              if (e.key === 'Enter') choose(results[sel])
              if (e.key === 'Escape') onClose()
            }}
          />
          <span className="kbd">Esc</span>
        </div>
        <div className="max-h-[55vh] overflow-y-auto py-2" role="listbox">
          {results.length === 0 && <p className="muted px-4 py-6 text-center text-sm">Nada encontrado para “{q}”.</p>}
          {results.map((r, i) => (
            <button
              key={r.key}
              role="option"
              aria-selected={i === sel}
              className="palette-item"
              onMouseEnter={() => setSel(i)}
              onClick={() => choose(r)}
            >
              <span className="nav-icon grid h-8 w-8 place-items-center rounded-lg" style={{ background: 'var(--surface-2)' }}>
                <Icon name={r.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{r.label}</span>
                <span className="muted block truncate text-xs">{r.hint}</span>
              </span>
              {i === sel && <Icon name="arrow" size={16} className="muted" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

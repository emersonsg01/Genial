import React, { useMemo, useState } from 'react'
import { UNIT_CATEGORIES, convertBase, fromBase, toBase } from '../services/units'
import { fmt } from '../lib/format'
import { navigate } from '../lib/route'
import { Card, NumberField, Select, Stat } from '../components/ui'
import Icon from '../components/Icon'

const DEFAULT_PAIR: Record<string, [string, string]> = {
  length: ['km', 'mi'], mass: ['kg', 'lb'], temperature: ['c', 'f'], area: ['ha', 'alq'], volume: ['l', 'gal'],
  speed: ['kmh', 'ms'], time: ['h', 's'], data: ['GB', 'MiB'], pressure: ['atm', 'psi'], energy: ['kcal', 'kj'],
  power: ['cv', 'kw'], force: ['kgf', 'n'], angle: ['deg', 'rad'], frequency: ['rpm', 'hz'], consumption: ['kml', 'l100'],
}

function Converter({ categoryId }: { categoryId: string }) {
  const cat = UNIT_CATEGORIES.find((c) => c.id === categoryId) ?? UNIT_CATEGORIES[0]
  const pair = DEFAULT_PAIR[cat.id] ?? [cat.units[0].id, cat.units[1].id]
  const [value, setValue] = useState(1)
  const [from, setFrom] = useState(pair[0])
  const [to, setTo] = useState(pair[1])
  const fromU = cat.units.find((u) => u.id === from) ?? cat.units[0]
  const toU = cat.units.find((u) => u.id === to) ?? cat.units[1]
  const base = toBase(fromU, value)
  const result = fromBase(toU, base)
  const all = useMemo(() => cat.units.map((u) => ({ u, v: fromBase(u, base) })), [cat, base])

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card title={`${cat.icon} ${cat.name}`}>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-3">
            <NumberField label="Valor" value={value} onChange={setValue} unit={fromU.symbol} />
            <Select label="De" value={from} onChange={setFrom}>
              {cat.units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </Select>
          </div>
          <button className="btn btn-icon mx-auto mb-1 rotate-90 sm:rotate-0" aria-label="Inverter unidades" title="Inverter" onClick={() => { setFrom(to); setTo(from); setValue(result) }}>
            <Icon name="swap" className="rotate-90" />
          </button>
          <div className="flex flex-col gap-3">
            <Stat label="Resultado" value={<span data-testid="unit-result">{fmt(result, 8)} {toU.symbol}</span>} accent />
            <Select label="Para" value={to} onChange={setTo}>
              {cat.units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </Select>
          </div>
        </div>
        <p className="muted mt-4 text-sm">
          <span className="mono">{fmt(value, 8)} {fromU.symbol}</span> = <span className="mono">{fmt(result, 8)} {toU.symbol}</span>
          {fromU.factor && toU.factor && (
            <> · fator <span className="mono">1 {fromU.symbol} = {fmt(fromU.factor / toU.factor, 10)} {toU.symbol}</span></>
          )}
        </p>
      </Card>
      <Card title="Em todas as unidades" subtitle="Clique numa linha para usá-la como destino.">
        <div className="table-wrap max-h-[420px]">
          <table className="table">
            <tbody>
              {all.map(({ u, v }) => (
                <tr key={u.id} className={`cursor-pointer ${u.id === to ? 'font-bold' : ''}`} onClick={() => setTo(u.id)}>
                  <td className="!font-sans">{u.name}</td>
                  <td>{fmt(v, 8)}</td>
                  <td className="muted">{u.symbol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

const BASES = [
  { key: 'bin', name: 'Binário', radix: 2 },
  { key: 'oct', name: 'Octal', radix: 8 },
  { key: 'dec', name: 'Decimal', radix: 10 },
  { key: 'hex', name: 'Hexadecimal', radix: 16 },
] as const

function BaseConverter() {
  const [text, setText] = useState('2025')
  const [radix, setRadix] = useState(10)
  const r = convertBase(text, radix)
  return (
    <Card title="🔢 Bases numéricas" subtitle="Inteiros de qualquer tamanho (BigInt).">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
        <label className="block">
          <span className="label">Número</span>
          <span className={`field-wrap ${r ? '' : 'field-bad'}`}>
            <input className="field" value={text} onChange={(e) => setText(e.target.value)} aria-label="Número" />
          </span>
        </label>
        <Select label="Base de entrada" value={String(radix)} onChange={(v) => setRadix(+v)}>
          {BASES.map((b) => <option key={b.key} value={b.radix}>{b.name} ({b.radix})</option>)}
        </Select>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BASES.map((b) => (
          <Stat key={b.key} label={`${b.name} · base ${b.radix}`} value={r ? r[b.key] : '—'} accent={b.radix === radix} />
        ))}
      </div>
    </Card>
  )
}

export default function UnitConverter({ category }: { category?: string }) {
  const active = category === 'bases' ? 'bases' : UNIT_CATEGORIES.find((c) => c.id === category)?.id ?? 'length'
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {[...UNIT_CATEGORIES.map((c) => ({ id: c.id, icon: c.icon, name: c.name })), { id: 'bases', icon: '🔢', name: 'Bases' }].map((c) => (
          <button key={c.id} className={`chip justify-start !rounded-xl !py-2 ${c.id === active ? 'chip-active' : ''}`} onClick={() => navigate('conversor', c.id)}>
            <span>{c.icon}</span><span className="truncate">{c.name}</span>
          </button>
        ))}
      </div>
      {active === 'bases' ? <BaseConverter /> : <Converter key={active} categoryId={active} />}
    </div>
  )
}

import React, { useState } from 'react'
import { cToF, fToC, kmToM, mToKm, kgToG, gToKg } from '../services/units'
import { renderToString } from 'katex'

export default function ConversionPanel() {
  const [value, setValue] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const convertTemp = () => {
    // validate numeric input
    if (!/^[+-]?\d*(\.\d+)?$/.test(value.trim())) {
      setResult('Entrada inválida')
      return
    }
    const v = parseFloat(value)
    if (Number.isNaN(v)) return
    const { result: r, formula, tex } = cToF(v) as any
    const rendered = tex ? renderToString(tex) : undefined
    setResult(tex ? `<span>${formula} → ${r}</span><div class=\"katex-html\">${rendered}</div>` : `${formula} → ${r}`)
  }

  return (
    <section className="panel">
      <h2 className="text-lg font-semibold mb-2">Conversões</h2>
      <input className="w-full border p-2 rounded mb-2" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Valor" />
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-indigo-500 text-white rounded" onClick={convertTemp}>°C → °F</button>
        <button className="px-3 py-1 bg-indigo-500 text-white rounded" onClick={() => { const v = parseFloat(value); if(!Number.isNaN(v)) setResult(String(kmToM(v).result)); }}>km → m</button>
        <button className="px-3 py-1 bg-indigo-500 text-white rounded" onClick={() => { const v = parseFloat(value); if(!Number.isNaN(v)) setResult(String(kgToG(v).result)); }}>kg → g</button>
      </div>
      {result && <div className="result mt-2" dangerouslySetInnerHTML={{ __html: result }} />}
    </section>
  )
}

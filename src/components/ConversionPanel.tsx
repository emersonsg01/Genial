import React, { useState } from 'react'
import { cToF, kmToM, kgToG } from '../services/units'
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
      <h2 className="panel-title">Conversões</h2>
      <p className="panel-subtitle">Converta unidades rapidamente com um clique.</p>
      <input className="field mb-3" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Valor" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button className="btn btn-soft" onClick={convertTemp}>°C → °F</button>
        <button className="btn btn-soft" onClick={() => { const v = parseFloat(value); if(!Number.isNaN(v)) setResult(String(kmToM(v).result)); }}>km → m</button>
        <button className="btn btn-soft" onClick={() => { const v = parseFloat(value); if(!Number.isNaN(v)) setResult(String(kgToG(v).result)); }}>kg → g</button>
      </div>
      {result && <div className="result output-box mt-3" dangerouslySetInnerHTML={{ __html: result }} />}
    </section>
  )
}

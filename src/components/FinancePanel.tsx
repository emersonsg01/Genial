import React, { useState } from 'react'
import { simpleInterest, compoundInterest, compoundSeries } from '../services/finance'
import { renderToString } from 'katex'

export default function FinancePanel() {
  const [mode, setMode] = useState<'simple'|'compound'>('simple')
  const [C, setC] = useState('1000')
  const [i, setI] = useState('0.05')
  const [t, setT] = useState('1')
  const [out, setOut] = useState<{ formulaHtml?: string; result?: string; series?: number[] } | null>(null)

  const compute = () => {
    const c = parseFloat(C)
    const ii = parseFloat(i)
    const tt = parseFloat(t)
    if (Number.isNaN(c) || Number.isNaN(ii) || Number.isNaN(tt)) {
      setOut({ result: 'Entrada inválida' })
      return
    }
    if (mode === 'simple') {
      const r = simpleInterest(c, ii, tt) as any
      const html = r.tex ? renderToString(r.tex) : undefined
      setOut({ formulaHtml: html, result: String(r.result) })
    } else {
      const r = compoundInterest(c, ii, tt) as any
      const series = compoundSeries(c, ii, Math.floor(tt))
      const html = r.tex ? renderToString(r.tex) : undefined
      setOut({ formulaHtml: html, result: String(r.result), series })
    }
  }

  return (
    <section className="panel">
      <h2 className="text-lg font-semibold mb-2">Finanças</h2>
      <div className="space-y-2 mb-2">
        <label className="flex items-center gap-2">
          <input 
            type="radio" 
            checked={mode==='simple'} 
            onChange={() => setMode('simple')}
            className="w-4 h-4"
          /> 
          Juros Simples
        </label>
        <label className="flex items-center gap-2">
          <input 
            type="radio" 
            checked={mode==='compound'} 
            onChange={() => setMode('compound')}
            className="w-4 h-4"
          /> 
          Juros Compostos
        </label>
      </div>
      <div className="space-y-2 mb-2">
        <input 
          className="w-full border p-2 rounded"
          value={C} 
          onChange={(e) => setC(e.target.value)} 
          placeholder="Capital C" 
          type="number"
        />
        <input 
          className="w-full border p-2 rounded"
          value={i} 
          onChange={(e) => setI(e.target.value)} 
          placeholder="Taxa i (ex: 0.05)" 
          type="number"
          step="0.01"
        />
        <input 
          className="w-full border p-2 rounded"
          value={t} 
          onChange={(e) => setT(e.target.value)} 
          placeholder="Tempo t" 
          type="number"
        />
      </div>
      <button 
        className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 font-semibold"
        onClick={compute}
      >
        Calcular
      </button>
      <div className="output space-y-1 mt-2">
        {out && (
          <>
            {out.formulaHtml && <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: out.formulaHtml }} />}
            <div className="result text-lg font-bold text-green-700">Resultado: {out.result}</div>
            {out.series && (
              <div className="text-sm text-gray-600 mt-2">Série: [{out.series.map(v => v.toFixed(2)).join(', ')}]</div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

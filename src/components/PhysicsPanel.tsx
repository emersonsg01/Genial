import React, { useState } from 'react'
import { massFromForce, velocity, displacement, pressure, gravityForce } from '../services/physics'
import { renderToString } from 'katex'

export default function PhysicsPanel() {
  const [mode, setMode] = useState<'mass'|'velocity'|'displacement'|'pressure'|'gravity'>('mass')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [out, setOut] = useState<{ formulaHtml?: string; result?: string } | null>(null)

  const compute = () => {
    const v1 = parseFloat(a)
    const v2 = parseFloat(b)
    if (Number.isNaN(v1) || (mode !== 'gravity' && Number.isNaN(v2))) {
      setOut({ result: 'Entrada inválida' })
      return
    }
    let r: any
    switch (mode) {
      case 'mass': r = massFromForce(v1, v2); break
      case 'velocity': r = velocity(v1, v2); break
      case 'displacement': r = displacement(v1, v2); break
      case 'pressure': r = pressure(v1, v2); break
      case 'gravity': r = gravityForce(v1); break
    }
    const html = r && r.tex ? renderToString(r.tex) : undefined
    setOut({ formulaHtml: html, result: String(r.result) })
  }

  return (
    <section className="panel">
      <h2 className="text-lg font-semibold mb-2">Física</h2>
      <div className="mb-2">
        <select 
          className="w-full border p-2 rounded bg-white"
          value={mode} 
          onChange={(e) => setMode(e.target.value as any)}
        >
          <option value="mass">m = F / a</option>
          <option value="velocity">v = Δs / Δt</option>
          <option value="displacement">Δs = v · t</option>
          <option value="pressure">P = F / A</option>
          <option value="gravity">F = m · g</option>
        </select>
      </div>
      <div className="space-y-2 mb-2">
        <input 
          className="w-full border p-2 rounded"
          placeholder={mode === 'gravity' ? 'm (kg)' : 'Valor 1'} 
          value={a} 
          onChange={(e) => setA(e.target.value)}
          type="number"
        />
        {mode !== 'gravity' && (
          <input 
            className="w-full border p-2 rounded"
            placeholder="Valor 2" 
            value={b} 
            onChange={(e) => setB(e.target.value)}
            type="number"
          />
        )}
      </div>
      <button 
        className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
        onClick={compute}
      >
        Calcular
      </button>
      <div className="output space-y-1 mt-2">
        {out && (
          <>
            {out.formulaHtml && <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: out.formulaHtml }} />}
            <div className="result text-lg font-bold text-green-700">Resultado: {out.result}</div>
          </>
        )}
      </div>
    </section>
  )
}

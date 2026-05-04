import React, { useState } from 'react'
import * as math from '../services/math'
import { renderToString } from 'katex'


export default function CalculatorPanel() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [output, setOutput] = useState<{ result: number | string; formula?: string; tex?: string } | null>(null)

  const handleBasic = (op: string) => {
    // validate inputs
    const valA = parseFloat(a)
    const valB = parseFloat(b)
    
    if (Number.isNaN(valA) || (op !== 'sqrt' && Number.isNaN(valB))) {
      setOutput({ result: 'Entrada inválida', formula: '' })
      return
    }
    
    try {
      let res: number | string = 0
      let formula: string | undefined
      let tex: string | undefined
      
      switch (op) {
        case '+':
          res = math.add(valA, valB)
          formula = `${valA} + ${valB} = ${res}`
          tex = `${valA} + ${valB} = ${res}`
          break
        case '-':
          res = math.sub(valA, valB)
          formula = `${valA} - ${valB} = ${res}`
          tex = `${valA} - ${valB} = ${res}`
          break
        case '×':
          res = math.mul(valA, valB)
          formula = `${valA} × ${valB} = ${res}`
          tex = `${valA} \\times ${valB} = ${res}`
          break
        case '÷':
          if (valB === 0) {
            setOutput({ result: 'Divisão por zero', formula: '' })
            return
          }
          res = math.div(valA, valB)
          formula = `${valA} ÷ ${valB} = ${res}`
          tex = `\\frac{${valA}}{${valB}} = ${res}`
          break
        case 'sqrt':
          ({ result: res, formula, tex } = math.sqrt(valA) as any)
          break
        default:
          res = valA
      }
      setOutput({ result: res, formula, tex })
    } catch (e) {
      setOutput({ result: 'Erro', formula: String(e) })
    }
  }

  return (
    <section className="panel">
      <h2 className="text-lg font-semibold mb-2">Calculadora</h2>
      <div className="space-y-2 mb-2">
        <input 
          className="w-full border p-2 rounded" 
          value={a} 
          onChange={(e) => setA(e.target.value)} 
          placeholder="Primeiro número" 
          type="number"
        />
        <input 
          className="w-full border p-2 rounded" 
          value={b} 
          onChange={(e) => setB(e.target.value)} 
          placeholder="Segundo número" 
          type="number"
        />
      </div>
      <div className="flex gap-2 mb-2 flex-wrap">
        <button className="px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600" onClick={() => handleBasic('+')}>+</button>
        <button className="px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600" onClick={() => handleBasic('-')}>−</button>
        <button className="px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600" onClick={() => handleBasic('×')}>×</button>
        <button className="px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600" onClick={() => handleBasic('÷')}>÷</button>
        <button className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700" onClick={() => handleBasic('sqrt')}>√</button>
      </div>
      <div className="output space-y-1">
        {output && (
          <>
            <div className="formula text-sm text-gray-700">
              {output.tex ? (
                <span dangerouslySetInnerHTML={{ __html: renderToString(output.tex) }} />
              ) : (
                output.formula
              )}
            </div>
            <div className="result text-lg font-bold text-green-700">Resultado: {String(output.result)}</div>
          </>
        )}
      </div>
    </section>
  )
}

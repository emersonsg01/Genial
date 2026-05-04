import React, { useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { compoundSeries } from '../services/finance'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function GraphArea() {
  const [type, setType] = useState<'line'|'bar'>('line')
  const [dataset, setDataset] = useState<'compound'|'velocity'>('compound')
  const [params, setParams] = useState({ C: 100, i: 0.1, periods: 10 })

  const generate = () => {
    if (dataset === 'compound') {
      const values = compoundSeries(params.C, params.i, params.periods)
      return {
        labels: values.map((_, i) => String(i)),
        datasets: [
          { label: 'Juros compostos', data: values, borderColor: 'rgba(75,192,192,1)', backgroundColor: 'rgba(75,192,192,0.2)' }
        ]
      }
    }
    // velocity example: v = a * t for a=2
    if (dataset === 'velocity') {
      const a = 2
      const values = Array.from({ length: 11 }, (_, i) => a * i)
      return { labels: values.map((_, i) => String(i)), datasets: [{ label: 'Velocidade vs Tempo', data: values, borderColor: 'rgba(255,99,132,1)', backgroundColor: 'rgba(255,99,132,0.2)' }] }
    }
    return { labels: [], datasets: [] }
  }

  const data = generate()

  return (
    <section className="panel graph">
      <h2>Gráficos</h2>
      <div style={{ marginBottom: 8 }}>
        <label>Tipo: <select value={type} onChange={(e) => setType(e.target.value as any)}><option value="line">Linha</option><option value="bar">Bar</option></select></label>
        <label style={{ marginLeft: 8 }}>Dataset: <select value={dataset} onChange={(e) => setDataset(e.target.value as any)}><option value="compound">Juros Compostos</option><option value="velocity">Velocidade vs Tempo</option></select></label>
      </div>
      <div style={{ width: '100%', height: 320 }}>
        {type === 'line' ? <Line data={data as any} /> : <Bar data={data as any} />}
      </div>
    </section>
  )
}

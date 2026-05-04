import React from 'react'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 px-4 py-8 md:px-6">
      <header className="max-w-7xl mx-auto mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur-sm px-5 py-4 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Genial — Calculadora e Ferramentas</h1>
          <p className="text-sm text-slate-600 mt-1">Design moderno, responsivo e intuitivo para cálculos e gráficos.</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto">
        <Home />
      </main>
    </div>
  )
}

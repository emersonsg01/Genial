import React from 'react'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-6xl mx-auto text-2xl font-bold mb-4">Genial — Calculadora e Ferramentas</header>
      <main className="max-w-6xl mx-auto">
        <Home />
      </main>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { ThemeProvider, useTheme } from './theme/ThemeContext'
import { THEMES } from './theme/themes'
import { MODULES } from './modules/registry'
import { navigate, useRoute } from './lib/route'
import Icon from './components/Icon'
import CommandPalette from './components/CommandPalette'
import Home from './pages/Home'
import ScientificCalculator from './modules/ScientificCalculator'
import FunctionPlotter from './modules/FunctionPlotter'
import FormulaExplorer from './modules/FormulaExplorer'
import Simulations from './modules/Simulations'
import UnitConverter from './modules/UnitConverter'
import FinanceStudio from './modules/FinanceStudio'
import StatsLab from './modules/StatsLab'

function ThemePicker() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Tema">
      {THEMES.map((t) => (
        <button
          key={t.id}
          role="radio"
          aria-checked={t.id === theme.id}
          title={`Tema ${t.name}`}
          onClick={() => setTheme(t.id)}
          className="h-7 w-7 rounded-full transition-transform hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})`,
            boxShadow: t.id === theme.id ? `0 0 0 2px var(--bg), 0 0 0 4px ${t.swatch[0]}` : 'none',
          }}
        />
      ))}
    </div>
  )
}

function Brand() {
  return (
    <button className="flex items-center gap-3 text-left" onClick={() => navigate('inicio')}>
      <span className="brand-mark">∑</span>
      <span>
        <span className="block text-lg font-bold leading-tight tracking-tight">Genial</span>
        <span className="muted block text-xs">Laboratório de cálculo</span>
      </span>
    </button>
  )
}

function Screen({ module, param }: { module: string; param?: string }) {
  switch (module) {
    case 'calculadora': return <ScientificCalculator />
    case 'graficos': return <FunctionPlotter />
    case 'matematica': return <FormulaExplorer area="math" selected={param} />
    case 'fisica': return <FormulaExplorer area="physics" selected={param} />
    case 'simulacoes': return <Simulations />
    case 'conversor': return <UnitConverter category={param} />
    case 'financas': return <FinanceStudio />
    case 'estatistica': return <StatsLab />
    default: return <Home />
  }
}

function Shell() {
  const route = useRoute()
  const [palette, setPalette] = useState(false)
  const current = MODULES.find((m) => m.id === route.module) ?? MODULES[0]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.title = current.id === 'inicio' ? 'Genial — Laboratório de Cálculo' : `${current.name} · Genial`
    window.scrollTo({ top: 0 })
  }, [current])

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="mx-auto flex max-w-[1500px] gap-5 px-4 py-4 lg:px-6 lg:py-6">
        {/* Desktop sidebar */}
        <aside className="sidebar sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col p-4 lg:flex">
          <Brand />
          <button className="btn mt-5 w-full justify-between" onClick={() => setPalette(true)}>
            <span className="flex items-center gap-2"><Icon name="search" size={16} /> Buscar</span>
            <span className="kbd">Ctrl K</span>
          </button>
          <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Módulos">
            {MODULES.map((m) => (
              <button key={m.id} className={`nav-item ${m.id === current.id ? 'active' : ''}`} onClick={() => navigate(m.id)}>
                <span className="nav-icon"><Icon name={m.icon} size={16} /></span>
                {m.short}
              </button>
            ))}
          </nav>
          <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <div className="muted mb-2 flex items-center gap-2 text-xs"><Icon name="palette" size={14} /> Tema</div>
            <ThemePicker />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile header */}
          <header className="sidebar mb-4 p-3 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Brand />
              <div className="flex items-center gap-2">
                <button className="btn btn-icon" aria-label="Buscar" onClick={() => setPalette(true)}><Icon name="search" /></button>
              </div>
            </div>
            <nav className="scroll-x -mx-1 mt-3 flex gap-1" aria-label="Módulos">
              {MODULES.map((m) => (
                <button key={m.id} className={`nav-item !w-auto ${m.id === current.id ? 'active' : ''}`} onClick={() => navigate(m.id)}>
                  <Icon name={m.icon} size={16} /> {m.short}
                </button>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between">
              <span className="muted text-xs">Tema</span>
              <ThemePicker />
            </div>
          </header>

          {current.id !== 'inicio' && (
            <div className="mb-5">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{current.name}</h1>
              <p className="muted mt-1 text-sm">{current.description}</p>
            </div>
          )}

          <main key={route.module}>
            <Screen module={current.id} param={route.param} />
          </main>

          <footer className="muted mt-10 pb-4 text-center text-xs">
            Genial · feito com React, KaTeX e Chart.js · pressione <span className="kbd">Ctrl K</span> para buscar
          </footer>
        </div>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  )
}

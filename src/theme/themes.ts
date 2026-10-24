// Single source of truth for theme colors: applied as CSS custom properties on <html>
// and read by Chart.js through the ThemeContext.

export interface Theme {
  id: string
  name: string
  dark: boolean
  swatch: [string, string]
  vars: {
    bg: string
    bg2: string
    surface: string
    surface2: string
    border: string
    text: string
    muted: string
    accent: string
    accent2: string
    accent3: string
    accentText: string
    good: string
    bad: string
    grid: string
  }
  series: string[]
}

export const THEMES: Theme[] = [
  {
    id: 'cosmos', name: 'Cosmos', dark: true, swatch: ['#8b5cf6', '#22d3ee'],
    vars: {
      bg: '#070712', bg2: '#11112a', surface: 'rgba(23, 22, 52, 0.62)', surface2: 'rgba(44, 41, 92, 0.55)',
      border: 'rgba(148, 140, 255, 0.16)', text: '#ecebff', muted: '#9a98c7',
      accent: '#8b5cf6', accent2: '#22d3ee', accent3: '#f472b6', accentText: '#ffffff',
      good: '#34d399', bad: '#fb7185', grid: 'rgba(148, 140, 255, 0.10)',
    },
    series: ['#a78bfa', '#22d3ee', '#f472b6', '#fbbf24', '#34d399'],
  },
  {
    id: 'aurora', name: 'Aurora', dark: true, swatch: ['#10b981', '#38bdf8'],
    vars: {
      bg: '#03100f', bg2: '#062320', surface: 'rgba(8, 40, 38, 0.6)', surface2: 'rgba(14, 66, 60, 0.5)',
      border: 'rgba(94, 234, 212, 0.16)', text: '#e6fffb', muted: '#8cc9bf',
      accent: '#10b981', accent2: '#38bdf8', accent3: '#a3e635', accentText: '#022c22',
      good: '#4ade80', bad: '#f87171', grid: 'rgba(94, 234, 212, 0.10)',
    },
    series: ['#34d399', '#38bdf8', '#a3e635', '#c084fc', '#facc15'],
  },
  {
    id: 'solar', name: 'Solar', dark: true, swatch: ['#f97316', '#f43f5e'],
    vars: {
      bg: '#120806', bg2: '#2a0f0a', surface: 'rgba(48, 20, 14, 0.6)', surface2: 'rgba(82, 34, 22, 0.5)',
      border: 'rgba(253, 186, 116, 0.16)', text: '#fff4ec', muted: '#d3a48c',
      accent: '#f97316', accent2: '#f43f5e', accent3: '#facc15', accentText: '#1c0a02',
      good: '#a3e635', bad: '#fb7185', grid: 'rgba(253, 186, 116, 0.10)',
    },
    series: ['#fb923c', '#f43f5e', '#facc15', '#38bdf8', '#a3e635'],
  },
  {
    id: 'papel', name: 'Papel', dark: false, swatch: ['#2563eb', '#0f766e'],
    vars: {
      bg: '#f4f1ea', bg2: '#e9e4d8', surface: 'rgba(255, 255, 252, 0.78)', surface2: 'rgba(236, 232, 220, 0.8)',
      border: 'rgba(30, 41, 59, 0.13)', text: '#1b2233', muted: '#5f6677',
      accent: '#2563eb', accent2: '#0f766e', accent3: '#c2410c', accentText: '#ffffff',
      good: '#15803d', bad: '#b91c1c', grid: 'rgba(30, 41, 59, 0.09)',
    },
    series: ['#2563eb', '#0f766e', '#c2410c', '#7c3aed', '#be185d'],
  },
]

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([k, val]) => {
    root.style.setProperty(`--${k.replace(/[A-Z0-9]/g, (m) => `-${m.toLowerCase()}`)}`, val)
  })
  root.dataset.theme = theme.id
  root.style.colorScheme = theme.dark ? 'dark' : 'light'
}

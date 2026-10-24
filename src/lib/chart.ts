import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import type { Theme } from '../theme/themes'

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, BarElement, Filler, Title, Tooltip, Legend)

ChartJS.defaults.font.family = "'Space Grotesk', system-ui, sans-serif"

/** Hex color with alpha, e.g. alpha('#8b5cf6', 0.2). */
export function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export function axisOptions(theme: Theme, title?: string) {
  return {
    grid: { color: theme.vars.grid },
    border: { color: theme.vars.border },
    ticks: { color: theme.vars.muted, maxTicksLimit: 9 },
    title: title ? { display: true, text: title, color: theme.vars.muted } : undefined,
  }
}

export function baseOptions(theme: Theme, opts: { x?: string; y?: string; linearX?: boolean } = {}): ChartOptions<any> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 350 },
    interaction: { mode: 'nearest', intersect: false },
    plugins: {
      legend: { labels: { color: theme.vars.text, usePointStyle: true, boxWidth: 8 } },
      tooltip: {
        backgroundColor: theme.dark ? 'rgba(10,10,25,0.92)' : 'rgba(255,255,255,0.96)',
        titleColor: theme.vars.text,
        bodyColor: theme.vars.text,
        borderColor: theme.vars.border,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
      },
    },
    scales: {
      x: { ...(opts.linearX ? { type: 'linear' } : {}), ...axisOptions(theme, opts.x) },
      y: axisOptions(theme, opts.y),
    },
  }
}

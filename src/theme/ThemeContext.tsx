import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { THEMES, Theme, applyTheme } from './themes'
import { load, save } from '../lib/storage'

interface ThemeCtx {
  theme: Theme
  setTheme: (id: string) => void
}

const Ctx = createContext<ThemeCtx>({ theme: THEMES[0], setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = useState(() => load('theme', THEMES[0].id))
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0]

  useEffect(() => {
    applyTheme(theme)
    save('theme', theme.id)
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme: setId }), [theme])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)

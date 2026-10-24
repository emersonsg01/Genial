import { useEffect, useState } from 'react'

export interface Route {
  module: string
  param?: string
}

function parse(hash: string): Route {
  const [module, param] = hash.replace(/^#\/?/, '').split('/')
  return { module: module || 'inicio', param: param ? decodeURIComponent(param) : undefined }
}

export function navigate(module: string, param?: string) {
  window.location.hash = `/${module}${param ? `/${encodeURIComponent(param)}` : ''}`
}

/** Minimal hash router: #/module/param */
export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.hash))
  useEffect(() => {
    const on = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

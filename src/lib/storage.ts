// localStorage wrapper: storage can be unavailable (private mode, blocked site data),
// so every access is guarded and falls back to the default.
const PREFIX = 'genial:'

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

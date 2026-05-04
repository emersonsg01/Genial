export function add(a: number, b: number) {
  return a + b
}

export function sub(a: number, b: number) {
  return a - b
}

export function mul(a: number, b: number) {
  return a * b
}

export function div(a: number, b: number) {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}

export function pow(a: number, b: number) {
  return Math.pow(a, b)
}

export function sqrt(a: number) {
  const res = Math.sqrt(a)
  return { result: res, formula: `\sqrt{${a}} = ${res}` }
}

export function log(a: number, base = 10) {
  const res = Math.log(a) / Math.log(base)
  return { result: res, formula: `\log_{${base}}(${a}) = ${res}` }
}

export function sin(a: number) {
  return Math.sin(a)
}

export function cos(a: number) {
  return Math.cos(a)
}

export function tan(a: number) {
  return Math.tan(a)
}

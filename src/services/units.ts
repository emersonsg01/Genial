export function cToF(c: number) {
  const f = (c * 9) / 5 + 32
  return { result: f, formula: `${c}°C · 9/5 + 32 = ${f}°F`, tex: String.raw`${c}^{\circ}\mathrm{C} \cdot \dfrac{9}{5} + 32 = ${f}^{\circ}\mathrm{F}` }
}

export function fToC(f: number) {
  const c = ((f - 32) * 5) / 9
  return { result: c, formula: `${f}°F → (${f} - 32) · 5/9 = ${c}°C`, tex: String.raw`${f}^{\circ}\mathrm{F} \to ( ${f} - 32 ) \cdot \dfrac{5}{9} = ${c}^{\circ}\mathrm{C}` }
}

export function kmToM(km: number) {
  const m = km * 1000
  return { result: m, formula: `${km} km = ${m} m`, tex: String.raw`${km}\ \mathrm{km} = ${m}\ \mathrm{m}` }
}

export function mToKm(m: number) {
  const km = m / 1000
  return { result: km, formula: `${m} m = ${km} km`, tex: String.raw`${m}\ \mathrm{m} = ${km}\ \mathrm{km}` }
}

export function kgToG(kg: number) {
  const g = kg * 1000
  return { result: g, formula: `${kg} kg = ${g} g`, tex: String.raw`${kg}\ \mathrm{kg} = ${g}\ \mathrm{g}` }
}

export function gToKg(g: number) {
  const kg = g / 1000
  return { result: kg, formula: `${g} g = ${kg} kg`, tex: String.raw`${g}\ \mathrm{g} = ${kg}\ \mathrm{kg}` }
}

// ---------------------------------------------------------------------------
// Generic converter. Each unit is either a linear factor to the category's base
// unit, or a pair of functions (for affine scales such as temperature).

export interface Unit {
  id: string
  name: string
  symbol: string
  factor?: number
  toBase?: (x: number) => number
  fromBase?: (x: number) => number
}

export interface UnitCategory {
  id: string
  name: string
  icon: string
  units: Unit[]
}

const u = (id: string, name: string, symbol: string, factor: number): Unit => ({ id, name, symbol, factor })

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length', name: 'Comprimento', icon: '📏', units: [
      u('nm', 'Nanômetro', 'nm', 1e-9), u('um', 'Micrômetro', 'µm', 1e-6), u('mm', 'Milímetro', 'mm', 1e-3),
      u('cm', 'Centímetro', 'cm', 1e-2), u('m', 'Metro', 'm', 1), u('km', 'Quilômetro', 'km', 1e3),
      u('in', 'Polegada', 'in', 0.0254), u('ft', 'Pé', 'ft', 0.3048), u('yd', 'Jarda', 'yd', 0.9144),
      u('mi', 'Milha', 'mi', 1609.344), u('nmi', 'Milha náutica', 'nmi', 1852),
      u('au', 'Unidade astronômica', 'UA', 149597870700), u('ly', 'Ano-luz', 'ly', 9.4607304725808e15),
      u('pc', 'Parsec', 'pc', 3.0856775814913673e16),
    ],
  },
  {
    id: 'mass', name: 'Massa', icon: '⚖️', units: [
      u('mg', 'Miligrama', 'mg', 1e-6), u('ct', 'Quilate', 'ct', 2e-4), u('g', 'Grama', 'g', 1e-3),
      u('kg', 'Quilograma', 'kg', 1), u('arroba', 'Arroba', '@', 15), u('t', 'Tonelada', 't', 1e3),
      u('oz', 'Onça', 'oz', 0.028349523125), u('lb', 'Libra', 'lb', 0.45359237), u('st', 'Stone', 'st', 6.35029318),
      u('u', 'Unidade de massa atômica', 'u', 1.66053906660e-27),
    ],
  },
  {
    id: 'temperature', name: 'Temperatura', icon: '🌡️', units: [
      { id: 'c', name: 'Celsius', symbol: '°C', toBase: (x) => x + 273.15, fromBase: (x) => x - 273.15 },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (x) => ((x - 32) * 5) / 9 + 273.15, fromBase: (x) => ((x - 273.15) * 9) / 5 + 32 },
      { id: 'k', name: 'Kelvin', symbol: 'K', factor: 1 },
      { id: 'r', name: 'Rankine', symbol: '°R', factor: 5 / 9 },
    ],
  },
  {
    id: 'area', name: 'Área', icon: '🗺️', units: [
      u('mm2', 'Milímetro²', 'mm²', 1e-6), u('cm2', 'Centímetro²', 'cm²', 1e-4), u('m2', 'Metro²', 'm²', 1),
      u('ha', 'Hectare', 'ha', 1e4), u('km2', 'Quilômetro²', 'km²', 1e6), u('in2', 'Polegada²', 'in²', 6.4516e-4),
      u('ft2', 'Pé²', 'ft²', 0.09290304), u('ac', 'Acre', 'ac', 4046.8564224),
      u('alq', 'Alqueire paulista', 'alq', 24200), u('alqmg', 'Alqueire mineiro', 'alq MG', 48400),
    ],
  },
  {
    id: 'volume', name: 'Volume', icon: '🧪', units: [
      u('ml', 'Mililitro', 'mL', 1e-6), u('tsp', 'Colher de chá', 'c. chá', 5e-6), u('tbsp', 'Colher de sopa', 'c. sopa', 1.5e-5),
      u('floz', 'Onça fluida (US)', 'fl oz', 2.95735295625e-5), u('cup', 'Xícara', 'xíc.', 2.4e-4),
      u('l', 'Litro', 'L', 1e-3), u('gal', 'Galão (US)', 'gal', 3.785411784e-3), u('ft3', 'Pé³', 'ft³', 0.028316846592),
      u('bbl', 'Barril de petróleo', 'bbl', 0.158987294928), u('m3', 'Metro³', 'm³', 1),
    ],
  },
  {
    id: 'speed', name: 'Velocidade', icon: '🚀', units: [
      u('ms', 'Metro por segundo', 'm/s', 1), u('kmh', 'Quilômetro por hora', 'km/h', 1 / 3.6),
      u('mph', 'Milha por hora', 'mph', 0.44704), u('kn', 'Nó', 'kn', 1852 / 3600), u('fts', 'Pé por segundo', 'ft/s', 0.3048),
      u('mach', 'Mach (nível do mar)', 'Ma', 340.29), u('c', 'Velocidade da luz', 'c', 299792458),
    ],
  },
  {
    id: 'time', name: 'Tempo', icon: '⏱️', units: [
      u('ns', 'Nanossegundo', 'ns', 1e-9), u('us', 'Microssegundo', 'µs', 1e-6), u('ms', 'Milissegundo', 'ms', 1e-3),
      u('s', 'Segundo', 's', 1), u('min', 'Minuto', 'min', 60), u('h', 'Hora', 'h', 3600), u('d', 'Dia', 'd', 86400),
      u('wk', 'Semana', 'sem', 604800), u('mo', 'Mês (médio)', 'mês', 2629746), u('y', 'Ano', 'ano', 31556952),
      u('dec', 'Década', 'déc', 315569520), u('cent', 'Século', 'séc', 3155695200),
    ],
  },
  {
    id: 'data', name: 'Dados', icon: '💾', units: [
      u('bit', 'Bit', 'bit', 1 / 8), u('B', 'Byte', 'B', 1), u('KB', 'Kilobyte', 'KB', 1e3), u('MB', 'Megabyte', 'MB', 1e6),
      u('GB', 'Gigabyte', 'GB', 1e9), u('TB', 'Terabyte', 'TB', 1e12), u('PB', 'Petabyte', 'PB', 1e15),
      u('KiB', 'Kibibyte', 'KiB', 1024), u('MiB', 'Mebibyte', 'MiB', 1024 ** 2), u('GiB', 'Gibibyte', 'GiB', 1024 ** 3),
      u('TiB', 'Tebibyte', 'TiB', 1024 ** 4),
    ],
  },
  {
    id: 'pressure', name: 'Pressão', icon: '🎈', units: [
      u('pa', 'Pascal', 'Pa', 1), u('kpa', 'Quilopascal', 'kPa', 1e3), u('mpa', 'Megapascal', 'MPa', 1e6),
      u('bar', 'Bar', 'bar', 1e5), u('atm', 'Atmosfera', 'atm', 101325), u('mmhg', 'Milímetro de mercúrio', 'mmHg', 133.322387415),
      u('psi', 'Libra por pol²', 'psi', 6894.757293168), u('kgfcm2', 'kgf por cm²', 'kgf/cm²', 98066.5),
    ],
  },
  {
    id: 'energy', name: 'Energia', icon: '⚡', units: [
      u('ev', 'Elétron-volt', 'eV', 1.602176634e-19), u('j', 'Joule', 'J', 1), u('kj', 'Quilojoule', 'kJ', 1e3),
      u('cal', 'Caloria', 'cal', 4.184), u('kcal', 'Quilocaloria', 'kcal', 4184), u('wh', 'Watt-hora', 'Wh', 3600),
      u('kwh', 'Quilowatt-hora', 'kWh', 3.6e6), u('btu', 'BTU', 'BTU', 1055.05585262), u('tnt', 'Tonelada de TNT', 'tTNT', 4.184e9),
    ],
  },
  {
    id: 'power', name: 'Potência', icon: '🔋', units: [
      u('w', 'Watt', 'W', 1), u('kw', 'Quilowatt', 'kW', 1e3), u('mw', 'Megawatt', 'MW', 1e6),
      u('cv', 'Cavalo-vapor', 'cv', 735.49875), u('hp', 'Horsepower', 'hp', 745.69987158227),
      u('btuh', 'BTU por hora', 'BTU/h', 0.29307107017),
    ],
  },
  {
    id: 'force', name: 'Força', icon: '💪', units: [
      u('n', 'Newton', 'N', 1), u('kn', 'Quilonewton', 'kN', 1e3), u('kgf', 'Quilograma-força', 'kgf', 9.80665),
      u('lbf', 'Libra-força', 'lbf', 4.4482216152605), u('dyn', 'Dina', 'dyn', 1e-5),
    ],
  },
  {
    id: 'angle', name: 'Ângulo', icon: '📐', units: [
      u('deg', 'Grau', '°', Math.PI / 180), u('rad', 'Radiano', 'rad', 1), u('grad', 'Grado', 'gon', Math.PI / 200),
      u('turn', 'Volta', 'volta', 2 * Math.PI), u('arcmin', 'Minuto de arco', '′', Math.PI / 10800),
      u('arcsec', 'Segundo de arco', '″', Math.PI / 648000),
    ],
  },
  {
    id: 'frequency', name: 'Frequência', icon: '📡', units: [
      u('hz', 'Hertz', 'Hz', 1), u('khz', 'Quilohertz', 'kHz', 1e3), u('mhz', 'Megahertz', 'MHz', 1e6),
      u('ghz', 'Gigahertz', 'GHz', 1e9), u('rpm', 'Rotações por minuto', 'rpm', 1 / 60), u('bpm', 'Batidas por minuto', 'bpm', 1 / 60),
    ],
  },
  {
    id: 'consumption', name: 'Consumo', icon: '⛽', units: [
      // base: km/L. L/100km is reciprocal, hence the function pair.
      u('kml', 'Quilômetro por litro', 'km/L', 1),
      { id: 'l100', name: 'Litros por 100 km', symbol: 'L/100km', toBase: (x) => 100 / x, fromBase: (x) => 100 / x },
      u('mpg', 'Milhas por galão (US)', 'mpg', 1.609344 / 3.785411784),
    ],
  },
]

export function toBase(unit: Unit, x: number) {
  return unit.toBase ? unit.toBase(x) : x * (unit.factor ?? 1)
}

export function fromBase(unit: Unit, x: number) {
  return unit.fromBase ? unit.fromBase(x) : x / (unit.factor ?? 1)
}

export function convert(categoryId: string, fromId: string, toId: string, value: number) {
  const cat = UNIT_CATEGORIES.find((c) => c.id === categoryId)
  if (!cat) throw new Error(`Categoria desconhecida: ${categoryId}`)
  const from = cat.units.find((x) => x.id === fromId)
  const to = cat.units.find((x) => x.id === toId)
  if (!from || !to) throw new Error('Unidade desconhecida')
  return fromBase(to, toBase(from, value))
}

// ---------------------------------------------------------------------------
// Number bases

export function convertBase(value: string, radix: number): Record<'bin' | 'oct' | 'dec' | 'hex', string> | null {
  const clean = value.trim().toLowerCase().replace(/^(0x|0b|0o)/, '').replace(/[\s_]/g, '')
  if (!clean) return null
  const digits = '0123456789abcdef'.slice(0, radix)
  const neg = clean.startsWith('-')
  const body = neg ? clean.slice(1) : clean
  if (!body || [...body].some((ch) => !digits.includes(ch))) return null
  let n = 0n
  for (const ch of body) n = n * BigInt(radix) + BigInt(digits.indexOf(ch))
  if (neg) n = -n
  return { bin: n.toString(2), oct: n.toString(8), dec: n.toString(10), hex: n.toString(16).toUpperCase() }
}

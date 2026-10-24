export interface ModuleInfo {
  id: string
  name: string
  short: string
  icon: string
  description: string
}

export const MODULES: ModuleInfo[] = [
  { id: 'inicio', name: 'Início', short: 'Início', icon: 'home', description: 'Visão geral do laboratório' },
  { id: 'calculadora', name: 'Calculadora científica', short: 'Calculadora', icon: 'calc', description: 'Expressões, funções, graus/radianos e histórico' },
  { id: 'graficos', name: 'Gráficos de funções', short: 'Gráficos', icon: 'chart', description: 'Plote até 5 funções com derivada, raízes e integral' },
  { id: 'matematica', name: 'Fórmulas matemáticas', short: 'Matemática', icon: 'sigma', description: 'Álgebra, geometria, sequências e combinatória' },
  { id: 'fisica', name: 'Fórmulas de física', short: 'Física', icon: 'atom', description: 'Cinemática a física moderna, com constantes' },
  { id: 'simulacoes', name: 'Simulações', short: 'Simulações', icon: 'target', description: 'Lançamento de projéteis e oscilador amortecido' },
  { id: 'conversor', name: 'Conversor de unidades', short: 'Conversor', icon: 'convert', description: '15 grandezas e bases numéricas' },
  { id: 'financas', name: 'Finanças', short: 'Finanças', icon: 'money', description: 'Investimentos, Price × SAC e taxas' },
  { id: 'estatistica', name: 'Estatística', short: 'Estatística', icon: 'bars', description: 'Medidas, histograma e regressão linear' },
]

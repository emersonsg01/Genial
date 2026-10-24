# Genial — Laboratório de Cálculo

Aplicação web de matemática e física: calculadora científica, gráficos de funções, mais de 60 fórmulas que se resolvem para qualquer variável, simulações animadas, conversor de unidades, finanças e estatística. Tudo com fórmulas em KaTeX, gráficos em Chart.js e quatro temas visuais.

```bash
npm install
npm run dev            # http://localhost:5173
npm run test -- --run  # testes
npm run build          # build de produção em dist/
```

## Módulos

| Módulo | O que faz |
| --- | --- |
| **Calculadora científica** | Expressões livres com resultado ao vivo, graus/radianos, histórico salvo, multiplicação implícita (`2πr`), fração e notação científica do resultado |
| **Gráficos de funções** | Até 5 funções de `x`, derivada, reta tangente, raízes, mínimo/máximo e integral definida (Simpson) |
| **Fórmulas matemáticas** | Álgebra (Bhaskara, sistemas 2×2), geometria, trigonometria, sequências, combinatória, MDC/MMC |
| **Fórmulas de física** | Cinemática, dinâmica, gravitação, energia, fluidos, termologia, ondas, óptica, eletricidade e física moderna, mais uma tabela de constantes |
| **Simulações** | Lançamento de projéteis em 7 corpos celestes (com trajetórias fixáveis para comparar) e oscilador massa-mola amortecido com animação |
| **Conversor** | 15 grandezas (inclui alqueire, arroba, consumo em km/L ↔ L/100 km) e bases numéricas com BigInt |
| **Finanças** | Investimento com aportes e meta, financiamento Price × SAC com tabela, taxas equivalentes e taxa real |
| **Estatística** | Medidas descritivas, diagrama de caixa, histograma e regressão linear com previsão |

Em cada fórmula “eq” você escolhe qual variável é a incógnita; as demais viram entradas e o resultado é calculado numericamente. Um gráfico mostra como a incógnita varia com qualquer outra variável.

## Atalhos

- <kbd>Ctrl</kbd> + <kbd>K</kbd> abre a busca (módulos, fórmulas e unidades).
- Todo campo numérico aceita expressões: `2pi`, `3e8`, `sqrt(2)/2`, `1,5`.
- Na calculadora: <kbd>Enter</kbd> confirma e <kbd>Esc</kbd> limpa.

## Stack

React 18 + TypeScript · Vite · Tailwind CSS v4 · Chart.js · KaTeX · Vitest + Testing Library

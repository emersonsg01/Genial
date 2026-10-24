# Setup

Requer Node.js 18+.

```bash
npm install
npm run dev            # servidor de desenvolvimento em http://localhost:5173
npm run test -- --run  # roda todos os testes uma vez
npm run test           # testes em modo watch
npx tsc --noEmit       # checagem de tipos
npm run build          # build de produção em dist/
npm run preview        # serve o build localmente
```

## Estrutura

```
src/
├── App.tsx               # layout, navegação lateral, seletor de tema, Ctrl+K
├── pages/Home.tsx        # página inicial
├── modules/              # um componente por módulo (calculadora, gráficos, fórmulas…)
├── components/           # UI compartilhada (Card, NumberField, Tex, Icon, CommandPalette)
├── data/formulas.ts      # biblioteca de fórmulas orientada a dados
├── services/             # lógica pura: math, physics, finance, units, stats
├── lib/                  # motor de expressões, métodos numéricos, formatação, rotas, Chart.js
├── theme/                # temas (cores) e contexto
└── styles.css            # Tailwind v4 + classes de componentes
tests/                    # espelha src/ (lib, data, services, ui)
```

Detalhes de arquitetura para quem for alterar o código estão em [CLAUDE.md](CLAUDE.md).

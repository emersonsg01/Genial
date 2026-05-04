# Genial — Calculadora Interativa

Aplicação web completa com módulos de cálculos matemáticos, física, finanças e conversões de unidades.

## Setup Rápido

```bash
# Instalar dependências
npm install

# Executar testes
npm run test -- --run

# Iniciar servidor de desenvolvimento
npm run dev
```

O servidor iniciará em **http://localhost:5173/**

## Recursos Implementados

✅ **Calculadora**: Operações básicas (+, −, ×, ÷) e raiz quadrada
✅ **Conversões**: Temperatura, distância, massa com validação e fórmulas
✅ **Física**: Massa, velocidade, deslocamento, pressão, gravidade com renderização TeX
✅ **Finanças**: Juros simples e compostos com gráficos de série
✅ **Gráficos**: Chart.js com suporte a Line/Bar para múltiplos datasets
✅ **Fórmulas**: Todas exibem em KaTeX para visualização matemática clara
✅ **Validação**: Entradas numéricas com mensagens de erro
✅ **Testes**: 11+ testes unitários + UI integration tests com Vitest + Testing Library

## Estructura do Projeto

```
src/
├── components/      # Componentes React reutilizáveis
│   ├── CalculatorPanel.tsx
│   ├── ConversionPanel.tsx
│   ├── PhysicsPanel.tsx
│   ├── FinancePanel.tsx
│   └── GraphArea.tsx
├── pages/          # Páginas (Home)
├── services/       # Lógica de negócio (Math, Physics, Finance, Units)
├── App.tsx
├── main.tsx
└── styles.css      # Tailwind directives

tests/
├── services/       # Testes unitários de serviços
│   ├── math.test.ts
│   ├── physics.test.ts
│   ├── finance.test.ts
│   └── units.test.ts
└── ui/
    └── home.test.tsx    # Teste de UI/Integração
```

## Stack Tecnológico

- **React 18** + **TypeScript**
- **Vite** (build + dev server)
- **Tailwind CSS v4** (estilos)
- **Chart.js** (gráficos)
- **KaTeX** (renderização de fórmulas matemáticas)
- **Vitest** (testes unitários)
- **Testing Library** (testes de UI)

## Correções Realizadas

1. **CalculatorPanel**: Implementadas operações binárias reais (era só + com 0)
2. **Estilos**: Tailwind aplicado consistentemente em todos os painéis
3. **Vite Config**: Integração de React plugin + Vitest configuration
4. **Tailwind v4**: Atualizado PostCSS config para nova API
5. **Dependências**: Adicionadas @vitejs/plugin-react e @tailwindcss/postcss

## Executar Testes

```bash
# Testes unitários + UI
npm run test -- --run

# Testes em watch mode
npm run test

# Build para produção
npm run build
```

## Exemplos de Uso

### Calculadora
- Digite dois números e clique em +, −, ×, ÷ para operações
- √ calcula raiz quadrada do primeiro número

### Conversões
- Digite valor e clique em °C → °F para converter temperatura
- kg → g, km → m também suportados

### Física
- Selecione fórmula na dropdown
- Digite os valores necessários
- Clique "Calcular" para ver resultado com fórmula

### Finanças
- Escolha Juros Simples ou Compostos
- Configure Capital, Taxa e Tempo
- Veja resultado e série de evolução

## Browser Compatibility

Testado em Chrome/Edge recente com suporte a ES2020, CSS Grid e Fetch API.

---

Para dúvidas ou relatório de bugs, verifique os testes: `npm run test -- --run`

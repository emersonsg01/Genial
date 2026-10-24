# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Genial is a single-page React 18 + TypeScript math/physics app (Vite, Tailwind CSS v4, Chart.js, KaTeX). UI text and docs are in Portuguese (pt-BR); numbers are formatted pt-BR (`1.234,5`).

## Commands

```bash
npm install
npm run dev                                   # Vite dev server on http://localhost:5173
npm run build                                 # production build to dist/
npm run test -- --run                         # run all tests once (plain `npm run test` is watch mode)
npx vitest run tests/lib/expression.test.ts   # run a single test file
npx vitest run -t "solves equations"          # run tests matching a name
npx tsc --noEmit                              # type-check (no npm script; tsconfig only includes src/)
```

There is no linter configured.

## Architecture

- **Routing**: a tiny hash router in `src/lib/route.ts` (`#/<module>/<param>`). `App.tsx` maps module ids to components; the module list (sidebar, home cards, Ctrl+K palette) comes from `src/modules/registry.ts`. The param selects a formula (`#/fisica/ohm`) or a unit category (`#/conversor/temperature`).
- **Expression engine** (`src/lib/expression.ts`): a hand-written tokenizer and recursive-descent parser compiled to closures. There is no `eval`. It is used by the calculator, the function plotter (variable `x`), the home quick-calc, and every `NumberField`, so number inputs accept `2pi`, `3e8`, and `1,5`. Grammar quirks: implicit multiplication, right-associative `^`, `-2^2 = -4`, postfix `!` and `%` (percent, divides by 100). Trig functions honor `angle: 'deg' | 'rad'`.
- **Formula library** (`src/data/formulas.ts`) is data-driven:
  - `kind: 'eq'` formulas declare `vars`, an `out` key, and `fn(vals)` that computes `out`. `FormulaExplorer` solves for any other variable numerically with `solve()` from `src/lib/numeric.ts` (Newton from several seeds, then a sign-change scan), so adding a formula needs only `fn`.
  - Each var's `def` value must make the example consistent with `fn` (within 1%). `tests/data/formulas.test.ts` checks this and round-trips solving every formula for every variable.
  - `kind: 'custom'` formulas return a list of TeX outputs, for cases with multiple results such as quadratic roots.
  - Angles in formula inputs are in degrees.
- **Services** (`src/services/*.ts`) hold pure logic. The original exports (`add`, `sqrt`, `massFromForce`, `cToF`, `simpleInterest`, …) are kept for the legacy tests. `units.ts` defines `UNIT_CATEGORIES`: each unit has either a linear `factor` to the category's base unit or a `toBase`/`fromBase` pair (temperature, L/100 km).
- **Theming**: `src/theme/themes.ts` is the single source of colors. `applyTheme` writes them as CSS custom properties on `<html>`; camelCase keys become kebab-case, so `accent2` becomes `--accent-2`. Chart.js reads the same values through `useTheme()`. Chart colors must come from `theme.vars`/`theme.series` (via `baseOptions()`/`alpha()` in `src/lib/chart.ts`), never hard-coded hex values. Chart.js components are registered once in `lib/chart.ts`.
- **Styling**: Tailwind v4 via `@import 'tailwindcss'` in `src/styles.css` (there is no tailwind config file). Shared component classes (`.card`, `.field`, `.btn`, `.seg`, `.chip`, `.stat`, `.tex-out`, `.chart-box`, `.table`, `.key`) are defined there and use the theme variables. Reuse them rather than restyling each module.
- **Persistence**: use only `src/lib/storage.ts` (`load`/`save`, keys prefixed `genial:`, try/catch-guarded). It stores the theme, the calculator history, and the angle mode.

## Conventions and gotchas

- TeX strings must use `String.raw` (or `\\`). In a plain template literal, `\t`, `\f`, `\b` and similar become control characters, and `\cdot` silently loses its backslash.
- Use `texNum()` to put numbers in TeX: it produces `{,}` decimals, `\,` thousands separators, and `\times 10^{n}` for extreme magnitudes. Use `fmt()` for plain text and `brl()` for currency.
- KaTeX renders symbols as MathML plus HTML, so `textContent` is duplicated. In tests, target elements by `title`, `aria-label` or `data-testid` (`calc-result`, `formula-result`, `unit-result`) rather than by the rendered math text.
- Tests run in jsdom with `react-chartjs-2` mocked in `tests/ui/home.test.tsx` (there is no canvas). `vitest.config.ts` is the test config; `vite.config.ts` only holds build settings (vendor `manualChunks`).
- `install.ps1` is a leftover from the original project and hardcodes `g:\codigos\Genial`; `npm install` is all that is needed.

import React from 'react'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from '../../src/App'

// jsdom has no canvas; charts are covered by the data they receive, not their pixels.
vi.mock('react-chartjs-2', () => ({ Line: () => null, Bar: () => null }))

const go = async (hash: string) => {
  await act(async () => {
    window.location.hash = hash
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

describe('Genial app', () => {
  beforeEach(() => go('#/inicio'))

  it('renders the home page with module cards', () => {
    render(<App />)
    expect(screen.getByText(/genialmente simples/i)).toBeInTheDocument()
    expect(screen.getAllByText('Calculadora científica').length).toBeGreaterThan(0)
  })

  it('home quick calc evaluates expressions', async () => {
    render(<App />)
    await userEvent.type(screen.getByLabelText('Cálculo rápido'), '2^10')
    expect(screen.getByText('= 1.024')).toBeInTheDocument()
  })

  it('scientific calculator evaluates live and saves history', async () => {
    render(<App />)
    await go('#/calculadora')
    const input = screen.getByLabelText('Expressão')
    await userEvent.type(input, '2sin(30)+sqrt(16)')
    expect(screen.getByTestId('calc-result')).toHaveTextContent('= 5')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByTitle('Reusar expressão')).toHaveTextContent('2sin(30)+sqrt(16)')
  })

  it('formula explorer solves for another variable', async () => {
    render(<App />)
    await go('#/fisica/ohm')
    expect(screen.getByRole('heading', { name: 'Lei de Ohm' })).toBeInTheDocument()
    expect(screen.getByTestId('formula-result')).toHaveTextContent('12')
    // solve for the resistance instead of the voltage
    await userEvent.click(screen.getByTitle('Resolver para Resistência'))
    expect(screen.getByTestId('formula-result')).toHaveTextContent('100')
  })

  it('unit converter converts temperature', async () => {
    render(<App />)
    await go('#/conversor/temperature')
    const value = screen.getByLabelText(/^Valor/)
    await userEvent.clear(value)
    await userEvent.type(value, '100')
    expect(screen.getByTestId('unit-result')).toHaveTextContent('212 °F')
  })

  it('command palette finds formulas', async () => {
    render(<App />)
    await userEvent.keyboard('{Control>}k{/Control}')
    const dialog = screen.getByRole('dialog')
    await userEvent.type(within(dialog).getByPlaceholderText(/Buscar/), 'bhaskara')
    expect(within(dialog).getByText('Equação do 2º grau')).toBeInTheDocument()
  })

  it.each(['graficos', 'simulacoes', 'financas', 'estatistica', 'matematica'])('renders the %s module', async (m) => {
    render(<App />)
    await go(`#/${m}`)
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0)
  })
})

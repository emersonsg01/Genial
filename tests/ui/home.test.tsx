import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'

describe('Home UI', () => {
  it('renders header and basic panels', async () => {
    render(<App />)
    expect(await screen.findByText(/Genial — Calculadora e Ferramentas/i)).toBeInTheDocument()
    // check calculator input exists
    const input = screen.getByPlaceholderText(/Digite número ou expressão/i)
    expect(input).toBeInTheDocument()
    // check conversion button
    const convButton = screen.getByText(/°C → °F/)
    expect(convButton).toBeInTheDocument()
    // basic interaction: type and click sqrt
    await userEvent.type(input, '9')
    const sqrtBtn = screen.getByText('√')
    await userEvent.click(sqrtBtn)
    expect(await screen.findByText(/Resultado:/i)).toBeInTheDocument()
  })
})

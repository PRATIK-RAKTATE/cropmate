import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'

describe('App', () => {
  it('renders the landing language chooser', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText(/Choose language/i)).toBeTruthy()
  })
})

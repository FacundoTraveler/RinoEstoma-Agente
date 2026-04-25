import { render, screen } from '@testing-library/react'
import { Header } from '@/components/header'

describe('Header Component', () => {
  it('renders the RinoEstoma logo', () => {
    render(<Header />)
    const logo = screen.getByAltText('RinoEstoma')
    expect(logo).toBeInTheDocument()
  })

  it('displays the main title', () => {
    render(<Header />)
    const title = screen.getByText(/RinoEstoma/i)
    expect(title).toBeInTheDocument()
  })

  it('has the correct branding colors', () => {
    const { container } = render(<Header />)
    const headerElement = container.querySelector('header')
    expect(headerElement).toHaveClass('bg-primary')
  })

  it('renders navigation links', () => {
    render(<Header />)
    const homeLink = screen.getByRole('link', { name: /inicio/i })
    expect(homeLink).toBeInTheDocument()
  })
})

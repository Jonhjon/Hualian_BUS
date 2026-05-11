import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import { FeedbackForm } from './FeedbackForm'

expect.extend(toHaveNoViolations)

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('FeedbackForm', () => {
  it('renders rating options and comment field', () => {
    render(<FeedbackForm bookingId={1} />, { wrapper: Wrapper })
    expect(screen.getByText(/評分/)).toBeInTheDocument()
    expect(screen.getByLabelText(/意見/)).toBeInTheDocument()
  })

  it('shows character count as user types', async () => {
    render(<FeedbackForm bookingId={1} />, { wrapper: Wrapper })
    const textarea = screen.getByLabelText(/意見/)
    await userEvent.type(textarea, 'hello')
    expect(screen.getByText('5 / 500')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<FeedbackForm bookingId={1} />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /送出/ })).toBeInTheDocument()
  })
})

describe('FeedbackForm accessibility', () => {
  it('has no axe violations on initial render', async () => {
    const { container } = render(<FeedbackForm bookingId={1} />, { wrapper: Wrapper })
    expect(await axe(container)).toHaveNoViolations()
  })
})

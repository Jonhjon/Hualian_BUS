import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import { LoginForm } from './LoginForm'

expect.extend(toHaveNoViolations)

jest.mock('@/hooks/useAuth', () => ({
  useLogin: jest.fn(),
}))

import { useLogin } from '@/hooks/useAuth'

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

function renderForm() {
  return render(<LoginForm />, { wrapper: Wrapper })
}

describe('LoginForm', () => {
  const mockMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    })
  })

  it('renders username and password fields', () => {
    renderForm()
    expect(screen.getByLabelText('帳號')).toBeInTheDocument()
    expect(screen.getByLabelText('密碼')).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /登入/ })).toBeInTheDocument()
  })

  it('shows validation error when submitted empty', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /登入/ }))
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
  })

  it('calls login.mutate with form data on submit', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('帳號'), 'testuser')
    await userEvent.type(screen.getByLabelText('密碼'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /登入/ }))
    expect(mockMutate).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' })
  })

  it('shows 帳號或密碼錯誤 on 401 error', () => {
    const err = Object.assign(new Error('帳號或密碼錯誤'), { status: 401 })
    ;(useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: err,
    })
    renderForm()
    expect(screen.getByRole('alert')).toHaveTextContent('帳號或密碼錯誤')
  })

  it('shows 帳號已被鎖定 on 423 error', () => {
    const err = Object.assign(new Error('locked'), { status: 423 })
    ;(useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: err,
    })
    renderForm()
    expect(screen.getByRole('alert')).toHaveTextContent('帳號已被鎖定')
  })

  it('disables button while pending', () => {
    ;(useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    })
    renderForm()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

describe('LoginForm accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { useLogin } = require('@/hooks/useAuth')
    ;(useLogin as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: null,
    })
  })

  it('has no axe violations on initial render', async () => {
    const { container } = renderForm()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations when showing validation errors', async () => {
    const { container } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: /登入/ }))
    await screen.findAllByRole('alert')
    expect(await axe(container)).toHaveNoViolations()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import { RegisterForm } from './RegisterForm'

expect.extend(toHaveNoViolations)

jest.mock('@/hooks/useAuth', () => ({
  useRegister: jest.fn(),
}))

import { useRegister } from '@/hooks/useAuth'

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

function renderForm() {
  return render(<RegisterForm />, { wrapper: Wrapper })
}

describe('RegisterForm', () => {
  const mockMutate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRegister as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
      isSuccess: false,
    })
  })

  it('shows step 1 (帳號設定) on initial render', () => {
    renderForm()
    expect(screen.getByLabelText('帳號')).toBeInTheDocument()
    expect(screen.getByLabelText('密碼')).toBeInTheDocument()
  })

  it('advances to step 2 when step 1 is valid', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('帳號'), 'validuser')
    await userEvent.type(screen.getByLabelText('密碼'), 'password123')
    await userEvent.type(screen.getByLabelText('確認密碼'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /下一步/ }))
    expect(await screen.findByLabelText('真實姓名')).toBeInTheDocument()
  })

  it('shows error when step 1 passwords do not match', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('帳號'), 'validuser')
    await userEvent.type(screen.getByLabelText('密碼'), 'password123')
    await userEvent.type(screen.getByLabelText('確認密碼'), 'differentpass')
    await userEvent.click(screen.getByRole('button', { name: /下一步/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('兩次密碼不一致')
  })

  it('can go back from step 2 to step 1', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('帳號'), 'validuser')
    await userEvent.type(screen.getByLabelText('密碼'), 'password123')
    await userEvent.type(screen.getByLabelText('確認密碼'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /下一步/ }))
    await screen.findByLabelText('真實姓名')
    await userEvent.click(screen.getByRole('button', { name: /上一步/ }))
    expect(screen.getByLabelText('帳號')).toBeInTheDocument()
  })

  it('shows all required passenger and applicant fields', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('帳號'), 'validuser')
    await userEvent.type(screen.getByLabelText('密碼'), 'password123')
    await userEvent.type(screen.getByLabelText('確認密碼'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /下一步/ }))

    expect(await screen.findByLabelText('真實姓名')).toBeInTheDocument()
    expect(screen.getByLabelText('身分證字號')).toBeInTheDocument()
    expect(screen.getByLabelText('性別')).toBeInTheDocument()
    expect(screen.getByLabelText('服務類型')).toBeInTheDocument()
    expect(screen.getByLabelText('生日')).toBeInTheDocument()
    expect(screen.getByLabelText('證明到期日')).toBeInTheDocument()
    expect(screen.getByLabelText('障礙等級／失能等級')).toBeInTheDocument()
    expect(screen.getByLabelText('輔具')).toBeInTheDocument()
    expect(screen.getByLabelText('地址')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('真實姓名'), '王小明')
    await userEvent.type(screen.getByLabelText('身分證字號'), 'A123456789')
    await userEvent.selectOptions(screen.getByLabelText('性別'), '男')
    await userEvent.selectOptions(screen.getByLabelText('服務類型'), '1')
    await userEvent.type(screen.getByLabelText('生日'), '1990-01-01')
    await userEvent.type(screen.getByLabelText('證明到期日'), '2030-12-31')
    await userEvent.type(screen.getByLabelText('障礙等級／失能等級'), '中度')
    await userEvent.type(screen.getByLabelText('輔具'), '輪椅')
    await userEvent.type(screen.getByLabelText('地址'), '花蓮縣花蓮市中正路1號')
    await userEvent.click(screen.getByRole('button', { name: /下一步/ }))

    expect(await screen.findByLabelText('申請人姓名')).toBeInTheDocument()
    expect(screen.getByLabelText('與乘客關係')).toBeInTheDocument()
    expect(screen.getByLabelText('電子郵件')).toBeInTheDocument()
    expect(screen.getByLabelText('連絡電話')).toBeInTheDocument()
  })

  it('shows step indicator', () => {
    renderForm()
    expect(screen.getByText(/步驟 1/)).toBeInTheDocument()
  })
})

describe('RegisterForm accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { useRegister } = require('@/hooks/useAuth')
    ;(useRegister as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      error: null,
      isSuccess: false,
    })
  })

  it('step 1 has no axe violations', async () => {
    const { container } = renderForm()
    expect(await axe(container)).toHaveNoViolations()
  })
})

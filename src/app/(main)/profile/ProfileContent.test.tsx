import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileContent } from './ProfileContent'

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

function renderProfile() {
  return render(<ProfileContent />, { wrapper: Wrapper })
}

describe('ProfileContent', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders profile data', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          username: 'testuser',
          realName: '測試使用者',
          gender: '男',
          identityNo: 'A110000004',
          email: 'testuser@example.com',
          phone: '0912345678',
          identityType: 1,
          auditStatus: 1,
          birthDate: '1990-01-01T00:00:00.000Z',
          address: '花蓮縣花蓮市中正路1號',
        },
      }),
    } as Response)

    renderProfile()

    expect(await screen.findByText('帳號狀態：已通過')).toBeInTheDocument()
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('測試使用者')).toBeInTheDocument()
    expect(screen.getByText('男')).toBeInTheDocument()
    expect(screen.getByText('testuser@example.com')).toBeInTheDocument()
    expect(screen.getByText('0912345678')).toBeInTheDocument()
  })

  it('shows a re-login link when the session is expired', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ success: false, error: '請先登入' }),
    } as Response)

    renderProfile()

    expect(await screen.findByRole('alert')).toHaveTextContent('登入已過期，請重新登入')
    expect(screen.getByRole('link', { name: '前往登入' })).toHaveAttribute(
      'href',
      '/login?next=/profile',
    )
  })
})

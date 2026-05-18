import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BookingForm } from './BookingForm'

expect.extend(toHaveNoViolations)

jest.mock('@/hooks/useBookings', () => ({
  useCreateBatchBooking: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

import { useCreateBatchBooking } from '@/hooks/useBookings'

const MATH_CHALLENGE = { question: '3 + 5 = ?', challengeToken: 'test-challenge-token' }
const MATH_ANSWER = '8'

const PROFILE_RESPONSE = {
  data: {
    realName: '王小明',
    gender: '男',
    identityType: 2,
    auditStatus: 1,
    birthDate: '1990-01-01T00:00:00.000Z',
    expiryDate: '2030-12-31T00:00:00.000Z',
    disabilityLevel: '中度',
    assistiveDevice: '輪椅',
  },
}

function mockFetch(profileOverride?: object) {
  global.fetch = jest.fn().mockImplementation((url: string) => {
    if (url.includes('/api/captcha')) {
      return Promise.resolve({
        ok: true,
        json: async () => MATH_CHALLENGE,
      })
    }
    return Promise.resolve({
      ok: true,
      json: async () => profileOverride ?? PROFILE_RESPONSE,
    })
  })
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('BookingForm', () => {
  const mockMutateAsync = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch()
    ;(useCreateBatchBooking as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders required fields', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    expect(screen.getByLabelText('預約日期')).toBeInTheDocument()
    expect(screen.getByLabelText('上車時段')).toBeInTheDocument()
    expect(screen.getByLabelText('上車地址')).toBeInTheDocument()
    expect(screen.getByLabelText('下車地址')).toBeInTheDocument()
    expect(await screen.findByText('已依個人資料帶入：長照（失能）')).toBeInTheDocument()
  })

  it('renders math captcha challenge and answer input', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    expect(await screen.findByText(MATH_CHALLENGE.question)).toBeInTheDocument()
    expect(screen.getByLabelText('算數驗證碼答案')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /換一題/ })).toBeInTheDocument()
  })

  it('fetches a new challenge when 換一題 is clicked', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    await screen.findByText(MATH_CHALLENGE.question)

    await userEvent.click(screen.getByRole('button', { name: /換一題/ }))

    await waitFor(() => {
      const captchaCalls = (global.fetch as jest.Mock).mock.calls.filter(([url]: [string]) =>
        url.includes('/api/captcha'),
      )
      expect(captchaCalls).toHaveLength(2)
    })
  })

  it('auto-fills booking type from the user profile', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    const bookingType = await screen.findByLabelText('服務類型')
    await screen.findByText('已依個人資料帶入：長照（失能）')
    await waitFor(() => expect(bookingType).toHaveValue('2'))
    expect(bookingType).toBeDisabled()
  })

  it('shows disability level and assistive device as read-only profile fields only', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    await screen.findByText('已依個人資料帶入：長照（失能）')
    expect(screen.queryByLabelText('障礙等級／失能等級（選填）')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('輔具（選填）')).not.toBeInTheDocument()
  })

  it('shows approved passenger profile data on the booking form', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    expect(await screen.findByText('王小明')).toBeInTheDocument()
    expect(screen.getByText('男')).toBeInTheDocument()
    expect(screen.getByText('類別')).toBeInTheDocument()
    expect(screen.getByText('中度')).toBeInTheDocument()
    expect(screen.getByText('輪椅')).toBeInTheDocument()
  })

  it('shows return pickup hour when 去回程 is checked', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    await userEvent.click(screen.getByLabelText('去回程'))
    expect(screen.getByLabelText('回程時段')).toBeInTheDocument()
  })

  it('shows captcha error when submitting without answering', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    await screen.findByText('已依個人資料帶入：長照（失能）')
    fireEvent.change(screen.getByLabelText('預約日期'), { target: { value: getValidPickupDate() } })
    await userEvent.selectOptions(screen.getByLabelText('上車時段'), '9')
    await userEvent.type(screen.getByLabelText('上車地址'), '花蓮市中正路1號')
    await userEvent.type(screen.getByLabelText('下車地址'), '花蓮車站')

    await userEvent.click(screen.getByRole('button', { name: /送出/ }))

    expect(await screen.findByText('請先完成算數驗證')).toBeInTheDocument()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('creates return trip with reversed pickup and dropoff addresses', async () => {
    mockMutateAsync.mockResolvedValue({ success: true })
    render(<BookingForm />, { wrapper: Wrapper })

    await screen.findByText('已依個人資料帶入：長照（失能）')
    await screen.findByText(MATH_CHALLENGE.question)

    fireEvent.change(screen.getByLabelText('預約日期'), { target: { value: getValidPickupDate() } })
    await userEvent.selectOptions(screen.getByLabelText('上車時段'), '9')
    await userEvent.type(screen.getByLabelText('上車地址'), '花蓮市中正路1號')
    await userEvent.type(screen.getByLabelText('下車地址'), '花蓮車站')
    await userEvent.click(screen.getByLabelText('去回程'))
    await userEvent.selectOptions(screen.getByLabelText('回程時段'), '13')
    await userEvent.type(screen.getByLabelText('算數驗證碼答案'), MATH_ANSWER)
    await userEvent.click(screen.getByRole('button', { name: /送出/ }))

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1))
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        outbound: expect.objectContaining({
          pickupHour: 9,
          pickupAddr: '花蓮市中正路1號',
          dropoffAddr: '花蓮車站',
          isRoundTrip: true,
        }),
        returnTrip: expect.objectContaining({
          pickupHour: 13,
          pickupAddr: '花蓮車站',
          dropoffAddr: '花蓮市中正路1號',
          isRoundTrip: false,
        }),
        captchaToken: `${MATH_ANSWER}:${MATH_CHALLENGE.challengeToken}`,
      }),
    )
  })

  it('shows error when addresses are empty on submit', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    await userEvent.click(screen.getByRole('button', { name: /送出/ }))
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
  })

  it('disables submit button while pending', async () => {
    ;(useCreateBatchBooking as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      error: null,
    })
    render(<BookingForm />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /送出/ })).toBeDisabled()
    expect(await screen.findByText('已依個人資料帶入：長照（失能）')).toBeInTheDocument()
  })
})

function getValidPickupDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

describe('BookingForm accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch({
      data: {
        realName: '測試使用者',
        gender: '女',
        identityType: 1,
        auditStatus: 1,
        birthDate: '1990-01-01T00:00:00.000Z',
        expiryDate: null,
        disabilityLevel: null,
        assistiveDevice: null,
      },
    })
    ;(useCreateBatchBooking as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
      error: null,
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('has no axe violations on initial render', async () => {
    const { container } = render(<BookingForm />, { wrapper: Wrapper })
    await screen.findByText('已依個人資料帶入：復康（身障）')
    await screen.findByText(MATH_CHALLENGE.question)
    expect(await axe(container)).toHaveNoViolations()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BookingForm } from './BookingForm'

expect.extend(toHaveNoViolations)

jest.mock('@/hooks/useBookings', () => ({
  useCreateBooking: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@hcaptcha/react-hcaptcha', () => {
  const React = require('react')
  const MockHCaptcha = React.forwardRef(function MockHCaptcha(
    { onVerify }: { onVerify: (token: string) => void },
    ref: React.Ref<unknown>,
  ) {
    React.useImperativeHandle(ref, () => ({ resetCaptcha: jest.fn() }))
    React.useEffect(() => { onVerify('test-captcha-token') }, [])
    return null
  })
  return MockHCaptcha
})

import { useCreateBooking } from '@/hooks/useBookings'

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('BookingForm', () => {
  const mockMutateAsync = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
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
      }),
    })
    ;(useCreateBooking as jest.Mock).mockReturnValue({
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

  it('auto-fills booking type from the user profile', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    const bookingType = await screen.findByLabelText('服務類型')
    await screen.findByText('已依個人資料帶入：長照（失能）')
    await waitFor(() => expect(bookingType).toHaveValue('2'))
    expect(bookingType).toBeDisabled()
  })

  it('prefills disability level and assistive device from the profile', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    const disability = await screen.findByLabelText('障礙等級／失能等級（選填）')
    const device = await screen.findByLabelText('輔具（選填）')
    await waitFor(() => expect(disability).toHaveValue('中度'))
    await waitFor(() => expect(device).toHaveValue('輪椅'))
  })

  it('shows approved passenger profile data on the booking form', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    expect(await screen.findByText('王小明')).toBeInTheDocument()
    expect(screen.getByText('男')).toBeInTheDocument()
    expect(screen.getByText('類別')).toBeInTheDocument()
    expect(screen.getAllByText('中度').length).toBeGreaterThan(0)
    expect(screen.getAllByText('輪椅').length).toBeGreaterThan(0)
  })

  it('shows return pickup hour when 去回程 is checked', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    await userEvent.click(screen.getByLabelText('去回程'))
    expect(screen.getByLabelText('回程時段')).toBeInTheDocument()
  })

  it('creates return trip with reversed pickup and dropoff addresses', async () => {
    mockMutateAsync.mockResolvedValue({ success: true })
    render(<BookingForm />, { wrapper: Wrapper })

    await screen.findByText('已依個人資料帶入：長照（失能）')
    await userEvent.type(screen.getByLabelText('預約日期'), getValidPickupDate())
    await userEvent.selectOptions(screen.getByLabelText('上車時段'), '9')
    await userEvent.type(screen.getByLabelText('上車地址'), '花蓮市中正路1號')
    await userEvent.type(screen.getByLabelText('下車地址'), '花蓮車站')
    await userEvent.click(screen.getByLabelText('去回程'))
    await userEvent.selectOptions(screen.getByLabelText('回程時段'), '13')
    await userEvent.click(screen.getByRole('button', { name: /送出/ }))

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(2))
    expect(mockMutateAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        pickupHour: 9,
        pickupAddr: '花蓮市中正路1號',
        dropoffAddr: '花蓮車站',
      }),
    )
    expect(mockMutateAsync).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        pickupHour: 13,
        pickupAddr: '花蓮車站',
        dropoffAddr: '花蓮市中正路1號',
      }),
    )
  })

  it('shows error when addresses are empty on submit', async () => {
    render(<BookingForm />, { wrapper: Wrapper })
    await userEvent.click(screen.getByRole('button', { name: /送出/ }))
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
  })

  it('disables submit button while pending', async () => {
    ;(useCreateBooking as jest.Mock).mockReturnValue({
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
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
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
      }),
    })
    ;(useCreateBooking as jest.Mock).mockReturnValue({
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
    expect(await axe(container)).toHaveNoViolations()
  })
})

import { render, screen } from '@testing-library/react'
import { BookingCard } from './BookingCard'
import { type Booking, useCancelBooking } from '@/hooks/useBookings'

jest.mock('@/hooks/useBookings', () => ({
  useCancelBooking: jest.fn(),
}))

const baseBooking: Booking = {
  BookingID: '123',
  BookingType: 1,
  PickupTime: '2026-05-10T09:00:00.000Z',
  PickupAddr: '花蓮市中正路1號',
  DropoffAddr: '花蓮車站',
  CompanionCount: 0,
  BookingStatus: 0,
  IsRoundTrip: false,
}

describe('BookingCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCancelBooking as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    })
  })

  it('shows feedback link for completed bookings', () => {
    render(<BookingCard booking={{ ...baseBooking, BookingStatus: 4 }} />)

    const link = screen.getByRole('link', { name: '填寫回饋' })
    expect(link).toHaveAttribute('href', '/feedback?bookingId=123')
    expect(screen.queryByRole('button', { name: '取消預約' })).not.toBeInTheDocument()
  })

  it('does not show feedback link for upcoming bookings', () => {
    render(<BookingCard booking={{ ...baseBooking, BookingStatus: 0 }} />)

    expect(screen.queryByRole('link', { name: '填寫回饋' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取消預約' })).toBeInTheDocument()
  })
})

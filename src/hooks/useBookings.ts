'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'

export interface DispatchTaskSummary {
  TaskID: string
  EstimatedArrival: string | null
  ActualArrival: string | null
  vehicle: { PlateNo: string; VehicleType: string | null } | null
  driver: { DriverName: string | null; DriverNo: string } | null
}

export interface PassengerSummary {
  RealName: string | null
  Gender: number | null
  DisabilityLevel: string | null
  AssistiveDevice: string | null
  ExpiryDate: string | null
  Phone: string | null
  account: { Username: string } | null
}

export interface MonthStats {
  monthlyTotal: number
  monthlyCompleted: number
  monthlyCancelled: number
}

export interface Booking {
  BookingID: string
  BookingType: number
  PickupTime: string
  CreatedAt?: string | null
  PickupAddr: string
  DropoffAddr: string
  CompanionCount: number
  BookingStatus: number
  IsRoundTrip: boolean
  dispatchTasks?: DispatchTaskSummary[]
  passenger?: PassengerSummary | null
  monthStats?: MonthStats
}

export interface MonthlyBookingSummary {
  totalCount: number
  completedCount: number
  year: number
  month: number
}

export interface MonthlyBookingResponse {
  success: boolean
  data: {
    bookings: Booking[]
    summary: MonthlyBookingSummary
  }
}

export interface BookingListResponse {
  success: boolean
  data: Booking[]
  meta: { total: number; page: number; limit: number }
}

export interface VehicleTrackingResponse {
  success: boolean
  data: {
    position: {
      lat: number
      lng: number
      speed?: number
      timestamp?: string
    } | null
    message?: string
  }
}

export interface CancelBookingResponse {
  success: boolean
  data: {
    isLateCancel?: boolean
  }
}

export function useBookings(status?: 'upcoming' | 'history', page = 1) {
  const params = new URLSearchParams({ page: String(page) })
  if (status) params.set('status', status)

  return useQuery<BookingListResponse>({
    queryKey: ['bookings', status, page],
    queryFn: () => apiFetch<BookingListResponse>(`/api/bookings?${params}`),
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch<CancelBookingResponse>(`/api/bookings/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

export function useMonthlyBookings(year: number, month: number) {
  const params = new URLSearchParams({ year: String(year), month: String(month) })
  return useQuery<MonthlyBookingResponse>({
    queryKey: ['bookings', 'monthly', year, month],
    queryFn: () => apiFetch<MonthlyBookingResponse>(`/api/bookings/monthly?${params}`),
  })
}

export function useVehicleTracking(bookingId: string | null) {
  return useQuery<VehicleTrackingResponse>({
    queryKey: ['tracking', bookingId],
    queryFn: () => apiFetch<VehicleTrackingResponse>(`/api/bookings/${bookingId}/track`),
    enabled: !!bookingId,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
}

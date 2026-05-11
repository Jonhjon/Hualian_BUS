'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface DispatchTaskSummary {
  TaskID: string
  EstimatedArrival: string | null
  ActualArrival: string | null
  vehicle: { PlateNo: string; VehicleType: string | null } | null
  driver: { DriverName: string | null; DriverNo: string } | null
}

export interface Booking {
  BookingID: string
  BookingType: number
  PickupTime: string
  PickupAddr: string
  DropoffAddr: string
  CompanionCount: number
  BookingStatus: number
  IsRoundTrip: boolean
  dispatchTasks?: DispatchTaskSummary[]
}

export interface BookingListResponse {
  success: boolean
  data: Booking[]
  meta: { total: number; page: number; limit: number }
}

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options)
  const json = await res.json()
  if (!res.ok) throw Object.assign(new Error(json.error ?? '操作失敗'), { status: res.status })
  return json
}

export function useBookings(status?: 'upcoming' | 'history', page = 1) {
  const params = new URLSearchParams({ page: String(page) })
  if (status) params.set('status', status)

  return useQuery<BookingListResponse>({
    queryKey: ['bookings', status, page],
    queryFn: () => apiFetch(`/api/bookings?${params}`),
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
    mutationFn: (id: string) => apiFetch(`/api/bookings/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  })
}

export function useVehicleTracking(bookingId: string | null) {
  return useQuery({
    queryKey: ['tracking', bookingId],
    queryFn: () => apiFetch(`/api/bookings/${bookingId}/track`),
    enabled: !!bookingId,
    refetchInterval: 30_000, // 30 秒輪詢
    refetchIntervalInBackground: false,
  })
}

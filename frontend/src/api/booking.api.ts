import apiClient from './client'

export interface CreateBookingPayload {
  trainId: number
  coachType: string
  journeyDate: string
  passengersCount: number
}

export interface BookingRecord {
  id: number
  pnr_number: string
  journey_date: string
  coach_type: string
  passengers_count: number
  total_fare: number
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITING'
  created_at: string
  train_id?: number
  train_number?: string
  train_name?: string
  train_type?: string
  source_station_name?: string
  source_station_code?: string
  destination_station_name?: string
  destination_station_code?: string
}

export interface CreateBookingResponse {
  success: boolean
  message: string
  data: BookingRecord
}

export interface UserBookingsResponse {
  success: boolean
  message: string
  data: BookingRecord[]
}

export const bookingApi = {
  async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
    const response = await apiClient.post<CreateBookingResponse>('/bookings/book', payload)
    return response.data
  },

  async getMyBookings(): Promise<UserBookingsResponse> {
    const response = await apiClient.get<UserBookingsResponse>('/bookings/my-bookings')
    return response.data
  },
}

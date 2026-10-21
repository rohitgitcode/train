import apiClient from './client'

export interface AvailableCoach {
  id: number
  coachType: '1A' | '2A' | '3A' | 'SL' | 'CC' | '2S'
  quota: string
  totalSeats: number
  availableSeats: number
  fare: number
}

export interface TrainSearchResult {
  trainId: number
  trainNumber: string
  name: string
  type: string
  departureTime: string
  arrivalTime: string
  distanceKm: number
  availableCoaches: AvailableCoach[]
}

export interface SearchTrainsResponse {
  success: boolean
  message: string
  data: {
    fromStation: { id: number; code: string; name: string }
    toStation: { id: number; code: string; name: string }
    journeyDate: string
    totalTrains: number
    trains: TrainSearchResult[]
  }
}

export interface ScheduleStop {
  stopSequence: number
  stationId: number
  stationCode: string
  stationName: string
  arrivalTime: string | null
  departureTime: string | null
  dayCount: number
  distanceFromSourceKm: number
}

export interface TrainScheduleResponse {
  success: boolean
  message: string
  data: {
    train: {
      id: number
      trainNumber: string
      name: string
      type: string
    }
    totalStops: number
    stops: ScheduleStop[]
  }
}

export const trainApi = {
  async searchTrains(params: { from: string; to: string; date: string }): Promise<SearchTrainsResponse> {
    const response = await apiClient.get<SearchTrainsResponse>('/trains/search', { params })
    return response.data
  },

  async getSchedule(trainId: number): Promise<TrainScheduleResponse> {
    const response = await apiClient.get<TrainScheduleResponse>(`/trains/${trainId}/schedule`)
    return response.data
  },
}

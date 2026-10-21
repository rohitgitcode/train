import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TrainSearchResult, AvailableCoach } from '@/api/train.api'
import type { BookingRecord } from '@/api/booking.api'

export const useBookingStore = defineStore('booking', () => {
  const searchParams = ref({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
  })

  const selectedTrain = ref<TrainSearchResult | null>(null)
  const selectedCoach = ref<AvailableCoach | null>(null)
  const lastConfirmedBooking = ref<BookingRecord | null>(null)

  function setSearchParams(params: { from: string; to: string; date: string }) {
    searchParams.value = { ...params }
  }

  function selectTrainAndCoach(train: TrainSearchResult, coach: AvailableCoach) {
    selectedTrain.value = train
    selectedCoach.value = coach
  }

  function setConfirmedBooking(booking: BookingRecord) {
    lastConfirmedBooking.value = booking
  }

  function clearSelection() {
    selectedTrain.value = null
    selectedCoach.value = null
  }

  return {
    searchParams,
    selectedTrain,
    selectedCoach,
    lastConfirmedBooking,
    setSearchParams,
    selectTrainAndCoach,
    setConfirmedBooking,
    clearSelection,
  }
})

<script setup lang="ts">
import { ref } from 'vue'
import { trainApi, type TrainSearchResult, type AvailableCoach, type ScheduleStop } from '@/api/train.api'

const props = defineProps<{
  train: TrainSearchResult
  fromStationName?: string
  toStationName?: string
  journeyDate: string
}>()

const emit = defineEmits<{
  (e: 'book', payload: { train: TrainSearchResult; coach: AvailableCoach }): void
}>()

const showSchedule = ref(false)
const loadingSchedule = ref(false)
const scheduleStops = ref<ScheduleStop[]>([])

async function toggleSchedule() {
  showSchedule.value = !showSchedule.value
  if (showSchedule.value && scheduleStops.value.length === 0) {
    try {
      loadingSchedule.value = true
      const res = await trainApi.getSchedule(props.train.trainId)
      scheduleStops.value = res.data.stops
    } catch (err) {
      console.error('Failed to load schedule', err)
    } finally {
      loadingSchedule.value = false
    }
  }
}

function handleSelectCoach(coach: AvailableCoach) {
  if (coach.availableSeats <= 0) return
  emit('book', { train: props.train, coach })
}
</script>

<template>
  <div class="train-card">
    <!-- Header: Train Number, Name & Type -->
    <div class="card-header">
      <div class="train-identity">
        <h3 class="train-name">{{ train.name }}</h3>
        <span class="train-number">#{{ train.trainNumber }}</span>
        <span class="badge badge-type">{{ train.type }}</span>
      </div>
      <button class="btn-text" type="button" @click="toggleSchedule">
        {{ showSchedule ? 'Hide Schedule ▲' : 'View Schedule ▼' }}
      </button>
    </div>

    <!-- Journey Timings & Route -->
    <div class="journey-meta">
      <div class="time-point">
        <span class="time">{{ train.departureTime }}</span>
        <span class="station-name">{{ fromStationName || 'Departure' }}</span>
      </div>

      <div class="journey-path">
        <span class="distance-badge">{{ train.distanceKm }} km</span>
        <div class="arrow-line">
          <span class="line"></span>
          <span class="arrow">➤</span>
        </div>
        <span class="duration-label">Direct</span>
      </div>

      <div class="time-point text-right">
        <span class="time">{{ train.arrivalTime }}</span>
        <span class="station-name">{{ toStationName || 'Arrival' }}</span>
      </div>
    </div>

    <!-- Coach Seat & Fare Badges Grid -->
    <div class="coaches-section">
      <h4 class="coaches-heading">Available Classes & Fares</h4>
      <div v-if="train.availableCoaches.length > 0" class="coaches-grid">
        <div
          v-for="coach in train.availableCoaches"
          :key="coach.id"
          :class="[
            'coach-box',
            { 'sold-out': coach.availableSeats <= 0 }
          ]"
        >
          <div class="coach-top">
            <span class="coach-type">{{ coach.coachType }}</span>
            <span class="coach-fare">₹{{ coach.fare }}</span>
          </div>

          <div class="coach-status">
            <span
              v-if="coach.availableSeats > 10"
              class="seat-count text-success"
            >
              AVL {{ coach.availableSeats }}
            </span>
            <span
              v-else-if="coach.availableSeats > 0"
              class="seat-count text-warning"
            >
              FAST FILLING ({{ coach.availableSeats }})
            </span>
            <span v-else class="seat-count text-danger">
              NOT AVAILABLE
            </span>
            <span class="quota-tag">{{ coach.quota }}</span>
          </div>

          <button
            class="btn btn-sm btn-book"
            :disabled="coach.availableSeats <= 0"
            @click="handleSelectCoach(coach)"
          >
            {{ coach.availableSeats > 0 ? 'Book Now' : 'Sold Out' }}
          </button>
        </div>
      </div>
      <div v-else class="empty-coaches">
        No seat inventories released for this train yet.
      </div>
    </div>

    <!-- Collapsible Schedule Table -->
    <div v-if="showSchedule" class="schedule-drawer">
      <div v-if="loadingSchedule" class="schedule-loading">
        Loading station route...
      </div>
      <table v-else class="schedule-table">
        <thead>
          <tr>
            <th>Seq</th>
            <th>Station</th>
            <th>Arr</th>
            <th>Dep</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stop in scheduleStops" :key="stop.stopSequence">
            <td>{{ stop.stopSequence }}</td>
            <td>
              <strong>{{ stop.stationCode }}</strong> - {{ stop.stationName }}
            </td>
            <td>{{ stop.arrivalTime || '--' }}</td>
            <td>{{ stop.departureTime || '--' }}</td>
            <td>{{ stop.distanceFromSourceKm }} km</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.train-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.train-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-dark);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-md);
}

.train-identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.train-name {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin: 0;
}

.train-number {
  font-weight: 700;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.badge-type {
  background-color: #f1f5f9;
  color: var(--color-primary);
  border: 1px solid #cbd5e1;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-text:hover {
  color: var(--color-accent-hover);
}

/* Journey Meta */
.journey-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 0 var(--spacing-lg) 0;
}

.time-point {
  display: flex;
  flex-direction: column;
}

.text-right {
  text-align: right;
}

.time {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text-main);
  line-height: 1.1;
}

.station-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.journey-path {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 200px;
  margin: 0 var(--spacing-md);
}

.distance-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.arrow-line {
  display: flex;
  align-items: center;
  width: 100%;
  color: var(--color-border-dark);
}

.arrow-line .line {
  flex: 1;
  height: 2px;
  background-color: var(--color-border);
}

.arrow-line .arrow {
  color: var(--color-accent);
  font-size: 0.75rem;
  margin-left: -2px;
}

.duration-label {
  font-size: 0.7rem;
  color: var(--color-text-light);
}

/* Coaches Grid */
.coaches-section {
  background-color: #fbfcfe;
  border: 1px solid #edf2f7;
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
}

.coaches-heading {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-sm);
}

.coaches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-sm);
}

.coach-box {
  background-color: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  transition: all var(--transition-fast);
}

.coach-box:hover:not(.sold-out) {
  border-color: var(--color-accent);
  box-shadow: 0 2px 4px rgba(243, 112, 33, 0.1);
}

.coach-box.sold-out {
  background-color: #f8fafc;
  opacity: 0.7;
}

.coach-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.coach-type {
  font-weight: 800;
  font-size: var(--font-size-sm);
  color: var(--color-primary);
}

.coach-fare {
  font-weight: 700;
  font-size: var(--font-size-sm);
  color: var(--color-text-main);
}

.coach-status {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.seat-count {
  font-size: 0.75rem;
  font-weight: 700;
}

.text-success {
  color: var(--color-success);
}

.text-warning {
  color: var(--color-warning);
}

.text-danger {
  color: var(--color-danger);
}

.quota-tag {
  font-size: 0.65rem;
  color: var(--color-text-light);
  text-transform: uppercase;
}

.btn-book {
  margin-top: var(--spacing-xs);
  background-color: var(--color-accent);
  color: #ffffff;
  padding: 0.35rem;
  font-size: 0.75rem;
}

.btn-book:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

.empty-coaches {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--spacing-sm);
}

/* Schedule Drawer */
.schedule-drawer {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--color-border);
}

.schedule-loading {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  padding: var(--spacing-sm);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-xs);
}

.schedule-table th,
.schedule-table td {
  padding: 0.45rem 0.65rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.schedule-table th {
  background-color: #f1f5f9;
  color: var(--color-text-muted);
  font-weight: 700;
  text-transform: uppercase;
}

@media (max-width: 640px) {
  .journey-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  .journey-path {
    max-width: 100%;
    margin: var(--spacing-xs) 0;
  }
  .text-right {
    text-align: left;
  }
}
</style>

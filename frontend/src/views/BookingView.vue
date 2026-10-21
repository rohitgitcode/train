<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { bookingApi, type BookingRecord } from '@/api/booking.api'
import AlertBanner from '@/components/AlertBanner.vue'

const router = useRouter()
const bookingStore = useBookingStore()

const train = computed(() => bookingStore.selectedTrain)
const coach = computed(() => bookingStore.selectedCoach)
const journeyDate = computed(() => bookingStore.searchParams.date)

// Passenger details state
const passengers = ref([
  {
    name: '',
    age: '',
    gender: 'MALE',
    berthPreference: 'LOWER',
  },
])

const loading = ref(false)
const errorMessage = ref('')
const alertType = ref<'danger' | 'warning' | 'success'>('danger')
const confirmedBooking = ref<BookingRecord | null>(null)

// Total Calculated Fare
const totalFare = computed(() => {
  if (!coach.value) return 0
  return coach.value.fare * passengers.value.length
})

function addPassenger() {
  if (passengers.value.length >= 6) return
  passengers.value.push({
    name: '',
    age: '',
    gender: 'MALE',
    berthPreference: 'LOWER',
  })
}

function removePassenger(index: number) {
  if (passengers.value.length <= 1) return
  passengers.value.splice(index, 1)
}

async function handleConfirmBooking() {
  errorMessage.value = ''

  if (!train.value || !coach.value) {
    errorMessage.value = 'No train or coach selected. Please return to search.'
    return
  }

  // Basic validation
  for (let i = 0; i < passengers.value.length; i++) {
    const p = passengers.value[i]
    if (!p.name.trim() || !p.age) {
      errorMessage.value = `Please provide complete details for Passenger #${i + 1}`
      alertType.value = 'danger'
      return
    }
    const ageNum = Number(p.age)
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      errorMessage.value = `Invalid age provided for Passenger #${i + 1}`
      alertType.value = 'danger'
      return
    }
  }

  try {
    loading.value = true

    const res = await bookingApi.createBooking({
      trainId: train.value.trainId,
      coachType: coach.value.coachType,
      journeyDate: journeyDate.value,
      passengersCount: passengers.value.length,
    })

    confirmedBooking.value = res.data
    bookingStore.setConfirmedBooking(res.data)
  } catch (err: any) {
    const status = err.response?.status
    const msg = err.response?.data?.message

    if (status === 409) {
      alertType.value = 'warning'
      errorMessage.value =
        msg ||
        '⚡ Tatkal Rush Collision! Another passenger claimed the seat simultaneously. Please retry immediately.'
    } else if (status === 400) {
      alertType.value = 'danger'
      errorMessage.value = msg || 'Insufficient seats remaining for this coach type.'
    } else {
      alertType.value = 'danger'
      errorMessage.value =
        msg || 'Booking failed due to a server error. Please try again in a few moments.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!train.value || !coach.value) {
    router.replace('/')
  }
})
</script>

<template>
  <div class="booking-page container">
    <div v-if="!confirmedBooking" class="booking-layout">
      <!-- Left Column: Passenger Input Form -->
      <div class="booking-main">
        <div class="section-card">
          <div class="section-header">
            <h2>Passenger Details</h2>
            <span class="quota-badge">Quota: {{ coach?.quota || 'GENERAL' }}</span>
          </div>

          <AlertBanner
            v-if="errorMessage"
            :type="alertType"
            :message="errorMessage"
            dismissible
            @dismiss="errorMessage = ''"
          />

          <form class="passengers-form" @submit.prevent="handleConfirmBooking">
            <div
              v-for="(passenger, index) in passengers"
              :key="index"
              class="passenger-row"
            >
              <div class="passenger-index">
                <span>#{{ index + 1 }}</span>
                <button
                  v-if="passengers.length > 1"
                  type="button"
                  class="btn-remove"
                  title="Remove passenger"
                  @click="removePassenger(index)"
                >
                  ✕
                </button>
              </div>

              <div class="field-name">
                <label :for="'name-' + index">Full Name</label>
                <input
                  :id="'name-' + index"
                  v-model="passenger.name"
                  type="text"
                  placeholder="e.g. Sunita Devi"
                  required
                />
              </div>

              <div class="field-age">
                <label :for="'age-' + index">Age</label>
                <input
                  :id="'age-' + index"
                  v-model="passenger.age"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Age"
                  required
                />
              </div>

              <div class="field-gender">
                <label :for="'gender-' + index">Gender</label>
                <select :id="'gender-' + index" v-model="passenger.gender">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="TRANSGENDER">Other</option>
                </select>
              </div>

              <div class="field-berth">
                <label :for="'berth-' + index">Berth Preference</label>
                <select :id="'berth-' + index" v-model="passenger.berthPreference">
                  <option value="NO_PREFERENCE">No Preference</option>
                  <option value="LOWER">Lower Berth</option>
                  <option value="MIDDLE">Middle Berth</option>
                  <option value="UPPER">Upper Berth</option>
                  <option value="SIDE_LOWER">Side Lower</option>
                  <option value="SIDE_UPPER">Side Upper</option>
                </select>
              </div>
            </div>

            <!-- Add Passenger CTA -->
            <div class="form-actions">
              <button
                v-if="passengers.length < 6"
                type="button"
                class="btn btn-outline btn-sm"
                @click="addPassenger"
              >
                + Add Another Passenger (Max 6)
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Right Column: Booking Summary & Action -->
      <aside class="booking-sidebar">
        <div class="summary-card">
          <h3 class="summary-title">Ticket Summary</h3>

          <div class="train-summary">
            <span class="train-name">{{ train?.name }}</span>
            <span class="train-no">#{{ train?.trainNumber }}</span>
          </div>

          <div class="route-summary">
            <div class="summary-point">
              <span class="time">{{ train?.departureTime }}</span>
              <span class="station">Source</span>
            </div>
            <span class="arrow">➔</span>
            <div class="summary-point">
              <span class="time">{{ train?.arrivalTime }}</span>
              <span class="station">Destination</span>
            </div>
          </div>

          <div class="fare-breakdown">
            <div class="fare-row">
              <span>Date of Journey</span>
              <strong>{{ journeyDate }}</strong>
            </div>
            <div class="fare-row">
              <span>Class Selected</span>
              <strong class="class-tag">{{ coach?.coachType }}</strong>
            </div>
            <div class="fare-row">
              <span>Seats Available</span>
              <strong class="text-success">{{ coach?.availableSeats }}</strong>
            </div>
            <div class="fare-row">
              <span>Base Fare per Seat</span>
              <span>₹{{ coach?.fare }}</span>
            </div>
            <div class="fare-row">
              <span>Passenger Count</span>
              <span>× {{ passengers.length }}</span>
            </div>
            <div class="fare-row total-row">
              <span>Total Payable Amount</span>
              <span class="total-amount">₹{{ totalFare }}</span>
            </div>
          </div>

          <!-- Tatkal Book Button -->
          <button
            class="btn btn-primary btn-block btn-pay"
            :disabled="loading || (coach?.availableSeats || 0) < passengers.length"
            @click="handleConfirmBooking"
          >
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Acquiring Tatkal Lock...' : `Confirm & Pay ₹${totalFare}` }}
          </button>

          <p class="tatkal-notice">
            🔒 High-speed Tatkal engine: Seats are locked atomically on transaction submit.
          </p>
        </div>
      </aside>
    </div>

    <!-- Success Confirmation State -->
    <div v-else class="confirmation-card">
      <div class="success-header">
        <span class="success-icon">🎉</span>
        <h2>Ticket Confirmed Successfully!</h2>
        <p>Your Tatkal reservation has been confirmed and saved to database.</p>
      </div>

      <div class="pnr-display">
        <span class="pnr-label">Booking PNR Number</span>
        <span class="pnr-value">{{ confirmedBooking.pnr_number }}</span>
      </div>

      <div class="ticket-meta">
        <div class="meta-item">
          <span class="label">Train</span>
          <span class="value">{{ confirmedBooking.train_name }} (#{{ confirmedBooking.train_number }})</span>
        </div>
        <div class="meta-item">
          <span class="label">Date</span>
          <span class="value">{{ confirmedBooking.journey_date }}</span>
        </div>
        <div class="meta-item">
          <span class="label">Class</span>
          <span class="value">{{ confirmedBooking.coach_type }}</span>
        </div>
        <div class="meta-item">
          <span class="label">Passengers</span>
          <span class="value">{{ confirmedBooking.passengers_count }} Seat(s)</span>
        </div>
        <div class="meta-item">
          <span class="label">Status</span>
          <span class="badge badge-success">{{ confirmedBooking.status }}</span>
        </div>
        <div class="meta-item">
          <span class="label">Amount Paid</span>
          <span class="value">₹{{ confirmedBooking.total_fare }}</span>
        </div>
      </div>

      <div class="confirmation-actions">
        <router-link to="/my-bookings" class="btn btn-primary">
          View in My Bookings
        </router-link>
        <router-link to="/" class="btn btn-outline">
          Book Another Ticket
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-page {
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-2xl);
  flex: 1;
}

.booking-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--spacing-xl);
  align-items: flex-start;
}

.section-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.section-header h2 {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  margin: 0;
}

.quota-badge {
  background-color: var(--color-accent-subtle);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: var(--radius-sm);
}

.passengers-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.passenger-row {
  display: grid;
  grid-template-columns: 40px 2fr 1fr 1.2fr 1.8fr;
  gap: var(--spacing-md);
  align-items: flex-end;
  padding: var(--spacing-md);
  background-color: #f8fafc;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.passenger-index {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 38px;
  font-weight: 800;
  color: var(--color-primary);
}

.btn-remove {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
}

/* Sidebar Summary */
.summary-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.summary-title {
  font-size: var(--font-size-md);
  color: var(--color-primary);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-md);
}

.train-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.train-name {
  font-weight: 700;
  color: var(--color-text-main);
}

.train-no {
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.route-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f1f5f9;
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.summary-point {
  display: flex;
  flex-direction: column;
}

.summary-point .time {
  font-weight: 800;
  font-size: var(--font-size-sm);
}

.summary-point .station {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.arrow {
  color: var(--color-accent);
}

.fare-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

.fare-row {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-body);
  padding: 0.2rem 0;
}

.class-tag {
  background-color: #e2e8f0;
  padding: 0 0.4rem;
  border-radius: var(--radius-sm);
}

.total-row {
  border-top: 2px solid var(--color-border);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-xs);
  font-weight: 700;
  color: var(--color-text-main);
  font-size: var(--font-size-base);
}

.total-amount {
  color: var(--color-accent);
  font-size: 1.25rem;
}

.btn-pay {
  width: 100%;
  padding: 0.85rem;
  font-size: var(--font-size-base);
}

.tatkal-notice {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-align: center;
  margin-top: var(--spacing-sm);
  line-height: 1.3;
}

/* Confirmation Card */
.confirmation-card {
  max-width: 620px;
  margin: var(--spacing-xl) auto;
  background-color: var(--color-surface);
  border: 1px solid var(--color-success-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.success-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--spacing-sm);
}

.success-header h2 {
  color: var(--color-success);
  margin-bottom: var(--spacing-xs);
}

.success-header p {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

.pnr-display {
  background-color: var(--color-success-bg);
  border: 2px dashed var(--color-success);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pnr-label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-success);
  font-weight: 700;
}

.pnr-value {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--color-primary);
}

.ticket-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  text-align: left;
  background-color: #f8fafc;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-sm);
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-item .label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.meta-item .value {
  font-weight: 700;
  color: var(--color-text-main);
}

.confirmation-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.6s linear infinite;
  margin-right: 6px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 860px) {
  .booking-layout {
    grid-template-columns: 1fr;
  }
  .passenger-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

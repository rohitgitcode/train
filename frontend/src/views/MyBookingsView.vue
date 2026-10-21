<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { bookingApi, type BookingRecord } from '@/api/booking.api'
import AlertBanner from '@/components/AlertBanner.vue'

const bookings = ref<BookingRecord[]>([])
const loading = ref(true)
const errorMessage = ref('')

async function fetchBookings() {
  try {
    loading.value = true
    errorMessage.value = ''
    const res = await bookingApi.getMyBookings()
    bookings.value = res.data
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message || 'Failed to retrieve your booking history.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBookings()
})
</script>

<template>
  <div class="my-bookings-page container">
    <div class="page-header">
      <div class="header-left">
        <h2>My Ticket Bookings</h2>
        <p>Review and manage all your confirmed Tatkal and Express journey tickets</p>
      </div>
      <button class="btn btn-outline btn-sm" :disabled="loading" @click="fetchBookings">
        🔄 Refresh
      </button>
    </div>

    <AlertBanner
      v-if="errorMessage"
      type="danger"
      :message="errorMessage"
      dismissible
      @dismiss="errorMessage = ''"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-box">
      <div class="spinner-large"></div>
      <p>Fetching booking records from database...</p>
    </div>

    <!-- Bookings List -->
    <div v-else-if="bookings.length > 0" class="bookings-grid">
      <div v-for="b in bookings" :key="b.id" class="booking-card">
        <!-- Top Status Bar -->
        <div class="booking-top">
          <div class="pnr-badge">
            <span class="pnr-tag">PNR</span>
            <span class="pnr-no">{{ b.pnr_number }}</span>
          </div>
          <span
            :class="[
              'badge',
              b.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'
            ]"
          >
            {{ b.status }}
          </span>
        </div>

        <!-- Train Identity -->
        <div class="train-details">
          <h3 class="train-name">{{ b.train_name || 'Express Train' }}</h3>
          <span class="train-num">#{{ b.train_number }}</span>
        </div>

        <!-- Route Information -->
        <div class="route-info">
          <div class="station-col">
            <span class="stn-code">{{ b.source_station_code || 'SRC' }}</span>
            <span class="stn-name">{{ b.source_station_name || 'Source Station' }}</span>
          </div>
          <div class="arrow-col">
            <span class="arrow-symbol">➔</span>
            <span class="journey-date">{{ b.journey_date }}</span>
          </div>
          <div class="station-col text-right">
            <span class="stn-code">{{ b.destination_station_code || 'DST' }}</span>
            <span class="stn-name">{{ b.destination_station_name || 'Destination Station' }}</span>
          </div>
        </div>

        <!-- Ticket Footer Meta -->
        <div class="booking-bottom">
          <div class="meta-cell">
            <span class="meta-label">Class</span>
            <strong class="meta-val">{{ b.coach_type }}</strong>
          </div>
          <div class="meta-cell">
            <span class="meta-label">Passengers</span>
            <strong class="meta-val">{{ b.passengers_count }} Seat(s)</strong>
          </div>
          <div class="meta-cell">
            <span class="meta-label">Total Fare</span>
            <strong class="meta-val fare-text">₹{{ b.total_fare }}</strong>
          </div>
          <div class="meta-cell text-right">
            <span class="meta-label">Booked At</span>
            <span class="meta-val date-val">
              {{ new Date(b.created_at).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-bookings">
      <span class="empty-icon">🎟️</span>
      <h3>No tickets booked yet</h3>
      <p>You haven't made any train reservations. Search for trains and book your tickets instantly.</p>
      <router-link to="/" class="btn btn-primary btn-search-now">
        Search & Book Trains
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.my-bookings-page {
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-2xl);
  flex: 1;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.header-left h2 {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
  margin-bottom: 2px;
}

.header-left p {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.bookings-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.booking-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
}

.booking-card:hover {
  box-shadow: var(--shadow-md);
}

.booking-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px dashed var(--color-border);
  margin-bottom: var(--spacing-sm);
}

.pnr-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.pnr-tag {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.pnr-no {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: 0.05em;
}

.train-details {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.train-name {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin: 0;
}

.train-num {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text-muted);
}

.route-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8fafc;
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-md);
}

.station-col {
  display: flex;
  flex-direction: column;
}

.text-right {
  text-align: right;
}

.stn-code {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text-main);
}

.stn-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.arrow-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.arrow-symbol {
  color: var(--color-accent);
  font-size: 1.1rem;
}

.journey-date {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
}

.booking-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--spacing-xs);
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.meta-cell {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 600;
}

.meta-val {
  font-size: var(--font-size-sm);
}

.fare-text {
  color: var(--color-accent);
}

.date-val {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* Loading & Empty */
.loading-box, .empty-bookings {
  text-align: center;
  padding: var(--spacing-2xl);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.spinner-large {
  width: 36px;
  height: 36px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto var(--spacing-md) auto;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--spacing-sm);
}

.empty-bookings h3 {
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.empty-bookings p {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  max-width: 440px;
  margin: 0 auto var(--spacing-lg) auto;
}

.btn-search-now {
  padding: 0.6rem 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

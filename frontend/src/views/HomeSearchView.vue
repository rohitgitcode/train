<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { trainApi, type TrainSearchResult, type AvailableCoach } from '@/api/train.api'
import { useBookingStore } from '@/stores/booking'
import TrainCard from '@/components/TrainCard.vue'
import AlertBanner from '@/components/AlertBanner.vue'

const router = useRouter()
const bookingStore = useBookingStore()

const fromStation = ref(bookingStore.searchParams.from || 'ADI')
const toStation = ref(bookingStore.searchParams.to || 'BCT')
const journeyDate = ref(
  bookingStore.searchParams.date || new Date().toISOString().split('T')[0]
)

const loading = ref(false)
const searched = ref(false)
const errorMessage = ref('')
const searchResults = ref<TrainSearchResult[]>([])
const fromStationDetails = ref<{ code: string; name: string } | null>(null)
const toStationDetails = ref<{ code: string; name: string } | null>(null)

function swapStations() {
  const temp = fromStation.value
  fromStation.value = toStation.value
  toStation.value = temp
}

async function handleSearch() {
  errorMessage.value = ''

  if (!fromStation.value.trim() || !toStation.value.trim() || !journeyDate.value) {
    errorMessage.value = 'Please fill in From Station, To Station and Journey Date.'
    return
  }

  try {
    loading.value = true
    searched.value = true

    bookingStore.setSearchParams({
      from: fromStation.value.trim().toUpperCase(),
      to: toStation.value.trim().toUpperCase(),
      date: journeyDate.value,
    })

    const res = await trainApi.searchTrains({
      from: fromStation.value.trim().toUpperCase(),
      to: toStation.value.trim().toUpperCase(),
      date: journeyDate.value,
    })

    searchResults.value = res.data.trains
    fromStationDetails.value = res.data.fromStation
    toStationDetails.value = res.data.toStation
  } catch (err: any) {
    searchResults.value = []
    errorMessage.value =
      err.response?.data?.message || 'Failed to search trains. Please verify station codes.'
  } finally {
    loading.value = false
  }
}

function handleBookTicket(payload: { train: TrainSearchResult; coach: AvailableCoach }) {
  bookingStore.selectTrainAndCoach(payload.train, payload.coach)
  router.push('/booking')
}

// Auto-search if stations already populated
onMounted(() => {
  if (fromStation.value && toStation.value && journeyDate.value) {
    handleSearch()
  }
})
</script>

<template>
  <div class="home-view">
    <!-- Hero Banner with Railway Motif -->
    <section class="hero-section">
      <div class="container hero-container">
        <h1 class="hero-title">Book Tatkal & Express Train Tickets</h1>
        <p class="hero-subtitle">
          Direct database sync with real-time seat inventory and high-concurrency booking engine
        </p>

        <!-- Search Box Card -->
        <div class="search-card">
          <form class="search-form" @submit.prevent="handleSearch">
            <!-- From Station -->
            <div class="field-group">
              <label for="from">From Station</label>
              <div class="input-wrapper">
                <span class="field-icon">🚉</span>
                <input
                  id="from"
                  v-model="fromStation"
                  type="text"
                  placeholder="Code (e.g. ADI, NDLS)"
                  required
                />
              </div>
            </div>

            <!-- Swap Button -->
            <button
              type="button"
              class="btn-swap"
              title="Swap stations"
              @click="swapStations"
            >
              ⇄
            </button>

            <!-- To Station -->
            <div class="field-group">
              <label for="to">To Station</label>
              <div class="input-wrapper">
                <span class="field-icon">🏁</span>
                <input
                  id="to"
                  v-model="toStation"
                  type="text"
                  placeholder="Code (e.g. BCT, HWH)"
                  required
                />
              </div>
            </div>

            <!-- Journey Date -->
            <div class="field-group date-group">
              <label for="date">Journey Date</label>
              <div class="input-wrapper">
                <span class="field-icon">📅</span>
                <input
                  id="date"
                  v-model="journeyDate"
                  type="date"
                  required
                />
              </div>
            </div>

            <!-- Submit Button -->
            <div class="field-group submit-group">
              <button type="submit" class="btn btn-primary btn-search" :disabled="loading">
                <span v-if="loading" class="spinner"></span>
                {{ loading ? 'Searching...' : 'Find Trains' }}
              </button>
            </div>
          </form>

          <!-- Quick Station Tags -->
          <div class="quick-stations">
            <span class="quick-label">Popular Routes:</span>
            <button
              type="button"
              class="tag-btn"
              @click="fromStation = 'ADI'; toStation = 'BCT'; handleSearch()"
            >
              ADI ➔ BCT (Ahmedabad - Mumbai)
            </button>
            <button
              type="button"
              class="tag-btn"
              @click="fromStation = 'NDLS'; toStation = 'BCT'; handleSearch()"
            >
              NDLS ➔ BCT (Delhi - Mumbai)
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="container results-section">
      <AlertBanner
        v-if="errorMessage"
        type="danger"
        :message="errorMessage"
        dismissible
        @dismiss="errorMessage = ''"
      />

      <!-- Search Header -->
      <div v-if="searched && !loading && !errorMessage" class="results-header">
        <div class="route-summary">
          <h2>
            {{ fromStationDetails?.name || fromStation }}
            <span class="route-arrow">➔</span>
            {{ toStationDetails?.name || toStation }}
          </h2>
          <span class="journey-date-badge">
            📅 {{ journeyDate }} | {{ searchResults.length }} Trains Available
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="large-spinner"></div>
        <p>Scanning train schedules & live seat inventories...</p>
      </div>

      <!-- Results List -->
      <div v-else-if="searched && searchResults.length > 0" class="trains-list">
        <TrainCard
          v-for="train in searchResults"
          :key="train.trainId"
          :train="train"
          :from-station-name="fromStationDetails?.name"
          :to-station-name="toStationDetails?.name"
          :journey-date="journeyDate"
          @book="handleBookTicket"
        />
      </div>

      <!-- Empty State -->
      <div v-else-if="searched && searchResults.length === 0 && !errorMessage" class="empty-state">
        <div class="empty-icon">🚫</div>
        <h3>No direct trains found</h3>
        <p>
          No scheduled trains found between {{ fromStation }} and {{ toStation }} for the chosen date.
          Please try another date or alternate stations.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.hero-section {
  background: linear-gradient(180deg, var(--color-primary) 0%, #173860 100%);
  color: #ffffff;
  padding: var(--spacing-2xl) 0 var(--spacing-xl) 0;
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-title {
  color: #ffffff;
  font-size: var(--font-size-2xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-xs);
}

.hero-subtitle {
  color: #cbd5e1;
  font-size: var(--font-size-sm);
  max-width: 600px;
  margin-bottom: var(--spacing-xl);
}

/* Search Card */
.search-card {
  background-color: var(--color-surface);
  color: var(--color-text-main);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 960px;
  text-align: left;
}

.search-form {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.field-group {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 0.75rem;
  font-size: 1rem;
  pointer-events: none;
}

.input-wrapper input {
  padding-left: 2.3rem;
  text-transform: uppercase;
  font-weight: 600;
}

.btn-swap {
  background-color: #f1f5f9;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--color-primary);
  margin-bottom: 2px;
  transition: all var(--transition-fast);
}

.btn-swap:hover {
  background-color: #e2e8f0;
  border-color: var(--color-accent);
}

.submit-group {
  flex: 0 0 auto;
}

.btn-search {
  height: 38px;
  padding: 0 var(--spacing-xl);
  font-size: var(--font-size-sm);
}

.quick-stations {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
}

.quick-label {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text-muted);
}

.tag-btn {
  background-color: #f1f5f9;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  padding: 0.2rem 0.6rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag-btn:hover {
  background-color: var(--color-accent-subtle);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* Results Section */
.results-section {
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-2xl);
  flex: 1;
}

.results-header {
  margin-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: var(--spacing-md);
}

.route-summary h2 {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  margin-bottom: 4px;
}

.route-arrow {
  color: var(--color-accent);
  margin: 0 var(--spacing-xs);
}

.journey-date-badge {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text-muted);
}

/* Loading & Empty States */
.loading-state, .empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.large-spinner {
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
  margin-bottom: var(--spacing-sm);
}

.empty-state h3 {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.empty-state p {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  max-width: 500px;
  margin: 0 auto;
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

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  .btn-swap {
    align-self: center;
  }
  .btn-search {
    width: 100%;
  }
}
</style>

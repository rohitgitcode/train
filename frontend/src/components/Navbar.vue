<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="navbar-wrapper">
    <div class="container navbar">
      <!-- Brand Logo -->
      <router-link to="/" class="brand">
        <div class="brand-logo">
          <span class="train-icon">🚆</span>
        </div>
        <div class="brand-text">
          <span class="brand-name">TATKAL<span class="brand-highlight">EXPRESS</span></span>
          <span class="brand-tagline">Fast Indian Railways Reservation</span>
        </div>
      </router-link>

      <!-- Navigation Links -->
      <nav class="nav-links">
        <router-link to="/" class="nav-link" active-class="active">
          Search Trains
        </router-link>
        <router-link
          v-if="authStore.isAuthenticated"
          to="/my-bookings"
          class="nav-link"
          active-class="active"
        >
          My Bookings
        </router-link>
      </nav>

      <!-- User Authentication Controls -->
      <div class="nav-auth">
        <template v-if="authStore.isAuthenticated">
          <div class="user-profile">
            <span class="user-avatar">👤</span>
            <span class="user-name">{{ authStore.user?.fullName }}</span>
          </div>
          <button class="btn btn-sm btn-outline-white" @click="handleLogout">
            Logout
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn btn-sm btn-outline-white">
            Login
          </router-link>
          <router-link to="/register" class="btn btn-sm btn-primary">
            Register
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar-wrapper {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 2px solid var(--color-accent);
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
  color: inherit;
}

.brand-logo {
  font-size: 1.8rem;
  display: flex;
  align-items: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.brand-highlight {
  color: var(--color-accent);
  margin-left: 2px;
}

.brand-tagline {
  font-size: 0.65rem;
  color: #94a3b8;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-link {
  color: #cbd5e1;
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: 0.5rem 0.25rem;
  position: relative;
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: #ffffff;
}

.nav-link.active {
  color: var(--color-accent);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-accent);
  border-radius: var(--radius-full);
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: #e2e8f0;
}

.user-avatar {
  font-size: 1rem;
}

.user-name {
  font-weight: 600;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-outline-white {
  background-color: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.btn-outline-white:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
}

@media (max-width: 768px) {
  .brand-tagline {
    display: none;
  }
  .nav-links {
    gap: var(--spacing-sm);
  }
}
</style>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <div class="app-layout">
    <Navbar />

    <main class="content-wrapper">
      <router-view />
    </main>

    <footer class="app-footer">
      <div class="container footer-container">
        <div class="footer-left">
          <span class="footer-brand">🚆 Tatkal Express Reservation System</span>
          <p class="footer-copy">
            High-concurrency optimistic locking engine built on Node.js, Express, Lucid ORM & Vue 3.
          </p>
        </div>
        <div class="footer-right">
          <span class="secure-badge">🔒 256-Bit SSL Encrypted Booking</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.app-footer {
  background-color: var(--color-primary);
  color: #94a3b8;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--spacing-lg) 0;
  margin-top: auto;
}

.footer-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
}

.footer-brand {
  font-weight: 700;
  color: #ffffff;
  display: block;
  margin-bottom: 2px;
}

.footer-copy {
  color: #94a3b8;
  font-size: 0.75rem;
}

.secure-badge {
  color: #e2e8f0;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.08);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-full);
}

@media (max-width: 640px) {
  .footer-container {
    flex-direction: column;
    text-align: center;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AlertBanner from '@/components/AlertBanner.vue'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''

  if (!fullName.value.trim() || !email.value.trim() || !password.value) {
    errorMessage.value = 'All fields are required.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long.'
    return
  }

  try {
    loading.value = true
    await authStore.register({
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      password: password.value,
    })

    router.push('/')
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message || 'Registration failed. Please try again with another email.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <span class="auth-icon">📝</span>
        <h2>Passenger Registration</h2>
        <p>Create an IRCTC Tatkal Engine profile</p>
      </div>

      <AlertBanner
        v-if="errorMessage"
        type="danger"
        :message="errorMessage"
        dismissible
        @dismiss="errorMessage = ''"
      />

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            placeholder="e.g. Ramesh Patel"
            required
            autocomplete="name"
          />
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="e.g. ramesh@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password (Min 8 chars, 1 uppercase, 1 number)</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Create a strong password"
            required
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            required
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Creating Account...' : 'Register as Passenger' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>
          Already registered?
          <router-link to="/login">Sign in here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: var(--spacing-xl) var(--spacing-md);
}

.auth-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-md);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.auth-icon {
  font-size: 2.2rem;
  display: block;
  margin-bottom: var(--spacing-xs);
}

.auth-header h2 {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.auth-header p {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.btn-block {
  width: 100%;
  margin-top: var(--spacing-sm);
  padding: 0.75rem;
}

.auth-footer {
  text-align: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
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
</style>

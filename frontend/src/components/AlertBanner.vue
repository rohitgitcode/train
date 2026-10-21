<script setup lang="ts">
defineProps<{
  type?: 'success' | 'danger' | 'warning' | 'info'
  message: string
  dismissible?: boolean
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()
</script>

<template>
  <div v-if="message" :class="['alert', `alert-${type || 'info'}`]">
    <div class="alert-icon">
      <span v-if="type === 'success'">✓</span>
      <span v-else-if="type === 'danger'">✕</span>
      <span v-else-if="type === 'warning'">⚠</span>
      <span v-else>ℹ</span>
    </div>
    <div class="alert-content">
      {{ message }}
    </div>
    <button
      v-if="dismissible"
      class="alert-close"
      type="button"
      aria-label="Dismiss alert"
      @click="emit('dismiss')"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
  border: 1px solid transparent;
  animation: slideDown 0.2s ease-out;
}

.alert-icon {
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
  font-weight: 500;
}

.alert-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: inherit;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.alert-close:hover {
  opacity: 1;
}

.alert-success {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border-color: var(--color-success-border);
}

.alert-danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: var(--color-danger-border);
}

.alert-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  border-color: var(--color-warning-border);
}

.alert-info {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

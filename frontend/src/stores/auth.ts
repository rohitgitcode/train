import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type AuthUser, type LoginPayload, type RegisterPayload } from '@/api/auth.api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('tatkal_token'))
  const user = ref<AuthUser | null>(
    localStorage.getItem('tatkal_user')
      ? JSON.parse(localStorage.getItem('tatkal_user')!)
      : null
  )

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  function setAuthData(newToken: string, newUser: AuthUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('tatkal_token', newToken)
    localStorage.setItem('tatkal_user', JSON.stringify(newUser))
  }

  async function login(credentials: LoginPayload) {
    const res = await authApi.login(credentials)
    setAuthData(res.data.token, res.data.user)
    return res
  }

  async function register(payload: RegisterPayload) {
    const res = await authApi.register(payload)
    setAuthData(res.data.token, res.data.user)
    return res
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('tatkal_token')
    localStorage.removeItem('tatkal_user')
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
  }
})

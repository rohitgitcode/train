import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeSearchView from '@/views/HomeSearchView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import BookingView from '@/views/BookingView.vue'
import MyBookingsView from '@/views/MyBookingsView.vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeSearchView,
    meta: { title: 'Search Trains - Tatkal Express' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true, title: 'Login - Tatkal Express' },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true, title: 'Register - Tatkal Express' },
  },
  {
    path: '/booking',
    name: 'booking',
    component: BookingView,
    meta: { requiresAuth: true, title: 'Confirm Booking - Tatkal Express' },
  },
  {
    path: '/my-bookings',
    name: 'my-bookings',
    component: MyBookingsView,
    meta: { requiresAuth: true, title: 'My Bookings - Tatkal Express' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation Guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Dynamic Page Title
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // Protected Route Guard
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  // Guest Only Guard (redirect logged-in users away from login/register)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next('/')
  }

  next()
})

export default router

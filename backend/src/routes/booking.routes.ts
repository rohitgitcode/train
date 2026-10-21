import { Router } from 'express'
import { BookingController } from '../controllers/booking.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

// Customer protected route: book seat (Tatkal engine)
router.post('/book', authenticate, BookingController.book)

// Customer protected route: view logged-in user's booking history
router.get('/my-bookings', authenticate, BookingController.getMyBookings)

export default router

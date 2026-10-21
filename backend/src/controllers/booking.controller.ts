import type { Request, Response, NextFunction } from 'express'
import { bookingService } from '../services/booking.service.js'
import { createBookingSchema } from '../validators/booking.validator.js'
import { AppError } from '../utils/appError.js'

export class BookingController {
  /**
   * Book a seat (Tatkal Engine)
   * POST /api/bookings/book
   */
  public static async book(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        throw new AppError('Unauthorized: Authentication required', 401)
      }

      // 1. Validate request body with Zod schema
      const validatedData = createBookingSchema.parse(req.body)

      // 2. Execute booking service with optimistic locking
      const booking = await bookingService.createBooking(req.user.id, validatedData)

      res.status(201).json({
        success: true,
        message: 'Seat booked successfully',
        data: booking,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get logged-in user's booking history
   * GET /api/bookings/my-bookings
   */
  public static async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        throw new AppError('Unauthorized: Authentication required', 401)
      }

      const bookings = await bookingService.getUserBookings(req.user.id)

      res.status(200).json({
        success: true,
        message: 'Booking history fetched successfully',
        data: bookings,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default BookingController

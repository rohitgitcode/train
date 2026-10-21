import { db } from '../config/database.js'
import { AppError } from '../utils/appError.js'
import type { CreateBookingDTO } from '../validators/booking.validator.js'

const BASE_FARE: Record<string, number> = {
  '1A': 1500,
  '2A': 1000,
  '3A': 700,
  'CC': 450,
  'SL': 250,
  '2S': 120,
}

export class BookingService {
  /**
   * High-Concurrency Tatkal Booking with Optimistic Locking & Atomic Transactions
   */
  public async createBooking(userId: number, payload: CreateBookingDTO) {
    const { trainId, coachType, journeyDate, passengersCount } = payload

    const MAX_RETRIES = 3
    let attempt = 0

    while (attempt < MAX_RETRIES) {
      attempt++

      try {
        const booking = await db.transaction(async (trx) => {
          // 1. Fetch current seat inventory for the given train, date & coach type
          const inventory = await trx
            .from('seat_inventories')
            .where('train_id', trainId)
            .where('coach_type', coachType)
            .where('journey_date', journeyDate)
            .first()

          if (!inventory) {
            throw new AppError(
              `Seat inventory not found for train ID ${trainId} on ${journeyDate} (${coachType})`,
              404
            )
          }

          // 2. Validate seat availability
          if (inventory.available_seats < passengersCount) {
            throw new AppError(
              `Seats not available. Requested: ${passengersCount}, Available: ${inventory.available_seats}`,
              400
            )
          }

          // 3. Atomic update query using Optimistic Locking (version check)
          const updateResult: any = await trx.rawQuery(
            `UPDATE seat_inventories 
             SET available_seats = available_seats - ?, version = version + 1 
             WHERE id = ? AND version = ? AND available_seats >= ?`,
            [passengersCount, inventory.id, inventory.version, passengersCount]
          )

          // MySQL affectedRows extraction
          const affectedRows =
            updateResult?.[0]?.affectedRows ?? updateResult?.affectedRows ?? 0

          // Concurrency collision occurred (another concurrent transaction updated the record)
          if (affectedRows === 0) {
            throw new AppError('CONCURRENCY_COLLISION', 409)
          }

          // 4. Generate 10-digit Indian Railways standard PNR
          const pnrNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString()

          // 5. Calculate total fare
          const unitFare = BASE_FARE[coachType] || 350
          const totalFare = unitFare * passengersCount

          // 6. Insert booking record inside the same atomic transaction
          const insertResult: any = await trx.table('bookings').insert({
            user_id: userId,
            train_id: trainId,
            pnr_number: pnrNumber,
            journey_date: journeyDate,
            coach_type: coachType,
            passengers_count: passengersCount,
            total_fare: totalFare,
            status: 'CONFIRMED',
            created_at: new Date(),
            updated_at: new Date(),
          })

          const newBookingId = insertResult?.[0] ?? insertResult

          // Return booking details
          const createdBooking = await trx
            .from('bookings as b')
            .join('trains as t', 'b.train_id', 't.id')
            .where('b.id', newBookingId)
            .select(
              'b.id',
              'b.pnr_number',
              'b.journey_date',
              'b.coach_type',
              'b.passengers_count',
              'b.total_fare',
              'b.status',
              'b.created_at',
              't.id as train_id',
              't.train_number',
              't.name as train_name'
            )
            .first()

          return createdBooking
        })

        return booking
      } catch (error: any) {
        if (error.message === 'CONCURRENCY_COLLISION' && attempt < MAX_RETRIES) {
          // Retry with exponential jitter backoff
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 40 + 20))
          continue
        }
        if (error.message === 'CONCURRENCY_COLLISION') {
          throw new AppError(
            'High concurrency collision during Tatkal booking. Please try again.',
            409
          )
        }
        throw error
      }
    }
  }

  /**
   * Fetch all past and active bookings for a specific user
   */
  public async getUserBookings(userId: number) {
    const bookings = await db
      .from('bookings as b')
      .join('trains as t', 'b.train_id', 't.id')
      .leftJoin('stations as s_src', 't.source_station_id', 's_src.id')
      .leftJoin('stations as s_dst', 't.destination_station_id', 's_dst.id')
      .where('b.user_id', userId)
      .orderBy('b.created_at', 'desc')
      .select(
        'b.id',
        'b.pnr_number',
        'b.journey_date',
        'b.coach_type',
        'b.passengers_count',
        'b.total_fare',
        'b.status',
        'b.created_at',
        't.id as train_id',
        't.train_number',
        't.name as train_name',
        't.type as train_type',
        's_src.name as source_station_name',
        's_src.code as source_station_code',
        's_dst.name as destination_station_name',
        's_dst.code as destination_station_code'
      )

    return bookings
  }
}

export const bookingService = new BookingService()

import { z } from 'zod'

export const createBookingSchema = z.object({
  trainId: z
    .number({ error: 'trainId must be a valid number' })
    .int()
    .positive('trainId must be positive'),
  coachType: z.enum(['1A', '2A', '3A', 'SL', 'CC', '2S'], {
    error: 'coachType must be one of: 1A, 2A, 3A, SL, CC, 2S',
  }),
  journeyDate: z
    .string({ error: 'journeyDate is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'journeyDate must be in YYYY-MM-DD format'),
  passengersCount: z
    .number({ error: 'passengersCount must be a valid number' })
    .int()
    .min(1, 'At least 1 passenger is required')
    .max(6, 'Maximum 6 passengers allowed per booking'),
})

export type CreateBookingDTO = z.infer<typeof createBookingSchema>

import { z } from 'zod'

export const searchTrainsQuerySchema = z.object({
  from: z
    .string({ error: 'Source station code (from) is required' })
    .trim()
    .min(2, 'Source station code must be at least 2 characters')
    .max(10, 'Source station code cannot exceed 10 characters'),
  to: z
    .string({ error: 'Destination station code (to) is required' })
    .trim()
    .min(2, 'Destination station code must be at least 2 characters')
    .max(10, 'Destination station code cannot exceed 10 characters'),
  date: z
    .string({ error: 'Journey date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
})

export type SearchTrainsQueryDTO = z.infer<typeof searchTrainsQuerySchema>

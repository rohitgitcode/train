import { z } from 'zod'

export const createStationSchema = z.object({
  code: z
    .string({ error: 'Station code is required' })
    .trim()
    .min(2, 'Station code must be at least 2 characters')
    .max(10, 'Station code cannot exceed 10 characters'),
  name: z
    .string({ error: 'Station name is required' })
    .trim()
    .min(2, 'Station name must be at least 2 characters')
    .max(100, 'Station name cannot exceed 100 characters'),
})

export type CreateStationDTO = z.infer<typeof createStationSchema>

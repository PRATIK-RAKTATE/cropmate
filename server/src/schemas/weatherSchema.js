import { z } from 'zod'

export const weatherSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  district: z.string().optional(),
})

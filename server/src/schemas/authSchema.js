import { z } from 'zod'

export const demoLoginSchema = z.object({
  farmerId: z.string().min(1),
})

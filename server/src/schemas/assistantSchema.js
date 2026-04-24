import { z } from 'zod'

export const assistantSchema = z.object({
  farmerId: z.string().min(1),
  farmId: z.string().min(1),
  language: z.enum(['en', 'hi', 'mr']).default('en'),
  question: z.string().min(3),
})

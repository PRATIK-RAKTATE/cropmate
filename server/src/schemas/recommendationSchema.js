import { z } from 'zod'

export const recommendationSchema = z.object({
  farmId: z.string().min(1),
  season: z.enum(['kharif', 'rabi', 'zaid']),
  budget: z.enum(['low', 'medium', 'high']).default('medium'),
  language: z.enum(['en', 'hi', 'mr']).default('en'),
  soil: z.object({
    nitrogen: z.number().min(0).max(200),
    phosphorus: z.number().min(0).max(200),
    potassium: z.number().min(0).max(200),
    ph: z.number().min(3).max(10),
    moisture: z.number().min(0).max(100).default(0),
    organicCarbon: z.number().min(0).max(5).default(0.6),
    source: z.string().default('manual_input'),
  }),
})

import { z } from 'zod'

export const demoLoginSchema = z.object({
  farmerId: z.string().min(1),
})

export const registerSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().length(10),
  password: z.string().min(6),
  preferredLanguage: z.enum(['en', 'hi', 'mr']),
  village: z.string().min(2),
  district: z.string().min(2),
  state: z.string().min(2),
})

export const loginSchema = z.object({
  mobile: z.string().length(10),
  password: z.string().min(6),
})

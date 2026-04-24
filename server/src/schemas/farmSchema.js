import { z } from 'zod'

export const farmSchema = z.object({
  farmerId: z.string().min(1),
  name: z.string().min(2),
  location: z.object({
    village: z.string().min(2),
    district: z.string().min(2),
    state: z.string().min(2),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  farmSizeAcres: z.number().positive(),
  soilType: z.string().min(2),
  irrigationSource: z.string().min(2),
  waterAvailability: z.enum(['low', 'medium', 'high']),
  previousCrop: z.string().min(2),
  currentSeason: z.enum(['kharif', 'rabi', 'zaid']).default('kharif'),
  budget: z.enum(['low', 'medium', 'high']).default('medium'),
  farmingType: z.string().default('conventional'),
})

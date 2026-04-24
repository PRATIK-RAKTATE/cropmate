import { Farm } from '../models/Farm.js'
import { farmSchema } from '../schemas/farmSchema.js'
import { validate } from '../middleware/validate.js'

export async function createFarm(request, response) {
  const payload = validate(farmSchema, request.body)
  const farm = await Farm.create(payload)
  response.status(201).json(farm)
}

export async function getFarm(request, response) {
  const farm = await Farm.findById(request.params.id)
  response.json(farm)
}

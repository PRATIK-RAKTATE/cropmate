import { Farm } from '../models/Farm.js'
import { Farmer } from '../models/Farmer.js'
import { demoLoginSchema } from '../schemas/authSchema.js'
import { validate } from '../middleware/validate.js'
import { createHttpError } from '../utils/httpError.js'

export async function demoLogin(request, response) {
  const payload = validate(demoLoginSchema, request.body)
  const farmer = await Farmer.findById(payload.farmerId)

  if (!farmer) {
    throw createHttpError(404, 'Farmer not found')
  }

  const defaultFarm = await Farm.findOne({ farmerId: farmer._id }).sort({ createdAt: 1 })

  response.json({
    farmer,
    defaultFarm,
  })
}

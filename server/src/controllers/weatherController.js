import { weatherSchema } from '../schemas/weatherSchema.js'
import { validate } from '../middleware/validate.js'
import { getWeather } from '../services/weatherService.js'

export async function resolveWeather(request, response) {
  const payload = validate(weatherSchema, request.body)
  const weather = await getWeather(payload)
  response.json(weather)
}

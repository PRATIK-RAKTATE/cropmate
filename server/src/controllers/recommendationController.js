import { CropRecommendation } from '../models/CropRecommendation.js'
import { Farm } from '../models/Farm.js'
import { SoilReport } from '../models/SoilReport.js'
import { recommendationSchema } from '../schemas/recommendationSchema.js'
import { validate } from '../middleware/validate.js'
import { getWeather } from '../services/weatherService.js'
import { rankCrops } from '../services/recommendationService.js'
import { createHttpError } from '../utils/httpError.js'

export async function createRecommendation(request, response) {
  const payload = validate(recommendationSchema, request.body)
  const farm = await Farm.findById(payload.farmId)

  if (!farm) {
    throw createHttpError(404, 'Farm not found')
  }

  const soilReport = await SoilReport.create({
    farmId: farm._id,
    ...payload.soil,
  })

  const weather = await getWeather({
    lat: farm.location.lat,
    lng: farm.location.lng,
    district: farm.location.district,
  })

  const recommendations = rankCrops({
    farm,
    soil: payload.soil,
    weather,
    season: payload.season,
  })

  const saved = await CropRecommendation.create({
    farmerId: farm.farmerId,
    farmId: farm._id,
    soilReportId: soilReport._id,
    season: payload.season,
    budget: payload.budget,
    weatherSource: weather.source,
    recommendations,
  })

  response.status(201).json({
    ...saved.toObject(),
    weather,
  })
}

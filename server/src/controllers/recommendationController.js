import { CropRecommendation } from '../models/CropRecommendation.js'
import { Farm } from '../models/Farm.js'
import { SoilReport } from '../models/SoilReport.js'
import { recommendationSchema } from '../schemas/recommendationSchema.js'
import { validate } from '../middleware/validate.js'
import { getWeather } from '../services/weatherService.js'
import { rankCrops } from '../services/recommendationService.js'
import { createHttpError } from '../utils/httpError.js'

import multer from 'multer'
import { env } from '../config/env.js'
import { extractSoilDataFromImage } from '../services/ocrService.js'

const storage = multer.memoryStorage()
export const uploadSoilReport = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

export async function extractSoil(request, response) {
  if (!request.file) {
    throw createHttpError(400, 'Soil report image is required')
  }

  try {
    const result = await extractSoilDataFromImage({
      groqApiKey: env.groqApiKey,
      file: request.file,
    })

    response.status(200).json(result)
  } catch (error) {
    console.error('Extraction controller error:', error)
    throw createHttpError(error.status || 500, error.message || 'Soil extraction failed')
  }
}

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
    language: payload.language,
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

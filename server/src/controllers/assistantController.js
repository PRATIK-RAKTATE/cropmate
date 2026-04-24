import { env } from '../config/env.js'
import { ChatSession } from '../models/ChatSession.js'
import { CropRecommendation } from '../models/CropRecommendation.js'
import { DiseaseReport } from '../models/DiseaseReport.js'
import { Farm } from '../models/Farm.js'
import { Farmer } from '../models/Farmer.js'
import { SoilReport } from '../models/SoilReport.js'
import { assistantSchema } from '../schemas/assistantSchema.js'
import { validate } from '../middleware/validate.js'
import { getWeather } from '../services/weatherService.js'
import { answerQuestion } from '../services/assistantService.js'
import { createHttpError } from '../utils/httpError.js'

export async function askAssistant(request, response) {
  const payload = validate(assistantSchema, request.body)

  const [farmer, farm, soil, recommendation, diseaseReport] = await Promise.all([
    Farmer.findById(payload.farmerId),
    Farm.findById(payload.farmId),
    SoilReport.findOne({ farmId: payload.farmId }).sort({ createdAt: -1 }),
    CropRecommendation.findOne({ farmId: payload.farmId }).sort({ createdAt: -1 }),
    DiseaseReport.findOne({ farmId: payload.farmId }).sort({ createdAt: -1 }),
  ])

  if (!farmer || !farm) {
    throw createHttpError(404, 'Farmer or farm not found')
  }

  const weather = await getWeather({
    lat: farm.location.lat,
    lng: farm.location.lng,
    district: farm.location.district,
  })

  const answer = await answerQuestion({
    groqApiKey: env.groqApiKey,
    groqModel: env.groqModel,
    farmer: farmer.toObject(),
    farm: farm.toObject(),
    soil: soil?.toObject() || null,
    recommendation: recommendation?.toObject() || null,
    weather,
    diseaseReport: diseaseReport?.toObject() || null,
    language: payload.language,
    question: payload.question,
  })

  response.json(answer)
}

export async function getChatSession(request, response) {
  const session = await ChatSession.findOne({
    farmerId: request.params.farmerId,
    farmId: request.params.farmId,
  }).sort({ createdAt: -1 })

  response.json(session)
}

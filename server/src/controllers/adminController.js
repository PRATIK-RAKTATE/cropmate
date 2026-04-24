import { ChatSession } from '../models/ChatSession.js'
import { CropRecommendation } from '../models/CropRecommendation.js'
import { DiseaseReport } from '../models/DiseaseReport.js'
import { Farm } from '../models/Farm.js'
import { Farmer } from '../models/Farmer.js'

export async function getAdminSummary(_request, response) {
  const [farmers, farms, recommendations, diseaseReports, chatSessions] = await Promise.all([
    Farmer.countDocuments(),
    Farm.countDocuments(),
    CropRecommendation.countDocuments(),
    DiseaseReport.countDocuments(),
    ChatSession.countDocuments(),
  ])

  const recentRecommendations = await CropRecommendation.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('farmId')

  response.json({
    metrics: {
      farmers,
      farms,
      recommendations,
      diseaseReports,
      chatSessions,
    },
    recentRecommendations,
  })
}

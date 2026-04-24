import { ChatSession } from '../models/ChatSession.js'
import { CropRecommendation } from '../models/CropRecommendation.js'
import { DiseaseReport } from '../models/DiseaseReport.js'
import { RadarAlert } from '../models/RadarAlert.js'

export async function getHistory(request, response) {
  const { farmerId } = request.params

  const [recommendations, diseases, chats, alerts] = await Promise.all([
    CropRecommendation.find({ farmerId }).sort({ createdAt: -1 }).limit(10),
    DiseaseReport.find({ farmerId }).sort({ createdAt: -1 }).limit(10),
    ChatSession.find({ farmerId }).sort({ updatedAt: -1 }).limit(10),
    RadarAlert.find().sort({ updatedAt: -1 }).limit(10),
  ])

  response.json({
    recommendations,
    diseases,
    chats,
    alerts,
  })
}

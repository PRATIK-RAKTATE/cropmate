import { ChatSession } from '../models/ChatSession.js'
import { CropRecommendation } from '../models/CropRecommendation.js'
import { DiseaseReport } from '../models/DiseaseReport.js'
import { Alert } from '../models/Alert.js'

export async function getHistory(request, response) {
  const { farmerId } = request.params

  const [recommendations, diseases, chats, alerts] = await Promise.all([
    CropRecommendation.find({ farmerId }).sort({ createdAt: -1 }).limit(10),
    DiseaseReport.find({ farmerId }).sort({ createdAt: -1 }).limit(10),
    ChatSession.find({ farmerId }).sort({ updatedAt: -1 }).limit(10),
    Alert.find({ farmerId }).sort({ createdAt: -1 }).limit(10),
  ])

  response.json({
    recommendations,
    diseases,
    chats,
    alerts,
  })
}

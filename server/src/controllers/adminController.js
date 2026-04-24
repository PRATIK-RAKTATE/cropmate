import { ChatSession } from '../models/ChatSession.js'
import { CropRecommendation } from '../models/CropRecommendation.js'
import { DiseaseReport } from '../models/DiseaseReport.js'
import { Farm } from '../models/Farm.js'
import { Farmer } from '../models/Farmer.js'
import { SmsLog } from '../models/SmsLog.js'
import { sendNotification } from '../services/notificationService.js'

export async function getAdminSummary(_request, response) {
  const [farmers, farms, recommendations, diseaseReports, chatSessions, smsLogs] = await Promise.all([
    Farmer.countDocuments(),
    Farm.countDocuments(),
    CropRecommendation.countDocuments(),
    DiseaseReport.countDocuments(),
    ChatSession.countDocuments(),
    SmsLog.countDocuments(),
  ])

  const recentRecommendations = await CropRecommendation.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('farmId')

  const recentSms = await SmsLog.find().sort({ createdAt: -1 }).limit(10).populate('farmerId')

  response.json({
    metrics: {
      farmers,
      farms,
      recommendations,
      diseaseReports,
      chatSessions,
      smsLogs,
    },
    recentRecommendations,
    recentSms,
  })
}

export async function sendRegionalAlert(request, response) {
  const { region, category, priority, title, message } = request.body
  const result = await sendNotification({
    region,
    category,
    priority,
    title,
    message,
  })
  response.json(result)
}

import { ChatSession } from '../models/ChatSession.js'
import { CropRecommendation } from '../models/CropRecommendation.js'
import { DiseaseReport } from '../models/DiseaseReport.js'
import { Farm } from '../models/Farm.js'
import { Farmer } from '../models/Farmer.js'
import { SmsLog } from '../models/SmsLog.js'
import { sendNotification } from '../services/notificationService.js'
import Groq from 'groq-sdk'
import { env } from '../config/env.js'

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

export async function enhanceAdvisory(request, response) {
  const { text } = request.body
  
  if (!env.groqApiKey) {
    return response.json({ enhancedText: text })
  }

  const groq = new Groq({ apiKey: env.groqApiKey })
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert agricultural advisor. Your task is to take a raw message from an admin and rewrite it to be professional, clear, and highly actionable for farmers. Keep the tone empathetic but authoritative. Do not change the core meaning or instructions.',
      },
      {
        role: 'user',
        content: `Enhance this agricultural broadcast message: "${text}"`,
      },
    ],
    model: env.groqModel || 'llama-3.3-70b-versatile',
  })

  response.json({
    enhancedText: completion.choices[0].message.content,
  })
}

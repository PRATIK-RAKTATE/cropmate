import { Farm } from '../models/Farm.js'
import { Farmer } from '../models/Farmer.js'
import { getWeather } from './weatherService.js'
import { sendNotification } from './notificationService.js'
import { getMarketPrices } from './marketService.js'
import { getAgriNews } from './newsService.js'
import Groq from 'groq-sdk'
import { env } from '../config/env.js'
import { Alert } from '../models/Alert.js'

/**
 * Periodically check weather and other conditions to trigger automated alerts.
 */
export async function runAlertEngine() {
  const farms = await Farm.find().populate('farmerId')
  
  // Cache news and market data per district to avoid redundant API calls
  const districtData = {}

  for (const farm of farms) {
    try {
      if (!farm.farmerId) {
        console.warn(`Skipping farm ${farm._id} because it has no associated farmer.`)
        continue
      }
      const dist = farm.location.district
      if (!districtData[dist]) {
        const [news, market] = await Promise.all([
          getAgriNews(`agriculture ${farm.location.state} ${dist}`),
          getMarketPrices(dist, farm.location.state)
        ])
        districtData[dist] = { news, market }
      }

      await checkFarmAlerts(farm, districtData[dist].news, districtData[dist].market)
    } catch (error) {
      console.error(`Alert engine failed for farm ${farm._id}:`, error)
    }
  }
}

async function checkFarmAlerts(farm, newsItems, marketPrices) {
  const weather = await getWeather({
    lat: farm.location.lat,
    lng: farm.location.lng,
    district: farm.location.district,
  })

  const rules = []

  // Add Market Price Update (Only if current crop matches or fallback)
  const currentCrop = (farm.previousCrop || '').toLowerCase()
  const relevantMarket = marketPrices.find(m => m.crop.toLowerCase() === currentCrop) || marketPrices[0]
  if (relevantMarket) {
    rules.push({
      category: 'market',
      priority: 'low',
      title: `${relevantMarket.crop} Price Update: ${relevantMarket.market}`,
      message: `Current market price: ₹${relevantMarket.price}/${relevantMarket.unit} as of ${relevantMarket.arrivalDate}.`
    })
  }

  // Add Latest News (Top item only)
  if (newsItems.length > 0) {
    rules.push({
      category: 'news',
      priority: 'low',
      title: newsItems[0].title,
      message: newsItems[0].description
    })
  }

  // Rule: Heavy Rainfall
  if (weather.forecast.rainfallTotal > 50) {
    rules.push({
      category: 'weather',
      priority: 'high',
      title: 'Heavy Rainfall Warning',
      message: `Expected ${weather.forecast.rainfallTotal}mm rainfall over next 7 days. Ensure proper drainage in your ${farm.previousCrop || 'fields'}.`,
    })
  }

  // Rule: Heatwave
  if (weather.forecast.temperatureMax > 40) {
    rules.push({
      category: 'weather',
      priority: 'medium',
      title: 'Heatwave Alert',
      message: `Temperatures reaching ${weather.forecast.temperatureMax}°C. Increase irrigation frequency to prevent crop wilting.`,
    })
  }

  // Rule: Humidity (Pest risk)
  if (weather.current.humidity > 85) {
    rules.push({
      category: 'advisory',
      priority: 'medium',
      title: 'Pest Risk: High Humidity',
      message: `Humidity is at ${weather.current.humidity}%. This increases the risk of fungal diseases. Monitor leaves closely.`,
    })
  }

  // AI-based complex rules using Groq
  if (env.groqApiKey) {
    const aiAlert = await getAiAdvisory(farm, weather)
    if (aiAlert && aiAlert.priority !== 'low') {
      rules.push(aiAlert)
    }
  }

  for (const rule of rules) {
    // Check for duplicates in last 24h to avoid spamming the same news/price
    const existing = await Alert.findOne({
      farmerId: farm.farmerId._id,
      title: rule.title,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })

    if (!existing) {
      await sendNotification({
        farmerId: farm.farmerId._id,
        ...rule,
      })
    }
  }
}

async function getAiAdvisory(farm, weather) {
  try {
    const groq = new Groq({ apiKey: env.groqApiKey })
    const prompt = `
      As an AI agronomist, analyze these conditions and suggest IF a specific alert is needed.
      Farm: ${farm.soilType} soil, growing ${farm.previousCrop || 'unknown crop'}.
      Weather: ${weather.current.temperature}°C, ${weather.current.humidity}% humidity.
      
      If there is a significant risk, return a JSON object with:
      "priority": "high" | "medium" | "low",
      "category": "advisory" | "weather",
      "title": "Short title",
      "message": "Specific actionable advice"
      
      If no significant risk, return {"priority": "low"}.
    `

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: env.groqModel || 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    })

    return JSON.parse(completion.choices[0].message.content)
  } catch (error) {
    return null
  }
}

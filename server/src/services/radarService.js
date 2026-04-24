import { CropRecommendation } from '../models/CropRecommendation.js'
import { DiseaseReport } from '../models/DiseaseReport.js'
import { Farm } from '../models/Farm.js'
import { RadarAlert } from '../models/RadarAlert.js'
import { diseaseKnowledge } from '../seed/diseaseKnowledge.js'
import { getWeather } from './weatherService.js'
import { haversineDistanceKm } from '../utils/math.js'

function buildWeatherSignals(weather) {
  const signals = []

  if (weather.forecast.rainfallTotal >= 60) {
    signals.push(`${weather.forecast.rainfallTotal} mm rainfall expected in 7 days`)
  }

  if (weather.current.humidity >= 75) {
    signals.push(`${weather.current.humidity}% humidity raises leaf wetness risk`)
  }

  return signals
}

function getCropAlertProfile(crop) {
  const normalized = crop.toLowerCase()

  if (normalized === 'tomato') {
    return diseaseKnowledge.tomato['Early Blight']
  }

  if (normalized === 'potato') {
    return diseaseKnowledge.potato['Late Blight']
  }

  if (normalized === 'soybean') {
    return diseaseKnowledge.soybean['Yellow Mosaic']
  }

  return {
    radarActions: [
      'Inspect leaves daily for unusual spots or curling.',
      'Delay unnecessary irrigation before forecast rain.',
      'Keep field notes for any fast-spreading symptoms.',
    ],
  }
}

export async function generateRadarAlert(farmId) {
  const farm = await Farm.findById(farmId)

  if (!farm) {
    throw new Error('Farm not found')
  }

  const latestRecommendation = await CropRecommendation.findOne({ farmId }).sort({
    createdAt: -1,
  })

  const crop = latestRecommendation?.recommendations?.[0]?.crop || farm.previousCrop || 'Crop'
  const weather = await getWeather({
    lat: farm.location.lat,
    lng: farm.location.lng,
    district: farm.location.district,
  })

  const allReports = await DiseaseReport.find({
    createdAt: {
      $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    },
  }).populate('farmId')

  const nearbyReports = allReports.filter((report) => {
    const reportFarm = report.farmId

    if (!reportFarm?.location) {
      return false
    }

    return (
      haversineDistanceKm(
        farm.location.lat,
        farm.location.lng,
        reportFarm.location.lat,
        reportFarm.location.lng,
      ) <= 80
    )
  })

  const cropReports = nearbyReports.filter(
    (report) => report.crop.toLowerCase() === crop.toLowerCase(),
  )

  const weatherSignals = buildWeatherSignals(weather)
  const proximitySignals = cropReports.length
    ? [`${cropReports.length} nearby ${crop} disease scans in the last 14 days`]
    : []

  const riskScore =
    (weather.forecast.rainfallTotal >= 60 ? 1 : 0) +
    (weather.current.humidity >= 75 ? 1 : 0) +
    (cropReports.length >= 2 ? 1 : 0)

  const riskLevel = riskScore >= 3 ? 'high' : riskScore === 2 ? 'medium' : 'low'
  const profile = getCropAlertProfile(crop)
  const source = weather.fallbackUsed ? 'weather-fallback' : 'open-meteo'

  const alert = {
    farmId,
    crop,
    title: `Village Risk Radar: ${crop} watch for the next 7 days`,
    riskLevel,
    windowDays: 7,
    reason:
      cropReports.length > 0
        ? `${crop} risk is elevated due to current humidity, rainfall outlook, and nearby disease activity.`
        : `${crop} risk is based on weather-linked crop stress signals in your area.`,
    recommendedActions: profile.radarActions,
    supportingSignals:
      [...weatherSignals, ...proximitySignals].length > 0
        ? [...weatherSignals, ...proximitySignals]
        : [`Monitoring ${crop} under current 7-day weather conditions`],
    source,
  }

  const saved = await RadarAlert.findOneAndUpdate(
    { farmId },
    { ...alert },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  return {
    ...saved.toObject(),
    weather,
  }
}

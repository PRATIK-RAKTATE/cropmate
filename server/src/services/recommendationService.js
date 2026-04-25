import { cropProfiles } from '../seed/cropProfiles.js'
import { clamp, normalizeScore } from '../utils/math.js'

function rangeScore(value, [min, max], buffer = 8) {
  if (value >= min && value <= max) {
    return 95
  }

  const distance = value < min ? min - value : value - max
  return clamp(95 - distance * buffer)
}

function listScore(value, validList) {
  return validList.includes(value) ? 95 : 52
}

function waterScore(profileWaterNeed, waterAvailability) {
  const map = { low: 35, medium: 65, high: 90 }
  const needMap = { low: 45, medium: 65, high: 90 }
  const delta = Math.abs(map[waterAvailability] - needMap[profileWaterNeed])
  return clamp(100 - delta)
}

function npkScore(soil, preferredNpk) {
  const nitrogen = clamp(100 - Math.abs(soil.nitrogen - preferredNpk.n))
  const phosphorus = clamp(100 - Math.abs(soil.phosphorus - preferredNpk.p))
  const potassium = clamp(100 - Math.abs(soil.potassium - preferredNpk.k))
  return Math.round((nitrogen + phosphorus + potassium) / 3)
}

function computeRiskLevel(totalScore, weatherScoreValue) {
  if (totalScore >= 80 && weatherScoreValue >= 75) {
    return 'low'
  }

  if (totalScore >= 65) {
    return 'medium'
  }

  return 'high'
}

function buildReason(profile, input, scoreBreakdown, weather, language = 'en') {
  const t = {
    en: {
      season: `${profile.crop} fits the ${input.season} season`,
      soil: `${input.farm.soilType.replace('_', ' ')} and pH ${input.soil.ph} are workable for this crop`,
      weather: `${weather.forecast.rainfallTotal} mm forecast rainfall supports its water needs`,
      rotation: (prev) => `it also fits after ${prev}`,
      summary: (soil, weather, water) => `Soil ${soil}/100, weather ${weather}/100, water ${water}/100.`,
    },
    hi: {
      season: `${profile.crop} ${input.season} सीजन के लिए उपयुक्त है`,
      soil: `${input.farm.soilType.replace('_', ' ')} और pH ${input.soil.ph} इस फसल के लिए सही हैं`,
      weather: `${weather.forecast.rainfallTotal} मिमी अनुमानित वर्षा इसकी पानी की जरूरतों को पूरा करती है`,
      rotation: (prev) => `यह ${prev} के बाद भी उपयुक्त है`,
      summary: (soil, weather, water) => `मिट्टी ${soil}/100, मौसम ${weather}/100, पानी ${water}/100.`,
    },
    mr: {
      season: `${profile.crop} ${input.season} हंगामासाठी योग्य आहे`,
      soil: `${input.farm.soilType.replace('_', ' ')} आणि pH ${input.soil.ph} या पिकासाठी काम करण्यायोग्य आहेत`,
      weather: `${weather.forecast.rainfallTotal} मिमी अंदाज वर्तवलेला पाऊस त्याच्या पाण्याची गरज पूर्ण करतो`,
      rotation: (prev) => `हे ${prev} नंतर देखील योग्य आहे`,
      summary: (soil, weather, water) => `माती ${soil}/100, हवामान ${weather}/100, पाणी ${water}/100.`,
    },
  }

  const lang = t[language] || t.en

  const reasons = [
    lang.season,
    lang.soil,
    lang.weather,
  ]

  if (profile.rotationBonus.includes(input.farm.previousCrop.toLowerCase())) {
    reasons.push(lang.rotation(input.farm.previousCrop))
  }

  return `${reasons.join('. ')}. ${lang.summary(scoreBreakdown.soil, scoreBreakdown.weather, scoreBreakdown.water)}`
}

export function rankCrops({ farm, soil, weather, season, language = 'en' }) {
  const weatherSummary = {
    temperature: weather.current.temperature,
    humidity: weather.current.humidity,
    rainfall: weather.forecast.rainfallTotal,
  }

  const ranked = cropProfiles
    .map((profile) => {
      const seasonScore = profile.seasons.includes(season) ? 100 : 45
      const soilTypeScore = listScore(farm.soilType, profile.soilTypes)
      const phScore = rangeScore(soil.ph, profile.phRange, 18)
      const nutritionScore = npkScore(soil, profile.preferredNpk)
      const soilScore = Math.round(
        seasonScore * 0.2 + soilTypeScore * 0.35 + phScore * 0.25 + nutritionScore * 0.2,
      )

      const temperatureScore = rangeScore(weatherSummary.temperature, profile.tempRange, 10)
      const humidityScore = rangeScore(weatherSummary.humidity, profile.humidityRange, 3)
      const rainfallScore = rangeScore(weatherSummary.rainfall, profile.rainfallRange, 0.7)
      const weatherScoreValue = Math.round(
        temperatureScore * 0.35 + humidityScore * 0.25 + rainfallScore * 0.4,
      )

      const waterScoreValue = waterScore(profile.waterNeed, farm.waterAvailability)
      const profitability = profile.profitabilityScore
      const sustainability = profile.sustainabilityScore

      const finalScore =
        soilScore * 0.4 +
        weatherScoreValue * 0.25 +
        waterScoreValue * 0.15 +
        profitability * 0.1 +
        sustainability * 0.1

      const scoreBreakdown = {
        soil: normalizeScore(soilScore),
        weather: normalizeScore(weatherScoreValue),
        water: normalizeScore(waterScoreValue),
      }

      return {
        crop: profile.crop,
        suitabilityScore: normalizeScore(finalScore),
        profitabilityScore: profitability,
        sustainabilityScore: sustainability,
        riskLevel: computeRiskLevel(finalScore, weatherScoreValue),
        durationDays: profile.durationDays,
        waterNeed: profile.waterNeed,
        reason: buildReason(profile, { farm, soil, season }, scoreBreakdown, weather, language),
        nextSteps: profile.actions,
        scoreBreakdown,
      }
    })
    .sort((left, right) => right.suitabilityScore - left.suitabilityScore)

  return ranked.slice(0, 3)
}

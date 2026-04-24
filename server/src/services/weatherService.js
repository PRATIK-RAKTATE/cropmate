import { env } from '../config/env.js'
import { fallbackWeatherByDistrict } from '../seed/demoData.js'

function summarizeWeather(payload) {
  const current = payload.current || {}
  const daily = payload.daily || {}

  const rainfallTotal = Array.isArray(daily.precipitation_sum)
    ? daily.precipitation_sum.reduce((total, value) => total + value, 0)
    : 0

  const humidityAverage = current.relative_humidity_2m || 70

  return {
    current: {
      temperature: Math.round(current.temperature_2m || 28),
      humidity: Math.round(current.relative_humidity_2m || 70),
      rainfall: Math.round(current.precipitation || 0),
      windSpeed: Math.round(current.wind_speed_10m || 10),
    },
    forecast: {
      rainfallTotal: Math.round(rainfallTotal),
      temperatureMax: Math.round(Math.max(...(daily.temperature_2m_max || [32]))),
      temperatureMin: Math.round(Math.min(...(daily.temperature_2m_min || [22]))),
      humidityAverage,
      windowDays: Array.isArray(daily.time) ? daily.time.length : 7,
    },
  }
}

export async function getWeather({ lat, lng, district }) {
  try {
    const query = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
      forecast_days: '7',
      timezone: 'auto',
    })

    const response = await fetch(`${env.openMeteoBaseUrl}?${query.toString()}`)

    if (!response.ok) {
      throw new Error('Weather provider request failed')
    }

    const data = await response.json()

    return {
      source: 'open-meteo',
      fallbackUsed: false,
      ...summarizeWeather(data),
    }
  } catch (_error) {
    const fallback = fallbackWeatherByDistrict[district] || fallbackWeatherByDistrict.Nashik

    return {
      source: 'fallback-seed',
      fallbackUsed: true,
      ...fallback,
    }
  }
}

import dotenv from 'dotenv'

dotenv.config()

const fallbackClientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const clientOrigins = (process.env.CLIENT_ORIGINS || fallbackClientOrigin)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  clientOrigin: fallbackClientOrigin,
  clientOrigins,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cropmate',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  plantIdApiKey: process.env.PLANT_ID_API_KEY || '',
  openMeteoBaseUrl:
    process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1/forecast',
  seedOnStart: (process.env.SEED_ON_START || 'false').toLowerCase() === 'true',
}

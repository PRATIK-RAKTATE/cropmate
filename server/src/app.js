import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/requestLogger.js'
import { apiRouter } from './routes/index.js'

export const app = express()
const uploadsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../uploads',
)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`CORS blocked for origin: ${origin}`))
    },
  }),
)
app.use(requestLogger)
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(uploadsDirectory))
app.use('/api', apiRouter)

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use(errorHandler)

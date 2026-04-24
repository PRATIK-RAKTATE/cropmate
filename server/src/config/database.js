import mongoose from 'mongoose'
import { logger } from '../utils/logger.js'

let listenersAttached = false

function attachConnectionListeners() {
  if (listenersAttached) {
    return
  }

  listenersAttached = true

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected', {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    })
  })

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', {
      message: error.message,
    })
  })

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected')
  })
}

export async function connectDatabase(uri) {
  attachConnectionListeners()
  logger.info('Connecting to MongoDB')
  await mongoose.connect(uri)
}

export async function disconnectDatabase() {
  logger.info('Disconnecting from MongoDB')
  await mongoose.disconnect()
}

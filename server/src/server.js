import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { app } from './app.js'
import { seedDemoData } from './services/seedService.js'
import { logger } from './utils/logger.js'
import { runAlertEngine } from './services/alertEngine.js'

async function start() {
  logger.info('Starting CropMate API', {
    port: env.port,
    seedOnStart: env.seedOnStart,
  })

  await connectDatabase(env.mongoUri)

  if (env.seedOnStart) {
    logger.info('Seeding demo data on startup')
    await seedDemoData()
  }

  // Start automated alert engine
  logger.info('Starting automated alert engine')
  runAlertEngine() // Initial run
  setInterval(runAlertEngine, 1000 * 60 * 60 * 4) // Run every 4 hours

  app.listen(env.port, () => {
    logger.info('CropMate API listening', {
      port: env.port,
    })
  })
}

start().catch((error) => {
  logger.error('Failed to start CropMate API', {
    message: error.message,
    stack: error.stack,
  })
  process.exit(1)
})

import mongoose from 'mongoose'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { seedDemoData } from '../services/seedService.js'
import { generateRadarAlert } from '../services/radarService.js'

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await connectDatabase(mongoServer.getUri())
  await seedDemoData()
})

afterAll(async () => {
  await disconnectDatabase()
  await mongoServer.stop()
})

describe('generateRadarAlert', () => {
  it('creates an alert with actionable signals', async () => {
    const farm = await mongoose.model('Farm').findOne({ name: 'Main Farm' })
    const alert = await generateRadarAlert(farm._id)

    expect(alert.title).toContain('Village Risk Radar')
    expect(alert.supportingSignals.length).toBeGreaterThan(0)
  })
})

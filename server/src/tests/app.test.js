import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { app } from '../app.js'
import { Farmer } from '../models/Farmer.js'
import { seedDemoData } from '../services/seedService.js'

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

describe('CropMate API', () => {
  it('returns seeded farmers for demo login', async () => {
    const farmer = await Farmer.findOne({ mobile: '9999999991' })

    const response = await request(app)
      .post('/api/auth/demo-login')
      .send({ farmerId: farmer._id.toString() })

    expect(response.status).toBe(200)
    expect(response.body.farmer.name).toBe('Ramesh Patil')
  })

  it('creates crop recommendations', async () => {
    const farmer = await Farmer.findOne({ mobile: '9999999991' })

    const login = await request(app)
      .post('/api/auth/demo-login')
      .send({ farmerId: farmer._id.toString() })

    const response = await request(app).post('/api/recommendations/crop').send({
      farmId: login.body.defaultFarm._id,
      season: 'kharif',
      budget: 'medium',
      soil: {
        nitrogen: 70,
        phosphorus: 45,
        potassium: 40,
        ph: 6.8,
        moisture: 34,
        organicCarbon: 0.7,
        source: 'manual_input',
      },
    })

    expect(response.status).toBe(201)
    expect(response.body.recommendations[0].crop).toBeTruthy()
  })
})

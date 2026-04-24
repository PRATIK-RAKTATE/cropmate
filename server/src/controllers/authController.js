import { Farm } from '../models/Farm.js'
import { Farmer } from '../models/Farmer.js'
import { demoLoginSchema, loginSchema, registerSchema } from '../schemas/authSchema.js'
import { validate } from '../middleware/validate.js'
import { createHttpError } from '../utils/httpError.js'

export async function demoLogin(request, response) {
  const payload = validate(demoLoginSchema, request.body)
  const farmer = await Farmer.findById(payload.farmerId)

  if (!farmer) {
    throw createHttpError(404, 'Farmer not found')
  }

  const defaultFarm = await Farm.findOne({ farmerId: farmer._id }).sort({ createdAt: 1 })

  response.json({
    farmer,
    defaultFarm,
  })
}

export async function register(request, response) {
  const payload = validate(registerSchema, request.body)

  const existingFarmer = await Farmer.findOne({ mobile: payload.mobile })
  if (existingFarmer) {
    throw createHttpError(400, 'Mobile number already registered')
  }

  const farmer = await Farmer.create(payload)

  // Create a default farm for the new farmer
  const farm = await Farm.create({
    farmerId: farmer._id,
    name: 'Main Farm',
    location: {
      village: farmer.village,
      district: farmer.district,
      state: farmer.state,
      lat: 19.9975, // Default to Nashik coordinates
      lng: 73.7898,
    },
    farmSizeAcres: 1,
    soilType: 'black_soil',
    irrigationSource: 'well',
    waterAvailability: 'medium',
    previousCrop: 'none',
    currentSeason: 'kharif',
    budget: 'medium',
    farmingType: 'conventional',
  })

  response.status(201).json({
    farmer,
    defaultFarm: farm,
  })
}

export async function login(request, response) {
  const payload = validate(loginSchema, request.body)

  const farmer = await Farmer.findOne({ mobile: payload.mobile })
  if (!farmer || !(await farmer.comparePassword(payload.password))) {
    throw createHttpError(401, 'Invalid mobile number or password')
  }

  const defaultFarm = await Farm.findOne({ farmerId: farmer._id }).sort({ createdAt: 1 })

  response.json({
    farmer,
    defaultFarm,
  })
}

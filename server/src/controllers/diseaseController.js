import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from '../config/env.js'
import { detectDisease } from '../services/diseaseService.js'
import { createHttpError } from '../utils/httpError.js'

const uploadsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../uploads',
)

const storage = multer.diskStorage({
  destination: uploadsDirectory,
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname) || '.jpg'
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`)
  },
})

export const uploadDiseaseImage = multer({ storage })

export async function uploadDiseaseScan(request, response) {
  const { farmId, crop, farmerId } = request.body

  if (!farmId || !crop || !farmerId) {
    throw createHttpError(400, 'farmId, farmerId, and crop are required')
  }

  const report = await detectDisease({
    plantIdApiKey: env.plantIdApiKey,
    farmerId,
    farmId,
    crop,
    file: request.file,
  })

  response.status(201).json(report)
}

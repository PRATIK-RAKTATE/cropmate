import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { DiseaseReport } from '../models/DiseaseReport.js'
import { Farm } from '../models/Farm.js'
import { diseaseKnowledge } from '../seed/diseaseKnowledge.js'
import { createHttpError } from '../utils/httpError.js'

function normalizePlantIdResult(result, crop) {
  const diseaseName = result.name || 'Unknown issue'
  const knowledge =
    diseaseKnowledge[crop]?.[diseaseName] || {
      severity: 'medium',
      cause: 'Provider identified a likely issue, but no curated note is available.',
      immediateAction: ['Inspect the field and confirm with a local expert if spread continues.'],
      organicTreatment: [],
      chemicalTreatment: ['Use only locally approved products after expert confirmation.'],
      preventionTips: ['Track symptom spread for the next 48 hours.'],
    }

  return {
    disease: diseaseName,
    confidence: Math.round((result.probability || 0.7) * 100),
    severity: knowledge.severity,
    cause: knowledge.cause,
    immediateAction: knowledge.immediateAction,
    organicTreatment: knowledge.organicTreatment,
    chemicalTreatment: knowledge.chemicalTreatment,
    preventionTips: knowledge.preventionTips,
    rawSignals: result.similar_images
      ? [`${result.similar_images.length} similar provider matches`]
      : ['provider classification'],
  }
}

export async function detectDisease({
  plantIdApiKey,
  farmerId,
  farmId,
  crop,
  file,
}) {
  if (!file) {
    throw createHttpError(400, 'Image is required')
  }

  const farm = await Farm.findById(farmId)

  if (!farm) {
    throw createHttpError(404, 'Farm not found')
  }

  if (!plantIdApiKey) {
    throw createHttpError(
      503,
      'Disease analysis provider is not configured. Add PLANT_ID_API_KEY to enable leaf analysis.',
    )
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`
  const uploadsDir = path.resolve(process.cwd(), 'uploads')
  const finalPath = path.join(uploadsDir, filename)

  // Ensure uploads directory exists
  try {
    await fs.access(uploadsDir)
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true })
  }

  const optimizedBuffer = await sharp(file.buffer)
    .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer()

  await fs.writeFile(finalPath, optimizedBuffer)

  const base64Image = optimizedBuffer.toString('base64')

  const response = await fetch('https://api.plant.id/v2/health_assessment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': plantIdApiKey,
    },
    body: JSON.stringify({
      images: [base64Image],
      latitude: farm.location.lat,
      longitude: farm.location.lng,
      similar_images: true,
      disease_details: ['cause', 'common_names', 'description', 'treatment'],
    }),
  })

  if (!response.ok) {
    throw createHttpError(503, 'Disease provider request failed')
  }

  const data = await response.json()
  const suggestion = data.health_assessment?.diseases?.[0]

  if (!suggestion) {
    throw createHttpError(
      422,
      'The provider could not confidently identify a disease from this image.',
    )
  }

  const normalized = normalizePlantIdResult(suggestion, crop.toLowerCase())

  const report = await DiseaseReport.create({
    farmerId,
    farmId,
    crop: crop.toLowerCase(),
    imageUrl: `/uploads/${filename}`,
    provider: 'plant.id',
    fallbackUsed: false,
    ...normalized,
  })

  return report
}

import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import Groq from 'groq-sdk'
import { DiseaseReport } from '../models/DiseaseReport.js'
import { Farm } from '../models/Farm.js'
import { diseaseKnowledge } from '../seed/diseaseKnowledge.js'
import { createHttpError } from '../utils/httpError.js'

async function enrichDiseaseReportWithGroq({
  groqApiKey,
  groqModel,
  crop,
  disease,
  initialData,
}) {
  if (!groqApiKey) return initialData

  try {
    const groq = new Groq({ apiKey: groqApiKey })
    const prompt = `
      You are an expert agricultural AI assistant. 
      A farmer's crop (${crop}) has been identified with the disease/issue: "${disease}".
      
      Initial raw data:
      - Cause: ${initialData.cause}
      - Actions: ${initialData.immediateAction.join(', ')}
      
      Please provide a more detailed and farmer-friendly response in English.
      Format the response as a JSON object with the following fields:
      1. "explanation": A simple, empathetic explanation of what the disease is, in "plain words" that a farmer can easily understand.
      2. "cause": A detailed but clear explanation of why this happened (environmental factors, soil, etc.).
      3. "immediateAction": A list of 3-5 specific, actionable steps the farmer should take right now.
      4. "organicTreatment": A list of 2-3 highly detailed, organic treatment methods specific to ${crop}. Mention specific natural ingredients or preparations (like Neem oil, buttermilk spray, etc. where appropriate).
      5. "chemicalTreatment": A list of 1-2 specific, crop-oriented chemical treatments with guidance on safe application for ${crop}.
      6. "preventionTips": A list of 2-3 tips to avoid this in the future.

      Return ONLY the JSON object.
    `

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: groqModel || 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    })

    const enriched = JSON.parse(chatCompletion.choices[0].message.content)
    
    return {
      ...initialData,
      explanation: enriched.explanation,
      cause: enriched.cause || initialData.cause,
      immediateAction: enriched.immediateAction || initialData.immediateAction,
      organicTreatment: enriched.organicTreatment || initialData.organicTreatment,
      chemicalTreatment: enriched.chemicalTreatment || initialData.chemicalTreatment,
      preventionTips: enriched.preventionTips || initialData.preventionTips,
    }
  } catch (error) {
    console.error('Groq enrichment failed:', error)
    return initialData
  }
}

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
  groqApiKey,
  groqModel,
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

  let normalized = normalizePlantIdResult(suggestion, crop.toLowerCase())

  // Enrich with Groq
  normalized = await enrichDiseaseReportWithGroq({
    groqApiKey,
    groqModel,
    crop,
    disease: normalized.disease,
    initialData: normalized,
  })

  const report = await DiseaseReport.create({
    farmerId,
    farmId,
    crop: crop.toLowerCase(),
    imageUrl: `/uploads/${filename}`,
    provider: 'plant.id + groq',
    fallbackUsed: false,
    ...normalized,
  })

  return report
}

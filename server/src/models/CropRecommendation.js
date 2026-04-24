import mongoose from 'mongoose'

const cropResultSchema = new mongoose.Schema(
  {
    crop: { type: String, required: true },
    suitabilityScore: { type: Number, required: true },
    profitabilityScore: { type: Number, required: true },
    sustainabilityScore: { type: Number, required: true },
    riskLevel: { type: String, required: true },
    durationDays: { type: Number, required: true },
    waterNeed: { type: String, required: true },
    reason: { type: String, required: true },
    nextSteps: [{ type: String, required: true }],
    scoreBreakdown: {
      soil: Number,
      weather: Number,
      water: Number,
    },
  },
  { _id: false },
)

const cropRecommendationSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    soilReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SoilReport',
      required: true,
    },
    season: { type: String, required: true },
    budget: { type: String, default: 'medium' },
    weatherSource: { type: String, required: true },
    recommendations: [cropResultSchema],
  },
  { timestamps: true },
)

export const CropRecommendation = mongoose.model(
  'CropRecommendation',
  cropRecommendationSchema,
)

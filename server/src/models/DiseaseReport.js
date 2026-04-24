import mongoose from 'mongoose'

const diseaseReportSchema = new mongoose.Schema(
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
    crop: { type: String, required: true },
    imageUrl: { type: String, required: true },
    provider: { type: String, default: 'plant.id' },
    disease: { type: String, required: true },
    confidence: { type: Number, required: true },
    severity: { type: String, required: true },
    immediateAction: [{ type: String, required: true }],
    organicTreatment: [{ type: String, default: [] }],
    chemicalTreatment: [{ type: String, default: [] }],
    preventionTips: [{ type: String, default: [] }],
    cause: { type: String, default: '' },
    rawSignals: [{ type: String, default: [] }],
    fallbackUsed: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const DiseaseReport = mongoose.model('DiseaseReport', diseaseReportSchema)

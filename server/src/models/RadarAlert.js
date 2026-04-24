import mongoose from 'mongoose'

const radarAlertSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    crop: { type: String, required: true },
    title: { type: String, required: true },
    riskLevel: { type: String, required: true },
    windowDays: { type: Number, required: true },
    reason: { type: String, required: true },
    recommendedActions: [{ type: String, required: true }],
    supportingSignals: [{ type: String, required: true }],
    source: { type: String, required: true },
  },
  { timestamps: true },
)

export const RadarAlert = mongoose.model('RadarAlert', radarAlertSchema)

import mongoose from 'mongoose'

const soilReportSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
    },
    nitrogen: { type: Number, required: true },
    phosphorus: { type: Number, required: true },
    potassium: { type: Number, required: true },
    ph: { type: Number, required: true },
    moisture: { type: Number, default: 0 },
    organicCarbon: { type: Number, default: 0.6 },
    source: { type: String, default: 'manual_input' },
  },
  { timestamps: true },
)

export const SoilReport = mongoose.model('SoilReport', soilReportSchema)

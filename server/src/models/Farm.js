import mongoose from 'mongoose'

const farmSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
    },
    name: { type: String, required: true },
    location: {
      village: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    farmSizeAcres: { type: Number, required: true },
    soilType: { type: String, required: true },
    irrigationSource: { type: String, required: true },
    waterAvailability: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    previousCrop: { type: String, required: true },
    currentSeason: { type: String, default: 'kharif' },
    budget: { type: String, default: 'medium' },
    farmingType: { type: String, default: 'conventional' },
  },
  { timestamps: true },
)

export const Farm = mongoose.model('Farm', farmSchema)

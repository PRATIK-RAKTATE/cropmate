import mongoose from 'mongoose'

const farmerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'mr'],
      default: 'en',
    },
    village: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
  },
  { timestamps: true },
)

export const Farmer = mongoose.model('Farmer', farmerSchema)

import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
    },
    // For regional alerts
    region: {
      village: String,
      district: String,
      state: String,
    },
    category: {
      type: String,
      enum: ['weather', 'advisory', 'news', 'government', 'market'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    sentSms: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const Alert = mongoose.model('Alert', alertSchema)

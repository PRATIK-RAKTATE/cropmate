import mongoose from 'mongoose'

const smsLogSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
    },
    mobile: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'] },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'delivered'],
      default: 'pending',
    },
    provider: { type: String },
    providerId: { type: String },
    error: { type: String },
  },
  { timestamps: true },
)

export const SmsLog = mongoose.model('SmsLog', smsLogSchema)

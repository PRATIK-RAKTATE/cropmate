import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { _id: false, timestamps: true },
)

const chatSessionSchema = new mongoose.Schema(
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
    language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
    messages: [messageSchema],
  },
  { timestamps: true },
)

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema)

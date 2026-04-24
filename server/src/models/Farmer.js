import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const farmerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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

farmerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

farmerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export const Farmer = mongoose.model('Farmer', farmerSchema)

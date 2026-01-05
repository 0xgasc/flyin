import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAddon extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  description: string
  price: number
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const addonSchema = new Schema<IAddon>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes
addonSchema.index({ isActive: 1, category: 1 })

const Addon = mongoose.models.Addon as Model<IAddon> || mongoose.model<IAddon>('Addon', addonSchema)

export default Addon

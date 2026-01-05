import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAirport extends Document {
  _id: mongoose.Types.ObjectId
  code: string
  name: string
  city: string
  latitude: number
  longitude: number
  isCustom: boolean
  createdAt: Date
  updatedAt: Date
}

const airportSchema = new Schema<IAirport>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  isCustom: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index for code lookups
airportSchema.index({ code: 1 })
airportSchema.index({ city: 1 })

const Airport = mongoose.models.Airport as Model<IAirport> || mongoose.model<IAirport>('Airport', airportSchema)

export default Airport

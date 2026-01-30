import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPricingTier {
  minPassengers: number
  maxPassengers: number
  price: number
}

export interface IExperience extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  nameEs: string | null
  description: string
  descriptionEs: string | null
  durationHours: number
  durationMinutes: number | null
  basePrice: number
  maxPassengers: number
  minPassengers: number
  includes: string[]
  includesEs: string[] | null
  highlights: string[]
  requirements: string[]
  meetingPoint: string | null
  location: string
  aircraftOptions: any
  routeWaypoints: string[]
  category: string
  categoryNameEn: string | null
  categoryNameEs: string | null
  imageUrl: string | null
  orderIndex: number | null
  pricingTiers: IPricingTier[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const experienceSchema = new Schema<IExperience>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameEs: {
    type: String,
    default: null
  },
  description: {
    type: String,
    required: true
  },
  descriptionEs: {
    type: String,
    default: null
  },
  durationHours: {
    type: Number,
    required: true,
    min: 0
  },
  durationMinutes: {
    type: Number,
    default: null
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  maxPassengers: {
    type: Number,
    default: 4,
    min: 1
  },
  minPassengers: {
    type: Number,
    default: 1,
    min: 1
  },
  includes: {
    type: [String],
    default: []
  },
  includesEs: {
    type: [String],
    default: null
  },
  highlights: {
    type: [String],
    default: []
  },
  requirements: {
    type: [String],
    default: []
  },
  meetingPoint: {
    type: String,
    default: null
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  aircraftOptions: {
    type: Schema.Types.Mixed,
    default: null
  },
  routeWaypoints: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    default: 'helitour'
  },
  categoryNameEn: {
    type: String,
    default: null
  },
  categoryNameEs: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  },
  pricingTiers: {
    type: [{
      minPassengers: { type: Number, required: true, min: 1 },
      maxPassengers: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }
    }],
    default: []
  },
  orderIndex: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for active experiences
experienceSchema.index({ isActive: 1, name: 1 })

const Experience = mongoose.models.Experience as Model<IExperience> || mongoose.model<IExperience>('Experience', experienceSchema)

export default Experience

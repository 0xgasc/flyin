import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDestination extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  description: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  features: string[]
  highlights: string[]
  requirements: string[]
  meetingPoint: string | null
  bestTime: string | null
  difficultyLevel: string | null
  // Airport reference - optional, for destinations with airports
  airportId: mongoose.Types.ObjectId | null
  isHub: boolean // Primary hub location (e.g., Guatemala City)
  metadata: any
  orderIndex: number | null
  isActive: boolean
  contentEditedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const destinationSchema = new Schema<IDestination>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  features: {
    type: [String],
    default: []
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
  bestTime: {
    type: String,
    default: null
  },
  difficultyLevel: {
    type: String,
    default: null
  },
  // Airport reference - optional link to Airport collection
  airportId: {
    type: Schema.Types.ObjectId,
    ref: 'Airport',
    default: null
  },
  // Is this a hub location (like Guatemala City)
  isHub: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: null
  },
  orderIndex: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  contentEditedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Indexes
destinationSchema.index({ isActive: 1, name: 1 })
destinationSchema.index({ orderIndex: 1 })

const Destination = mongoose.models.Destination as Model<IDestination> || mongoose.model<IDestination>('Destination', destinationSchema)

export default Destination

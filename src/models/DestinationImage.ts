import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDestinationImage extends Document {
  _id: mongoose.Types.ObjectId
  destinationId: mongoose.Types.ObjectId
  imageUrl: string
  caption: string | null
  isPrimary: boolean
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

const destinationImageSchema = new Schema<IDestinationImage>({
  destinationId: {
    type: Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: null
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  orderIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes
destinationImageSchema.index({ destinationId: 1, orderIndex: 1 })

const DestinationImage = mongoose.models.DestinationImage as Model<IDestinationImage> || mongoose.model<IDestinationImage>('DestinationImage', destinationImageSchema)

export default DestinationImage

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IExperienceImage extends Document {
  _id: mongoose.Types.ObjectId
  experienceId: mongoose.Types.ObjectId
  imageUrl: string
  caption: string | null
  isPrimary: boolean
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

const experienceImageSchema = new Schema<IExperienceImage>({
  experienceId: {
    type: Schema.Types.ObjectId,
    ref: 'Experience',
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
experienceImageSchema.index({ experienceId: 1, orderIndex: 1 })

const ExperienceImage = mongoose.models.ExperienceImage as Model<IExperienceImage> || mongoose.model<IExperienceImage>('ExperienceImage', experienceImageSchema)

export default ExperienceImage

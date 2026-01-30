import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPilotAircraftCertification extends Document {
  _id: mongoose.Types.ObjectId
  pilotId: mongoose.Types.ObjectId
  helicopterId: mongoose.Types.ObjectId
  certifiedSince: Date
  flightHours: number
  status: 'active' | 'expired' | 'suspended'
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

const pilotAircraftCertificationSchema = new Schema<IPilotAircraftCertification>(
  {
    pilotId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    helicopterId: {
      type: Schema.Types.ObjectId,
      ref: 'Helicopter',
      required: true
    },
    certifiedSince: {
      type: Date,
      required: true,
      default: () => new Date()
    },
    flightHours: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended'],
      default: 'active'
    },
    notes: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
)

// One certification per pilot-helicopter pair
pilotAircraftCertificationSchema.index({ pilotId: 1, helicopterId: 1 }, { unique: true })
pilotAircraftCertificationSchema.index({ pilotId: 1, status: 1 })
pilotAircraftCertificationSchema.index({ helicopterId: 1, status: 1 })

const PilotAircraftCertification = mongoose.models.PilotAircraftCertification as Model<IPilotAircraftCertification> ||
  mongoose.model<IPilotAircraftCertification>('PilotAircraftCertification', pilotAircraftCertificationSchema)

export default PilotAircraftCertification

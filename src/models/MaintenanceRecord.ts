import mongoose, { Document, Schema } from 'mongoose'

export interface IMaintenanceRecord extends Document {
  _id: mongoose.Types.ObjectId
  helicopterId: mongoose.Types.ObjectId
  type: 'routine' | 'repair' | 'inspection' | 'overhaul' | 'upgrade'
  description: string
  startDate: Date
  endDate: Date | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  cost: number
  technician: string | null
  notes: string | null
  partsReplaced: string[]
  nextScheduledMaintenance: Date | null
  createdAt: Date
  updatedAt: Date
}

const MaintenanceRecordSchema = new Schema<IMaintenanceRecord>(
  {
    helicopterId: {
      type: Schema.Types.ObjectId,
      ref: 'Helicopter',
      required: true
    },
    type: {
      type: String,
      enum: ['routine', 'repair', 'inspection', 'overhaul', 'upgrade'],
      required: true
    },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    cost: { type: Number, default: 0 },
    technician: { type: String, default: null },
    notes: { type: String, default: null },
    partsReplaced: [{ type: String }],
    nextScheduledMaintenance: { type: Date, default: null }
  },
  { timestamps: true }
)

// Index for efficient queries
MaintenanceRecordSchema.index({ helicopterId: 1, startDate: -1 })

export default mongoose.models.MaintenanceRecord || mongoose.model<IMaintenanceRecord>('MaintenanceRecord', MaintenanceRecordSchema)

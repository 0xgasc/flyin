import mongoose, { Document, Schema } from 'mongoose'

export interface IHelicopter extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  helicopterModel: string
  manufacturer: string
  yearManufactured: number
  registrationNumber: string
  capacity: number
  hourlyRate: number
  maxRangeKm: number
  cruiseSpeedKmh: number
  fuelCapacityLiters: number
  fuelConsumptionLph: number
  totalFlightHours: number
  lastMaintenanceDate: Date | null
  nextMaintenanceDue: Date | null
  status: 'active' | 'maintenance' | 'grounded' | 'retired'
  location: string
  notes: string | null
  imageUrl: string | null
  insuranceExpiry: Date | null
  createdAt: Date
  updatedAt: Date
}

const HelicopterSchema = new Schema<IHelicopter>(
  {
    name: { type: String, required: true },
    helicopterModel: { type: String, required: true },
    manufacturer: { type: String, required: true },
    yearManufactured: { type: Number, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true, default: 4 },
    hourlyRate: { type: Number, required: true, default: 600 },
    maxRangeKm: { type: Number, required: true, default: 500 },
    cruiseSpeedKmh: { type: Number, required: true, default: 180 },
    fuelCapacityLiters: { type: Number, required: true, default: 200 },
    fuelConsumptionLph: { type: Number, required: true, default: 50 },
    totalFlightHours: { type: Number, default: 0 },
    lastMaintenanceDate: { type: Date, default: null },
    nextMaintenanceDue: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'grounded', 'retired'],
      default: 'active'
    },
    location: { type: String, default: 'Guatemala City Base' },
    notes: { type: String, default: null },
    imageUrl: { type: String, default: null },
    insuranceExpiry: { type: Date, default: null }
  },
  { timestamps: true }
)

export default mongoose.models.Helicopter || mongoose.model<IHelicopter>('Helicopter', HelicopterSchema)

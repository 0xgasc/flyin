import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPassengerDetails {
  name: string
  age: number
  passport: string
  emergencyContact: string
  dietaryRestrictions: string
  specialRequests: string
}

export interface ISelectedAddon {
  addonId: string
  quantity: number
  unitPrice: number
}

export interface IPriceBreakdown {
  distance: number
  flightTime: number
  basePrice: number
  passengerFee: number
  multiplier: number | null
  isRoundTrip: boolean
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId
  clientId: mongoose.Types.ObjectId
  bookingType: 'transport' | 'experience'
  status: 'pending' | 'approved' | 'assigned' | 'accepted' | 'completed' | 'cancelled'
  fromLocation: string | null
  toLocation: string | null
  experienceId: mongoose.Types.ObjectId | null
  destinationId: mongoose.Types.ObjectId | null
  scheduledDate: Date
  scheduledTime: string
  returnDate: Date | null
  returnTime: string | null
  isRoundTrip: boolean
  passengerCount: number
  passengerDetails: IPassengerDetails[]
  selectedAddons: ISelectedAddon[]
  addonTotalPrice: number
  notes: string | null
  totalPrice: number
  priceBreakdown: IPriceBreakdown | null
  paymentStatus: 'pending' | 'processing' | 'paid' | 'refunded'
  pilotId: mongoose.Types.ObjectId | null
  helicopterId: string | null
  adminNotes: string | null
  revisionRequested: boolean
  revisionNotes: string | null
  revisionData: any
  createdAt: Date
  updatedAt: Date
}

const passengerDetailsSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  passport: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  dietaryRestrictions: { type: String, default: '' },
  specialRequests: { type: String, default: '' }
}, { _id: false })

const selectedAddonSchema = new Schema({
  addonId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 }
}, { _id: false })

const bookingSchema = new Schema<IBooking>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    enum: ['transport', 'experience'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'assigned', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  fromLocation: {
    type: String,
    default: null
  },
  toLocation: {
    type: String,
    default: null
  },
  experienceId: {
    type: Schema.Types.ObjectId,
    ref: 'Experience',
    default: null
  },
  destinationId: {
    type: Schema.Types.ObjectId,
    ref: 'Destination',
    default: null
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },
  returnTime: {
    type: String,
    default: null
  },
  isRoundTrip: {
    type: Boolean,
    default: false
  },
  passengerCount: {
    type: Number,
    default: 1,
    min: 1
  },
  passengerDetails: {
    type: [passengerDetailsSchema],
    default: []
  },
  selectedAddons: {
    type: [selectedAddonSchema],
    default: []
  },
  addonTotalPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    default: null
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceBreakdown: {
    type: {
      distance: { type: Number },
      flightTime: { type: Number },
      basePrice: { type: Number },
      passengerFee: { type: Number },
      multiplier: { type: Number, default: null },
      isRoundTrip: { type: Boolean, default: false }
    },
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'refunded'],
    default: 'pending'
  },
  pilotId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  helicopterId: {
    type: String,
    default: null
  },
  adminNotes: {
    type: String,
    default: null
  },
  revisionRequested: {
    type: Boolean,
    default: false
  },
  revisionNotes: {
    type: String,
    default: null
  },
  revisionData: {
    type: Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
})

// Indexes for common queries
bookingSchema.index({ clientId: 1, createdAt: -1 })
bookingSchema.index({ pilotId: 1, scheduledDate: 1 })
bookingSchema.index({ status: 1, scheduledDate: 1 })
bookingSchema.index({ bookingType: 1 })

const Booking = mongoose.models.Booking as Model<IBooking> || mongoose.model<IBooking>('Booking', bookingSchema)

export default Booking

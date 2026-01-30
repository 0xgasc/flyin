import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  bookingId: mongoose.Types.ObjectId | null
  type: 'payment' | 'refund' | 'deposit' | 'withdrawal'
  amount: number
  paymentMethod: 'card' | 'bank' | 'bank_transfer' | 'account_balance' | 'deposit'
  status: 'pending' | 'completed' | 'failed' | 'approved' | 'rejected'
  reference: string | null
  adminNotes: string | null
  processedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'deposit', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank', 'bank_transfer', 'account_balance', 'deposit'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'approved', 'rejected'],
    default: 'pending'
  },
  reference: {
    type: String,
    default: null
  },
  adminNotes: {
    type: String,
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Indexes for common queries
transactionSchema.index({ userId: 1, createdAt: -1 })
transactionSchema.index({ bookingId: 1 })
transactionSchema.index({ status: 1 })

const Transaction = mongoose.models.Transaction as Model<ITransaction> || mongoose.model<ITransaction>('Transaction', transactionSchema)

export default Transaction

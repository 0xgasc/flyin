import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  passwordHash: string
  fullName: string | null
  phone: string | null
  role: 'client' | 'pilot' | 'admin'
  accountBalance: number
  kycVerified: boolean
  adminNotes: string | null
  createdAt: Date
  updatedAt: Date
  setPassword(password: string): Promise<void>
  validatePassword(password: string): Promise<boolean>
  isAdmin(): boolean
  isPilot(): boolean
}

interface IUserMethods {
  setPassword(password: string): Promise<void>
  validatePassword(password: string): Promise<boolean>
  isAdmin(): boolean
  isPilot(): boolean
}

type UserModel = Model<IUser, {}, IUserMethods>

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    default: null,
    trim: true
  },
  phone: {
    type: String,
    default: null,
    trim: true
  },
  role: {
    type: String,
    enum: ['client', 'pilot', 'admin'],
    default: 'client'
  },
  accountBalance: {
    type: Number,
    default: 0
  },
  kycVerified: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Password hashing method
userSchema.methods.setPassword = async function(password: string): Promise<void> {
  const salt = await bcrypt.genSalt(12)
  this.passwordHash = await bcrypt.hash(password, salt)
}

// Password validation method
userSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash)
}

// Role checking methods
userSchema.methods.isAdmin = function(): boolean {
  return this.role === 'admin'
}

userSchema.methods.isPilot = function(): boolean {
  return this.role === 'pilot'
}

// Index for faster queries
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })

// Prevent recompilation in dev mode
const User = mongoose.models.User as UserModel || mongoose.model<IUser, UserModel>('User', userSchema)

export default User

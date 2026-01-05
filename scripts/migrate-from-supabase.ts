import mongoose from 'mongoose'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required')
  process.exit(1)
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase environment variables are required')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Define schemas for MongoDB
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, default: null },
  phone: { type: String, default: null },
  role: { type: String, enum: ['client', 'pilot', 'admin'], default: 'client' },
  accountBalance: { type: Number, default: 0 },
  kycVerified: { type: Boolean, default: false },
  supabaseId: { type: String, unique: true }, // Keep reference to old ID
}, { timestamps: true })

const airportSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  isCustom: { type: Boolean, default: false },
  supabaseId: { type: String },
}, { timestamps: true })

const experienceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  durationHours: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  maxPassengers: { type: Number, default: 4 },
  includes: { type: [String], default: [] },
  location: { type: String, required: true },
  imageUrl: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  supabaseId: { type: String },
}, { timestamps: true })

const bookingSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingType: { type: String, enum: ['transport', 'experience'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'assigned', 'completed', 'cancelled'], default: 'pending' },
  fromLocation: { type: String, default: null },
  toLocation: { type: String, default: null },
  experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', default: null },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  passengerCount: { type: Number, default: 1 },
  notes: { type: String, default: null },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  pilotId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  adminNotes: { type: String, default: null },
  supabaseId: { type: String },
}, { timestamps: true })

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  type: { type: String, enum: ['payment', 'refund', 'deposit', 'withdrawal'], required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'bank', 'bank_transfer', 'account_balance', 'deposit'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'approved', 'rejected'], default: 'pending' },
  reference: { type: String, default: null },
  supabaseId: { type: String },
}, { timestamps: true })

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  features: { type: [String], default: [] },
  highlights: { type: [String], default: [] },
  requirements: { type: [String], default: [] },
  meetingPoint: { type: String, default: null },
  bestTime: { type: String, default: null },
  difficultyLevel: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  orderIndex: { type: Number, default: null },
  isActive: { type: Boolean, default: true },
  supabaseId: { type: String },
}, { timestamps: true })

const experienceImageSchema = new mongoose.Schema({
  experienceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true },
  imageUrl: { type: String, required: true },
  caption: { type: String, default: null },
  isPrimary: { type: Boolean, default: false },
  orderIndex: { type: Number, default: 0 },
  supabaseId: { type: String },
}, { timestamps: true })

const destinationImageSchema = new mongoose.Schema({
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  imageUrl: { type: String, required: true },
  caption: { type: String, default: null },
  isPrimary: { type: Boolean, default: false },
  orderIndex: { type: Number, default: 0 },
  supabaseId: { type: String },
}, { timestamps: true })

// Create models
const User = mongoose.models.User || mongoose.model('User', userSchema)
const Airport = mongoose.models.Airport || mongoose.model('Airport', airportSchema)
const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema)
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)
const Destination = mongoose.models.Destination || mongoose.model('Destination', destinationSchema)
const ExperienceImage = mongoose.models.ExperienceImage || mongoose.model('ExperienceImage', experienceImageSchema)
const DestinationImage = mongoose.models.DestinationImage || mongoose.model('DestinationImage', destinationImageSchema)

// ID mappings (Supabase UUID -> MongoDB ObjectId)
const userIdMap: Map<string, mongoose.Types.ObjectId> = new Map()
const experienceIdMap: Map<string, mongoose.Types.ObjectId> = new Map()
const bookingIdMap: Map<string, mongoose.Types.ObjectId> = new Map()
const destinationIdMap: Map<string, mongoose.Types.ObjectId> = new Map()

// Default password hash for migrated users (they'll need to reset)
// This is bcrypt hash of "MigratedUser123!"
const bcrypt = require('bcryptjs')

async function getDefaultPasswordHash(): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash('MigratedUser123!', salt)
}

async function migrateUsers() {
  console.log('\n📦 Migrating users/profiles...')

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching profiles:', error)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('  No profiles found')
    return
  }

  const defaultHash = await getDefaultPasswordHash()

  for (const profile of profiles) {
    try {
      // Check if already migrated
      const existing = await User.findOne({ supabaseId: profile.id })
      if (existing) {
        userIdMap.set(profile.id, existing._id)
        console.log(`  ⏭️  Skipped (exists): ${profile.email}`)
        continue
      }

      const user = new User({
        email: profile.email?.toLowerCase() || `user_${profile.id}@migrated.local`,
        passwordHash: defaultHash,
        fullName: profile.full_name,
        phone: profile.phone,
        role: profile.role || 'client',
        accountBalance: profile.account_balance || 0,
        kycVerified: profile.kyc_verified || false,
        supabaseId: profile.id,
      })

      await user.save()
      userIdMap.set(profile.id, user._id)
      console.log(`  ✅ Migrated: ${profile.email} (${profile.role})`)
    } catch (err: any) {
      console.error(`  ❌ Failed: ${profile.email} - ${err.message}`)
    }
  }

  console.log(`  📊 Total users migrated: ${userIdMap.size}`)
}

async function migrateAirports() {
  console.log('\n📦 Migrating airports...')

  const { data: airports, error } = await supabase
    .from('airports')
    .select('*')
    .order('code', { ascending: true })

  if (error) {
    console.error('Error fetching airports:', error)
    return
  }

  if (!airports || airports.length === 0) {
    console.log('  No airports found')
    return
  }

  let count = 0
  for (const airport of airports) {
    try {
      const existing = await Airport.findOne({ code: airport.code })
      if (existing) {
        console.log(`  ⏭️  Skipped (exists): ${airport.code}`)
        continue
      }

      await Airport.create({
        code: airport.code,
        name: airport.name,
        city: airport.city,
        latitude: airport.latitude,
        longitude: airport.longitude,
        isCustom: airport.is_custom || false,
        supabaseId: airport.id,
      })
      count++
      console.log(`  ✅ Migrated: ${airport.code} - ${airport.name}`)
    } catch (err: any) {
      console.error(`  ❌ Failed: ${airport.code} - ${err.message}`)
    }
  }

  console.log(`  📊 Total airports migrated: ${count}`)
}

async function migrateExperiences() {
  console.log('\n📦 Migrating experiences...')

  const { data: experiences, error } = await supabase
    .from('experiences')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching experiences:', error)
    return
  }

  if (!experiences || experiences.length === 0) {
    console.log('  No experiences found')
    return
  }

  for (const exp of experiences) {
    try {
      const existing = await Experience.findOne({ supabaseId: exp.id })
      if (existing) {
        experienceIdMap.set(exp.id, existing._id)
        console.log(`  ⏭️  Skipped (exists): ${exp.name}`)
        continue
      }

      const experience = new Experience({
        name: exp.name,
        description: exp.description,
        durationHours: exp.duration_hours,
        basePrice: exp.base_price,
        maxPassengers: exp.max_passengers || 4,
        includes: exp.includes || [],
        location: exp.location,
        imageUrl: exp.image_url,
        isActive: exp.is_active !== false,
        supabaseId: exp.id,
      })

      await experience.save()
      experienceIdMap.set(exp.id, experience._id)
      console.log(`  ✅ Migrated: ${exp.name}`)
    } catch (err: any) {
      console.error(`  ❌ Failed: ${exp.name} - ${err.message}`)
    }
  }

  console.log(`  📊 Total experiences migrated: ${experienceIdMap.size}`)
}

async function migrateBookings() {
  console.log('\n📦 Migrating bookings...')

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching bookings:', error)
    return
  }

  if (!bookings || bookings.length === 0) {
    console.log('  No bookings found')
    return
  }

  for (const b of bookings) {
    try {
      const existing = await Booking.findOne({ supabaseId: b.id })
      if (existing) {
        bookingIdMap.set(b.id, existing._id)
        console.log(`  ⏭️  Skipped (exists): ${b.id}`)
        continue
      }

      // Get MongoDB user ID
      const clientMongoId = userIdMap.get(b.client_id)
      if (!clientMongoId) {
        console.log(`  ⚠️  Skipped (no client): ${b.id}`)
        continue
      }

      // Get experience ID if applicable
      let experienceMongoId = null
      if (b.experience_id) {
        experienceMongoId = experienceIdMap.get(b.experience_id)
      }

      // Get pilot ID if applicable
      let pilotMongoId = null
      if (b.pilot_id) {
        pilotMongoId = userIdMap.get(b.pilot_id)
      }

      const booking = new Booking({
        clientId: clientMongoId,
        bookingType: b.booking_type,
        status: b.status || 'pending',
        fromLocation: b.from_location,
        toLocation: b.to_location,
        experienceId: experienceMongoId,
        scheduledDate: new Date(b.scheduled_date),
        scheduledTime: b.scheduled_time,
        passengerCount: b.passenger_count || 1,
        notes: b.notes,
        totalPrice: b.total_price,
        paymentStatus: b.payment_status || 'pending',
        pilotId: pilotMongoId,
        adminNotes: b.admin_notes,
        supabaseId: b.id,
      })

      await booking.save()
      bookingIdMap.set(b.id, booking._id)
      console.log(`  ✅ Migrated: Booking ${b.id.substring(0, 8)}...`)
    } catch (err: any) {
      console.error(`  ❌ Failed: ${b.id} - ${err.message}`)
    }
  }

  console.log(`  📊 Total bookings migrated: ${bookingIdMap.size}`)
}

async function migrateTransactions() {
  console.log('\n📦 Migrating transactions...')

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching transactions:', error)
    return
  }

  if (!transactions || transactions.length === 0) {
    console.log('  No transactions found')
    return
  }

  let count = 0
  for (const t of transactions) {
    try {
      const existing = await Transaction.findOne({ supabaseId: t.id })
      if (existing) {
        console.log(`  ⏭️  Skipped (exists): ${t.id}`)
        continue
      }

      // Get MongoDB user ID
      const userMongoId = userIdMap.get(t.user_id)
      if (!userMongoId) {
        console.log(`  ⚠️  Skipped (no user): ${t.id}`)
        continue
      }

      // Get booking ID if applicable
      let bookingMongoId = null
      if (t.booking_id) {
        bookingMongoId = bookingIdMap.get(t.booking_id)
      }

      await Transaction.create({
        userId: userMongoId,
        bookingId: bookingMongoId,
        type: t.type,
        amount: t.amount,
        paymentMethod: t.payment_method,
        status: t.status || 'pending',
        reference: t.reference,
        supabaseId: t.id,
      })
      count++
      console.log(`  ✅ Migrated: Transaction ${t.id.substring(0, 8)}...`)
    } catch (err: any) {
      console.error(`  ❌ Failed: ${t.id} - ${err.message}`)
    }
  }

  console.log(`  📊 Total transactions migrated: ${count}`)
}

async function migrateDestinations() {
  console.log('\n📦 Migrating destinations...')

  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching destinations:', error)
    return
  }

  if (!destinations || destinations.length === 0) {
    console.log('  No destinations found')
    return
  }

  for (const dest of destinations) {
    try {
      const existing = await Destination.findOne({ supabaseId: dest.id })
      if (existing) {
        destinationIdMap.set(dest.id, existing._id)
        console.log(`  ⏭️  Skipped (exists): ${dest.name}`)
        continue
      }

      const destination = new Destination({
        name: dest.name,
        description: dest.description,
        location: dest.location,
        coordinates: dest.coordinates || { lat: 14.5891, lng: -90.5515 },
        features: dest.features || [],
        highlights: dest.highlights || [],
        requirements: dest.requirements || [],
        meetingPoint: dest.meeting_point,
        bestTime: dest.best_time,
        difficultyLevel: dest.difficulty_level,
        metadata: dest.metadata,
        orderIndex: dest.order_index,
        isActive: dest.is_active !== false,
        supabaseId: dest.id,
      })

      await destination.save()
      destinationIdMap.set(dest.id, destination._id)
      console.log(`  ✅ Migrated: ${dest.name}`)
    } catch (err: any) {
      console.error(`  ❌ Failed: ${dest.name} - ${err.message}`)
    }
  }

  console.log(`  📊 Total destinations migrated: ${destinationIdMap.size}`)
}

async function migrateExperienceImages() {
  console.log('\n📦 Migrating experience images...')

  const { data: images, error } = await supabase
    .from('experience_images')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching experience images:', error)
    return
  }

  if (!images || images.length === 0) {
    console.log('  No experience images found')
    return
  }

  let count = 0
  for (const img of images) {
    try {
      const existing = await ExperienceImage.findOne({ supabaseId: img.id })
      if (existing) {
        console.log(`  ⏭️  Skipped (exists): ${img.id}`)
        continue
      }

      // Get MongoDB experience ID
      const experienceMongoId = experienceIdMap.get(img.experience_id)
      if (!experienceMongoId) {
        console.log(`  ⚠️  Skipped (no experience): ${img.id}`)
        continue
      }

      await ExperienceImage.create({
        experienceId: experienceMongoId,
        imageUrl: img.image_url,
        caption: img.caption,
        isPrimary: img.is_primary || false,
        orderIndex: img.order_index || 0,
        supabaseId: img.id,
      })
      count++
      console.log(`  ✅ Migrated: Image for experience`)
    } catch (err: any) {
      console.error(`  ❌ Failed: ${img.id} - ${err.message}`)
    }
  }

  console.log(`  📊 Total experience images migrated: ${count}`)
}

async function migrateDestinationImages() {
  console.log('\n📦 Migrating destination images...')

  const { data: images, error } = await supabase
    .from('destination_images')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching destination images:', error)
    return
  }

  if (!images || images.length === 0) {
    console.log('  No destination images found')
    return
  }

  let count = 0
  for (const img of images) {
    try {
      const existing = await DestinationImage.findOne({ supabaseId: img.id })
      if (existing) {
        console.log(`  ⏭️  Skipped (exists): ${img.id}`)
        continue
      }

      // Get MongoDB destination ID
      const destinationMongoId = destinationIdMap.get(img.destination_id)
      if (!destinationMongoId) {
        console.log(`  ⚠️  Skipped (no destination): ${img.id}`)
        continue
      }

      await DestinationImage.create({
        destinationId: destinationMongoId,
        imageUrl: img.image_url,
        caption: img.caption,
        isPrimary: img.is_primary || false,
        orderIndex: img.order_index || 0,
        supabaseId: img.id,
      })
      count++
      console.log(`  ✅ Migrated: Image for destination`)
    } catch (err: any) {
      console.error(`  ❌ Failed: ${img.id} - ${err.message}`)
    }
  }

  console.log(`  📊 Total destination images migrated: ${count}`)
}

async function migrate() {
  console.log('🚀 Starting Supabase to MongoDB Migration')
  console.log('=========================================')

  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI!)
    console.log('✅ Connected to MongoDB')

    // Run migrations in order (respecting foreign key dependencies)
    await migrateUsers()
    await migrateAirports()
    await migrateExperiences()
    await migrateDestinations()
    await migrateExperienceImages()
    await migrateDestinationImages()
    await migrateBookings()
    await migrateTransactions()

    console.log('\n=========================================')
    console.log('🎉 Migration completed!')
    console.log('\n⚠️  IMPORTANT: All migrated users have temporary password:')
    console.log('   Password: MigratedUser123!')
    console.log('   Users should reset their passwords after migration.')
    console.log('\n📊 Summary:')
    console.log(`   Users: ${userIdMap.size}`)
    console.log(`   Experiences: ${experienceIdMap.size}`)
    console.log(`   Destinations: ${destinationIdMap.size}`)
    console.log(`   Bookings: ${bookingIdMap.size}`)

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n📡 Disconnected from MongoDB')
  }
}

migrate()

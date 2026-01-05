import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Import models - need to use require for ts-node compatibility
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required')
  process.exit(1)
}

// Define schemas inline for seed script
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, default: null },
  phone: { type: String, default: null },
  role: { type: String, enum: ['client', 'pilot', 'admin'], default: 'client' },
  accountBalance: { type: Number, default: 0 },
  kycVerified: { type: Boolean, default: false }
}, { timestamps: true })

const airportSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  isCustom: { type: Boolean, default: false }
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
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Airport = mongoose.models.Airport || mongoose.model('Airport', airportSchema)
const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema)

// Seed data
const airports = [
  { code: 'GUA', name: 'La Aurora International Airport', city: 'Guatemala City', latitude: 14.5833, longitude: -90.5275, isCustom: false },
  { code: 'FRS', name: 'Mundo Maya International Airport', city: 'Flores', latitude: 16.9138, longitude: -89.8664, isCustom: false },
  { code: 'AAZ', name: 'Quetzaltenango Airport', city: 'Quetzaltenango', latitude: 14.8656, longitude: -91.5019, isCustom: false },
  { code: 'RER', name: 'Retalhuleu Airport', city: 'Retalhuleu', latitude: 14.5208, longitude: -91.6972, isCustom: false },
  { code: 'CBV', name: 'Coban Airport', city: 'Coban', latitude: 15.4689, longitude: -90.4067, isCustom: false },
  { code: 'ATI', name: 'Lake Atitlan Helipad', city: 'Panajachel', latitude: 14.7394, longitude: -91.1583, isCustom: true },
  { code: 'ANT', name: 'Antigua Helipad', city: 'Antigua Guatemala', latitude: 14.5586, longitude: -90.7295, isCustom: true },
  { code: 'TIK', name: 'Tikal Helipad', city: 'Tikal', latitude: 17.2220, longitude: -89.6237, isCustom: true },
]

const experiences = [
  {
    name: 'Lake Atitlan Scenic Tour',
    description: 'Experience the breathtaking beauty of Lake Atitlan from above. Fly over the volcanic lake surrounded by three majestic volcanoes and traditional Mayan villages.',
    durationHours: 1.5,
    basePrice: 450,
    maxPassengers: 3,
    includes: ['Scenic flight over Lake Atitlan', 'Views of 3 volcanoes', 'Professional pilot guide', 'Photos and video recording'],
    location: 'Lake Atitlan',
    isActive: true
  },
  {
    name: 'Tikal Archaeological Adventure',
    description: 'Fly to the ancient Mayan city of Tikal. Explore the impressive pyramids and temples rising above the jungle canopy.',
    durationHours: 4,
    basePrice: 1200,
    maxPassengers: 4,
    includes: ['Round-trip helicopter flight', 'Guided tour of Tikal', 'Lunch at the site', 'National park entrance fee'],
    location: 'Tikal National Park',
    isActive: true
  },
  {
    name: 'Volcano Discovery Flight',
    description: 'Get up close to Guatemala\'s active volcanoes. See Pacaya, Fuego, and Acatenango from a safe aerial vantage point.',
    durationHours: 2,
    basePrice: 650,
    maxPassengers: 3,
    includes: ['Flight over 3 volcanoes', 'Fuego eruption viewing (if active)', 'Volcanic geology briefing', 'Commemorative certificate'],
    location: 'Volcanic Highlands',
    isActive: true
  },
  {
    name: 'Antigua Colonial Tour',
    description: 'Combine aerial views with ground exploration of the colonial gem of Antigua Guatemala. A UNESCO World Heritage site.',
    durationHours: 3,
    basePrice: 550,
    maxPassengers: 4,
    includes: ['Scenic flight to Antigua', 'Walking tour of colonial center', 'Coffee tasting experience', 'Return flight'],
    location: 'Antigua Guatemala',
    isActive: true
  },
  {
    name: 'Caribbean Coast Expedition',
    description: 'Fly to the Caribbean coast of Guatemala. Visit Rio Dulce and the historic Castillo de San Felipe.',
    durationHours: 5,
    basePrice: 1500,
    maxPassengers: 4,
    includes: ['Cross-country flight', 'Boat tour of Rio Dulce', 'Visit to Castillo de San Felipe', 'Seafood lunch', 'Return flight'],
    location: 'Rio Dulce',
    isActive: true
  },
  {
    name: 'Sunset Flight Experience',
    description: 'Watch the sun set over Guatemala City and the surrounding volcanoes. A romantic and unforgettable experience.',
    durationHours: 1,
    basePrice: 350,
    maxPassengers: 2,
    includes: ['Sunset timing flight', 'Champagne service', 'Photo package', 'Romantic ambiance'],
    location: 'Guatemala City',
    isActive: true
  }
]

async function seed() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI!)
    console.log('Connected to MongoDB')

    // Seed admin user
    console.log('\nSeeding admin user...')
    const existingAdmin = await User.findOne({ email: 'admin@flyinguate.com' })
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash('Admin123!', salt)
      await User.create({
        email: 'admin@flyinguate.com',
        passwordHash,
        fullName: 'System Administrator',
        role: 'admin',
        kycVerified: true
      })
      console.log('Admin user created: admin@flyinguate.com / Admin123!')
    } else {
      console.log('Admin user already exists')
    }

    // Seed airports
    console.log('\nSeeding airports...')
    for (const airport of airports) {
      const existing = await Airport.findOne({ code: airport.code })
      if (!existing) {
        await Airport.create(airport)
        console.log(`  Created: ${airport.code} - ${airport.name}`)
      } else {
        console.log(`  Exists: ${airport.code}`)
      }
    }

    // Seed experiences
    console.log('\nSeeding experiences...')
    for (const experience of experiences) {
      const existing = await Experience.findOne({ name: experience.name })
      if (!existing) {
        await Experience.create(experience)
        console.log(`  Created: ${experience.name}`)
      } else {
        console.log(`  Exists: ${experience.name}`)
      }
    }

    console.log('\nDatabase seeded successfully!')
    console.log('\nAdmin credentials:')
    console.log('  Email: admin@flyinguate.com')
    console.log('  Password: Admin123!')
    console.log('\n⚠️  Change this password immediately in production!')

  } catch (error) {
    console.error('Seed error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

seed()

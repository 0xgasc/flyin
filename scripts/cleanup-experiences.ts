import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) { console.error('MONGODB_URI required'); process.exit(1) }

const experienceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  basePrice: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  pricingTiers: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true, strict: false })

const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema)

// These are seed/placeholder experiences NOT on the website
const TO_DEACTIVATE = [
  'Lake Atitlan Scenic Tour',
  'Tikal Archaeological Adventure',
  'Volcano Discovery Flight',
  'Antigua Colonial Tour',
  'Caribbean Coast Expedition',
  'Sunset Flight Experience',
  'Río Dulce - Todo Incluído'  // duplicate of "Rio Dulce - All Inclusive (Helicopter)"
]

async function cleanup() {
  await mongoose.connect(MONGODB_URI!)
  console.log('Connected\n')

  for (const name of TO_DEACTIVATE) {
    const exp = await Experience.findOne({ name })
    if (exp) {
      await Experience.findByIdAndUpdate(exp._id, { $set: { isActive: false } })
      console.log(`DEACTIVATED: "${name}"`)
    } else {
      console.log(`NOT FOUND: "${name}"`)
    }
  }

  const active = await Experience.find({ isActive: true }).lean()
  console.log(`\nActive experiences: ${active.length}`)
  active.forEach((e: any) => console.log(`  - ${e.name} ($${e.basePrice})`))

  await mongoose.disconnect()
  console.log('\nDone')
}

cleanup()

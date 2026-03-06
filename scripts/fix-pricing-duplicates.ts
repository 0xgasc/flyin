import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required')
  process.exit(1)
}

const experienceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEs: { type: String, default: null },
  description: { type: String, required: true },
  descriptionEs: { type: String, default: null },
  durationHours: { type: Number, required: true, min: 0 },
  durationMinutes: { type: Number, default: null },
  basePrice: { type: Number, required: true, min: 0 },
  maxPassengers: { type: Number, default: 4, min: 1 },
  minPassengers: { type: Number, default: 1, min: 1 },
  includes: { type: [String], default: [] },
  includesEs: { type: [String], default: null },
  highlights: { type: [String], default: [] },
  requirements: { type: [String], default: [] },
  meetingPoint: { type: String, default: null },
  location: { type: String, required: true },
  aircraftOptions: { type: mongoose.Schema.Types.Mixed, default: null },
  routeWaypoints: { type: [String], default: [] },
  category: { type: String, default: 'helitour' },
  categoryNameEn: { type: String, default: null },
  categoryNameEs: { type: String, default: null },
  imageUrl: { type: String, default: null },
  pricingTiers: {
    type: [{
      minPassengers: { type: Number, required: true, min: 1 },
      maxPassengers: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 }
    }],
    default: []
  },
  orderIndex: { type: Number, default: null },
  isActive: { type: Boolean, default: true },
  contentEditedAt: { type: Date, default: null }
}, { timestamps: true })

const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema)

function makeTiers(p12: number, p34: number, p56: number, p7plus: number = 0) {
  return [
    { minPassengers: 1, maxPassengers: 2, price: p12 },
    { minPassengers: 3, maxPassengers: 4, price: p34 },
    { minPassengers: 5, maxPassengers: 6, price: p56 },
    { minPassengers: 7, maxPassengers: 99, price: p7plus }
  ]
}

// Map: OLD DB name (exact) -> correct pricing tiers + metadata
// These are old experiences that were NOT matched by the migration script
// because of accent differences in names
const FIXES: Array<{
  oldName: string
  newDuplicateName: string | null  // name of newly created duplicate to delete
  tiers: { minPassengers: number; maxPassengers: number; price: number }[]
  basePrice: number
  minPassengers: number
  maxPassengers: number
}> = [
  {
    oldName: 'Heli-Tour 45 min Guatemala y Alrededores',
    newDuplicateName: 'Panoramic Overflight - 45 min',
    tiers: makeTiers(875, 1299, 0),
    basePrice: 875,
    minPassengers: 1,
    maxPassengers: 4
  },
  {
    oldName: 'Heli-Tour Extendido 1 Hora',
    newDuplicateName: 'Extended Overflight - 60 min',
    tiers: makeTiers(975, 1499, 1960),
    basePrice: 975,
    minPassengers: 1,
    maxPassengers: 5
  },
  {
    oldName: 'Heli-Tour Romántico',
    newDuplicateName: 'Romantic Heli-Tour',
    tiers: makeTiers(599, 0, 0),
    basePrice: 599,
    minPassengers: 2,
    maxPassengers: 2
  },
  {
    // This was matched to #9 (regular Casa Palopó) but it's actually the romantic package
    // Fix: give it the romantic pricing
    oldName: 'Hotel Casa Palopó Paquete Romántico',
    newDuplicateName: 'Romantic Hotel Casa Palopo',
    tiers: makeTiers(1699, 0, 0),
    basePrice: 1699,
    minPassengers: 2,
    maxPassengers: 2
  },
  {
    oldName: 'Hotel Atitlán, Panajachel',
    newDuplicateName: 'Hotel Atitlan, Panajachel',
    tiers: makeTiers(1199, 1650, 2299),
    basePrice: 1199,
    minPassengers: 1,
    maxPassengers: 5
  },
  {
    oldName: 'Hotel Casa Palopó',
    newDuplicateName: null, // no new duplicate for this one
    tiers: makeTiers(1240, 1799, 2299),
    basePrice: 1240,
    minPassengers: 1,
    maxPassengers: 5
  },
  {
    oldName: 'Experiencia Romántica Hotel Atitlán',
    newDuplicateName: 'Romantic Hotel Atitlan Experience',
    tiers: makeTiers(1599, 0, 0),
    basePrice: 1599,
    minPassengers: 2,
    maxPassengers: 2
  },
  {
    // Rio Dulce had a broken basePrice of $2 - fix it
    oldName: 'Río Dulce - Todo Incluído',
    newDuplicateName: null,
    tiers: makeTiers(2400, 3200, 4375),
    basePrice: 2400,
    minPassengers: 1,
    maxPassengers: 6
  }
]

async function fix() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI!)
    console.log('Connected\n')

    for (const fix of FIXES) {
      // Update the old experience with correct pricing
      const oldExp = await Experience.findOne({ name: fix.oldName })
      if (oldExp) {
        await Experience.findByIdAndUpdate(oldExp._id, {
          $set: {
            pricingTiers: fix.tiers,
            basePrice: fix.basePrice,
            minPassengers: fix.minPassengers,
            maxPassengers: fix.maxPassengers,
            contentEditedAt: new Date()
          }
        })
        console.log(`FIXED: "${fix.oldName}" -> basePrice=$${fix.basePrice}, tiers: 1-2=$${fix.tiers[0].price}, 3-4=$${fix.tiers[1].price}, 5-6=$${fix.tiers[2].price}`)
      } else {
        console.log(`NOT FOUND: "${fix.oldName}"`)
      }

      // Delete the duplicate that was created by the migration
      if (fix.newDuplicateName) {
        const dup = await Experience.findOne({ name: fix.newDuplicateName })
        if (dup) {
          await Experience.findByIdAndDelete(dup._id)
          console.log(`  DELETED duplicate: "${fix.newDuplicateName}"`)
        } else {
          console.log(`  No duplicate found: "${fix.newDuplicateName}"`)
        }
      }
      console.log('')
    }

    // Final verification
    const allExperiences = await Experience.find({ isActive: true }).lean()
    console.log('\n=== FINAL STATE ===')
    console.log(`Total active experiences: ${allExperiences.length}`)
    const with4Tiers = allExperiences.filter((e: any) => e.pricingTiers && e.pricingTiers.length === 4)
    console.log(`With 4 pricing tiers: ${with4Tiers.length}`)

    console.log('\nAll experiences:')
    for (const exp of allExperiences) {
      const e = exp as any
      const tiers = e.pricingTiers || []
      const tierStr = tiers.length === 4
        ? `1-2=$${tiers[0].price}, 3-4=$${tiers[1].price}, 5-6=$${tiers[2].price}, 7+=$${tiers[3].price}`
        : `${tiers.length} tiers`
      console.log(`  "${e.name}" | base=$${e.basePrice} | ${tierStr}`)
    }

  } catch (error) {
    console.error('Fix error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected')
  }
}

fix()

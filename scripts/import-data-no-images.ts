import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import csv from 'csv-parser'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Try service key first, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseKey) {
  console.error('❌ No Supabase key found')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Note: If using anon key, you'll need to be logged in as admin
if (!process.env.SUPABASE_SERVICE_KEY) {
  console.log('⚠️  Using anon key - make sure you are logged in as admin in the browser')
}

// CSV Path
const CSV_PATH = '/Volumes/WORKHORSE GS/vibecoding/flyin/scripts/experiences-data.csv'

interface CSVRow {
  'Nombre': string
  'Categoría': string
  'Sub categoría': string
  'Taxonomía - Servicio': string
  'Taxonomía - Región': string
  'Resumed Info': string
  'Descripción': string
  ' Robinson R66 ( 1-2 Pax)': string
  ' Robinson R66 ( 3-4 Pax)': string
  ' Airbus H125 B3 ( 4-5 Pax)': string
  ' 2 x Robinson R66 ( 6 Pax)': string
  ' Robinson R66 + Airbus H125 B3 ( 8-10 Pax)': string
}

async function parseCSV(): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const results: CSVRow[] = []
    let rowIndex = 0
    
    fs.createReadStream(CSV_PATH)
      .pipe(csv({
        skipLines: 1, // Skip the first empty row
      }))
      .on('data', (data) => {
        rowIndex++
        // Process rows 3-39 (after header which is row 2)
        // csv-parser uses row 2 as headers automatically after skipLines
        if (rowIndex <= 37 && data['Nombre'] && data['Nombre'].trim() !== '') {
          console.log(`Processing row ${rowIndex + 2}: ${data['Nombre']}`)
          results.push(data)
        }
      })
      .on('end', () => {
        console.log(`Total valid rows parsed: ${results.length}`)
        resolve(results)
      })
      .on('error', reject)
  })
}

function parsePrice(priceStr: string): number | null {
  if (!priceStr || priceStr.trim() === '') return null
  // Remove $ and commas, then parse
  const cleaned = priceStr.replace(/[$,]/g, '').trim()
  const price = parseFloat(cleaned)
  return isNaN(price) ? null : price
}

function extractDuration(description: string): number {
  // Try to extract duration from description
  const durationMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:hour|hora|hr|minute|minuto|min)/i)
  if (durationMatch) {
    const value = parseFloat(durationMatch[1])
    const unit = durationMatch[0].toLowerCase()
    if (unit.includes('min')) {
      return value / 60 // Convert minutes to hours
    }
    return value
  }
  return 1 // Default to 1 hour
}

async function importData() {
  console.log('🚀 Starting import process...')
  
  try {
    const rows = await parseCSV()
    console.log(`📊 Found ${rows.length} rows in CSV`)
    
    const experiences: any[] = []
    const destinations: any[] = []
    
    for (const row of rows) {
      const category = row['Categoría']?.toLowerCase()
      
      if (category === 'experiencias') {
        // Parse prices
        const prices = {
          robinson_r66_1_2: parsePrice(row[' Robinson R66 ( 1-2 Pax)']),
          robinson_r66_3_4: parsePrice(row[' Robinson R66 ( 3-4 Pax)']),
          airbus_h125_4_5: parsePrice(row[' Airbus H125 B3 ( 4-5 Pax)']),
          robinson_r66_x2_6: parsePrice(row[' 2 x Robinson R66 ( 6 Pax)']),
          robinson_airbus_8_10: parsePrice(row[' Robinson R66 + Airbus H125 B3 ( 8-10 Pax)'])
        }
        
        // Find the minimum price as base price
        const validPrices = Object.values(prices).filter(p => p !== null) as number[]
        const basePrice = validPrices.length > 0 ? Math.min(...validPrices) : 500
        
        const experience = {
          name: row['Nombre'],
          description: row['Descripción'] || row['Resumed Info'] || '',
          category: 'helitour',
          location: row['Taxonomía - Región'] || 'Guatemala',
          duration_hours: extractDuration(row['Descripción'] || row['Resumed Info'] || ''),
          base_price: basePrice,
          max_passengers: 10,
          is_active: true,
          includes: row['Taxonomía - Servicio'] ? [row['Taxonomía - Servicio']] : [],
          highlights: row['Sub categoría'] ? [row['Sub categoría']] : [],
          requirements: [],
          meeting_point: '',
          metadata: {
            subcategory: row['Sub categoría'],
            service_taxonomy: row['Taxonomía - Servicio'],
            region_taxonomy: row['Taxonomía - Región'],
            resumed_info: row['Resumed Info'],
            pricing: prices
          }
        }
        
        experiences.push(experience)
        console.log(`✅ Prepared experience: ${experience.name}`)
        
      } else if (category === 'destinos') {
        // Parse destination coordinates from description if available
        let latitude = -14.5891 // Default Guatemala coordinates
        let longitude = -90.5515
        
        // Try to extract coordinates from description
        const coordMatch = row['Descripción']?.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
        if (coordMatch) {
          latitude = parseFloat(coordMatch[1])
          longitude = parseFloat(coordMatch[2])
        }
        
        const destination = {
          name: row['Nombre'],
          description: row['Descripción'] || row['Resumed Info'] || '',
          location: row['Taxonomía - Región'] || 'Guatemala',
          coordinates: { lat: latitude, lng: longitude },
          features: row['Sub categoría'] ? [row['Sub categoría']] : [],
          is_active: true,
          metadata: {
            category: row['Sub categoría'] || 'location',
            subcategory: row['Sub categoría'],
            service_taxonomy: row['Taxonomía - Servicio'],
            region_taxonomy: row['Taxonomía - Región'],
            resumed_info: row['Resumed Info'],
            pricing: {
              robinson_r66_1_2: parsePrice(row[' Robinson R66 ( 1-2 Pax)']),
              robinson_r66_3_4: parsePrice(row[' Robinson R66 ( 3-4 Pax)']),
              airbus_h125_4_5: parsePrice(row[' Airbus H125 B3 ( 4-5 Pax)']),
              robinson_r66_x2_6: parsePrice(row[' 2 x Robinson R66 ( 6 Pax)']),
              robinson_airbus_8_10: parsePrice(row[' Robinson R66 + Airbus H125 B3 ( 8-10 Pax)'])
            }
          }
        }
        
        destinations.push(destination)
        console.log(`✅ Prepared destination: ${destination.name}`)
      }
    }
    
    // Import experiences
    if (experiences.length > 0) {
      console.log(`\n📝 Importing ${experiences.length} experiences...`)
      const { data: expData, error: expError } = await supabase
        .from('experiences')
        .insert(experiences)
        .select()
      
      if (expError) {
        console.error('❌ Error importing experiences:', expError)
      } else {
        console.log(`✅ Successfully imported ${expData?.length || 0} experiences`)
      }
    }
    
    // Import destinations
    if (destinations.length > 0) {
      console.log(`\n📝 Importing ${destinations.length} destinations...`)
      const { data: destData, error: destError } = await supabase
        .from('destinations')
        .insert(destinations)
        .select()
      
      if (destError) {
        console.error('❌ Error importing destinations:', destError)
      } else {
        console.log(`✅ Successfully imported ${destData?.length || 0} destinations`)
      }
    }
    
    console.log('\n🎉 Import completed!')
    console.log(`   - Experiences: ${experiences.length}`)
    console.log(`   - Destinations: ${destinations.length}`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the import
importData()
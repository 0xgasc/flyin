import fs from 'fs'
import csv from 'csv-parser'

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
        if (rowIndex <= 37 && data['Nombre'] && data['Nombre'].trim() !== '') {
          results.push(data)
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

function parsePrice(priceStr: string): number | null {
  if (!priceStr || priceStr.trim() === '') return null
  const cleaned = priceStr.replace(/[$,]/g, '').trim()
  const price = parseFloat(cleaned)
  return isNaN(price) ? null : price
}

function extractDuration(description: string): number {
  const durationMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:hour|hora|hr|minute|minuto|min)/i)
  if (durationMatch) {
    const value = parseFloat(durationMatch[1])
    const unit = durationMatch[0].toLowerCase()
    if (unit.includes('min')) {
      return value / 60
    }
    return value
  }
  return 1
}

function escapeString(str: string): string {
  return str.replace(/'/g, "''")
}

async function generateSQL() {
  console.log('🚀 Generating SQL import statements...')
  
  try {
    const rows = await parseCSV()
    console.log(`📊 Found ${rows.length} rows in CSV`)
    
    let experienceSQL = '-- Insert Experiences\n'
    let destinationSQL = '-- Insert Destinations\n'
    
    for (const row of rows) {
      const category = row['Categoría']?.toLowerCase()
      
      if (category === 'experiencias') {
        const prices = {
          robinson_r66_1_2: parsePrice(row[' Robinson R66 ( 1-2 Pax)']),
          robinson_r66_3_4: parsePrice(row[' Robinson R66 ( 3-4 Pax)']),
          airbus_h125_4_5: parsePrice(row[' Airbus H125 B3 ( 4-5 Pax)']),
          robinson_r66_x2_6: parsePrice(row[' 2 x Robinson R66 ( 6 Pax)']),
          robinson_airbus_8_10: parsePrice(row[' Robinson R66 + Airbus H125 B3 ( 8-10 Pax)'])
        }
        
        const validPrices = Object.values(prices).filter(p => p !== null) as number[]
        const basePrice = validPrices.length > 0 ? Math.min(...validPrices) : 500
        
        const name = escapeString(row['Nombre'])
        const description = escapeString(row['Descripción'] || row['Resumed Info'] || '')
        const location = escapeString(row['Taxonomía - Región'] || 'Guatemala')
        const duration = extractDuration(row['Descripción'] || row['Resumed Info'] || '')
        
        experienceSQL += `INSERT INTO experiences (name, description, category, location, duration_hours, base_price, max_passengers, is_active, includes, highlights, requirements, meeting_point, metadata) VALUES (
  '${name}',
  '${description}',
  'helitour',
  '${location}',
  ${duration},
  ${basePrice},
  10,
  true,
  ARRAY['${escapeString(row['Taxonomía - Servicio'] || 'Helicopter tour')}'],
  ARRAY['${escapeString(row['Sub categoría'] || 'Scenic flight')}'],
  ARRAY[]::text[],
  '',
  '${JSON.stringify({
    subcategory: row['Sub categoría'],
    service_taxonomy: row['Taxonomía - Servicio'],
    region_taxonomy: row['Taxonomía - Región'],
    resumed_info: row['Resumed Info'],
    pricing: prices
  }).replace(/'/g, "''")}'::jsonb
);\n\n`
        
      } else if (category === 'destinos') {
        const name = escapeString(row['Nombre'])
        const description = escapeString(row['Descripción'] || row['Resumed Info'] || '')
        const location = escapeString(row['Taxonomía - Región'] || 'Guatemala')
        
        destinationSQL += `INSERT INTO destinations (name, description, location, coordinates, features, is_active, metadata) VALUES (
  '${name}',
  '${description}',
  '${location}',
  '{"lat": ${14.5891}, "lng": ${-90.5515}}'::jsonb,
  ARRAY['${escapeString(row['Sub categoría'] || 'Transport')}'],
  true,
  '${JSON.stringify({
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
  }).replace(/'/g, "''")}'::jsonb
);\n\n`
      }
    }
    
    const fullSQL = `-- FlyInGuate Data Import
-- Generated from CSV data

${experienceSQL}

${destinationSQL}`
    
    // Write to file
    const outputPath = '/Volumes/WORKHORSE GS/vibecoding/flyin/supabase/import-data.sql'
    fs.writeFileSync(outputPath, fullSQL)
    
    console.log(`✅ SQL file generated: ${outputPath}`)
    console.log('\n📋 To import:')
    console.log('1. Go to Supabase SQL Editor')
    console.log('2. Copy and paste the contents of supabase/import-data.sql')
    console.log('3. Run the query')
    
  } catch (error) {
    console.error('❌ Generation failed:', error)
    process.exit(1)
  }
}

// Run the generation
generateSQL()
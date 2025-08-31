import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { Uploader } from '@irys/upload'
import { Ethereum } from '@irys/upload-ethereum'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const privateKey = process.env.PRIVATE_KEY!
const sepoliaRpc = process.env.SEPOLIA_RPC!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Paths
const CSV_PATH = '/Users/gs/Downloads/Tabla Precios y destinos LetsFly.xlsx - Sheet2.csv'
const EXPERIENCES_FOLDER = '/Users/gs/Downloads/FlyInGuate Paquetes/HeliTours :  Experiencias'
const DESTINATIONS_FOLDER = '/Users/gs/Downloads/FlyInGuate Paquetes/Destinos'

interface ExperienceData {
  name: string
  category: string
  subcategory: string
  taxonomy_service: string
  taxonomy_region: string
  resumed_info: string
  description: string
  prices: {
    robinson_r66_1_2: number
    robinson_r66_3_4: number
    airbus_h125_4_5: number
    robinson_r66_x2_6: number
    robinson_airbus_8_10: number
  }
}

interface ProcessedExperience {
  name: string
  description: string
  category: string
  location: string
  duration_hours: number
  base_price: number
  max_passengers: number
  includes: string[]
  highlights: string[]
  requirements: string[]
  meeting_point?: string
  is_active: boolean
  metadata: any
}

// Parse price string to number
function parsePrice(priceStr: string): number {
  if (!priceStr || priceStr.trim() === '') return 0
  // Remove $ and spaces, then parse
  const cleaned = priceStr.replace(/[$\s,]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

// Extract duration from description
function extractDuration(description: string): number {
  const patterns = [
    /(\d+(?:\.\d+)?)\s*hour/i,
    /(\d+(?:\.\d+)?)\s*hora/i,
    /(\d+)\s*min/i,
    /(\d+)-minute/i
  ]
  
  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) {
      const value = parseFloat(match[1])
      // If it's minutes and less than 10 (likely hours), treat as hours
      if (pattern.toString().includes('min') && value > 10) {
        return value / 60 // Convert minutes to hours
      }
      return value
    }
  }
  
  return 2 // Default duration
}

// Extract includes from description
function extractIncludes(resumedInfo: string, description: string): string[] {
  const includes: string[] = []
  const text = `${resumedInfo} ${description}`.toLowerCase()
  
  // Common inclusions to look for
  const patterns = [
    { pattern: /helipad/i, include: 'Helipad usage' },
    { pattern: /ground transfer/i, include: 'Ground transportation' },
    { pattern: /breakfast/i, include: 'Breakfast included' },
    { pattern: /lunch/i, include: 'Lunch included' },
    { pattern: /almuerzo/i, include: 'Lunch included' },
    { pattern: /desayuno/i, include: 'Breakfast included' },
    { pattern: /champagne/i, include: 'Champagne service' },
    { pattern: /professional pilot/i, include: 'Professional pilot' },
    { pattern: /safety briefing/i, include: 'Safety briefing' },
    { pattern: /photo opportunities/i, include: 'Photo opportunities' },
    { pattern: /day pass/i, include: 'Day pass' },
    { pattern: /pool/i, include: 'Pool access' },
    { pattern: /piscina/i, include: 'Pool access' },
    { pattern: /guide/i, include: 'Professional guide' },
    { pattern: /equipment/i, include: 'All necessary equipment' }
  ]
  
  patterns.forEach(({ pattern, include }) => {
    if (pattern.test(text) && !includes.includes(include)) {
      includes.push(include)
    }
  })
  
  if (includes.length === 0) {
    includes.push('Professional pilot', 'Safety briefing')
  }
  
  return includes
}

// Map category from Spanish
function mapCategory(cat: string): string {
  const categoryMap: { [key: string]: string } = {
    'Destinos': 'destination',
    'Experiencias': 'experience',
    'Sobrevuelos': 'sobrevuelo',
    'Day-Flight Expeditions': 'day-flight',
    'Traslados VIP': 'traslado',
    'Eventos especiales': 'evento-especial'
  }
  
  return categoryMap[cat] || 'helitour'
}

// Upload image to IRYS
async function uploadToIrys(filePath: string): Promise<string | null> {
  try {
    console.log(`📤 Uploading ${path.basename(filePath)} to IRYS...`)
    
    const fileBuffer = fs.readFileSync(filePath)
    
    const irysUploader = await Uploader(Ethereum)
      .withWallet(privateKey)
      .withRpc(sepoliaRpc)
      .devnet()
    
    const receipt = await irysUploader.upload(fileBuffer, {
      tags: [
        { name: 'Content-Type', value: getContentType(filePath) },
        { name: 'Filename', value: path.basename(filePath) },
        { name: 'Application', value: 'FlyInGuate' }
      ]
    })
    
    const irysUrl = `https://devnet.irys.xyz/${receipt.id}`
    console.log(`✅ Uploaded: ${irysUrl}`)
    return irysUrl
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath}:`, error)
    return null
  }
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const types: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  }
  return types[ext] || 'image/jpeg'
}

// Process and upload images for an item
async function processImages(folderPath: string, itemId: string, type: 'experience' | 'destination') {
  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️ Folder not found: ${folderPath}`)
    return
  }
  
  const files = fs.readdirSync(folderPath)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .slice(0, 5) // Limit to 5 images per item
  
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(folderPath, files[i])
    const imageUrl = await uploadToIrys(filePath)
    
    if (imageUrl) {
      const table = type === 'experience' ? 'experience_images' : 'destination_images'
      const foreignKey = type === 'experience' ? 'experience_id' : 'destination_id'
      
      await supabase.from(table).insert({
        [foreignKey]: itemId,
        image_url: imageUrl,
        is_primary: i === 0,
        order_index: i,
        caption: path.basename(files[i], path.extname(files[i]))
      })
      
      // Also update main image if first image
      if (i === 0 && type === 'experience') {
        await supabase.from('experiences').update({ image_url: imageUrl }).eq('id', itemId)
      }
    }
  }
}

// Read and parse CSV
async function parseCSV(): Promise<ExperienceData[]> {
  return new Promise((resolve, reject) => {
    const results: ExperienceData[] = []
    
    fs.createReadStream(CSV_PATH)
      .pipe(csv({
        mapHeaders: ({ header }) => {
          // Map Spanish headers to English
          const headerMap: { [key: string]: string } = {
            'Nombre': 'name',
            'Categoría': 'category',
            'Sub categoría': 'subcategory',
            'Taxonomía - Servicio': 'taxonomy_service',
            'Taxonomía - Región': 'taxonomy_region',
            'Resumed Info': 'resumed_info',
            'Descripción': 'description',
            ' Robinson R66 ( 1-2 Pax)': 'robinson_r66_1_2',
            ' Robinson R66 ( 3-4 Pax)': 'robinson_r66_3_4',
            ' Airbus H125 B3 ( 4-5 Pax)': 'airbus_h125_4_5',
            ' 2 x Robinson R66 ( 6 Pax)': 'robinson_r66_x2_6',
            ' Robinson R66 + Airbus H125 ( 8-10 Pax)': 'robinson_airbus_8_10'
          }
          return headerMap[header] || header
        }
      }))
      .on('data', (data) => {
        // Skip empty rows or extras section
        if (data.name && data.name !== '' && !data.name.includes('EXTRAS')) {
          results.push({
            name: data.name,
            category: data.category || '',
            subcategory: data.subcategory || '',
            taxonomy_service: data.taxonomy_service || '',
            taxonomy_region: data.taxonomy_region || '',
            resumed_info: data.resumed_info || '',
            description: data.description || '',
            prices: {
              robinson_r66_1_2: parsePrice(data.robinson_r66_1_2),
              robinson_r66_3_4: parsePrice(data.robinson_r66_3_4),
              airbus_h125_4_5: parsePrice(data.airbus_h125_4_5),
              robinson_r66_x2_6: parsePrice(data.robinson_r66_x2_6),
              robinson_airbus_8_10: parsePrice(data.robinson_airbus_8_10)
            }
          })
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

// Main import function
async function importExperiences() {
  console.log('🚀 Starting import process...')
  
  try {
    // Parse CSV data
    const csvData = await parseCSV()
    console.log(`📊 Found ${csvData.length} items in CSV`)
    
    // Process each item
    for (const item of csvData) {
      console.log(`\n📝 Processing: ${item.name}`)
      
      // Determine if it's a destination or experience
      const isDestination = item.category === 'Destinos'
      
      if (isDestination) {
        // Process as destination
        const destination = {
          name: item.name,
          description: item.description || item.resumed_info,
          location: item.taxonomy_region || item.name,
          features: extractIncludes(item.resumed_info, item.description),
          is_active: true,
          metadata: {
            prices: item.prices,
            taxonomy_service: item.taxonomy_service,
            subcategory: item.subcategory,
            original_description: item.description
          }
        }
        
        // Insert destination
        const { data, error } = await supabase
          .from('destinations')
          .insert(destination)
          .select()
          .single()
        
        if (error) {
          console.error(`❌ Error inserting destination ${item.name}:`, error)
          continue
        }
        
        if (data) {
          console.log(`✅ Created destination: ${data.id}`)
          
          // Upload images
          const folderName = item.name.replace(/[\/\\:*?"<>|]/g, '')
          const imagePath = path.join(DESTINATIONS_FOLDER, folderName)
          await processImages(imagePath, data.id, 'destination')
        }
      } else {
        // Process as experience
        const basePrice = item.prices.robinson_r66_1_2 || item.prices.robinson_r66_3_4 || 500
        
        const experience: ProcessedExperience = {
          name: item.name,
          description: item.description || item.resumed_info,
          category: mapCategory(item.subcategory || item.category),
          location: item.taxonomy_region || 'Guatemala',
          duration_hours: extractDuration(item.description + ' ' + item.resumed_info),
          base_price: basePrice,
          max_passengers: 4,
          includes: extractIncludes(item.resumed_info, item.description),
          highlights: [],
          requirements: ['Valid passport or ID', 'Minimum age 2 years'],
          meeting_point: 'La Aurora International Airport',
          is_active: true,
          metadata: {
            prices: item.prices,
            taxonomy_service: item.taxonomy_service,
            subcategory: item.subcategory,
            original_description: item.description,
            resumed_info: item.resumed_info
          }
        }
        
        // Insert experience
        const { data, error } = await supabase
          .from('experiences')
          .insert(experience)
          .select()
          .single()
        
        if (error) {
          console.error(`❌ Error inserting experience ${item.name}:`, error)
          continue
        }
        
        if (data) {
          console.log(`✅ Created experience: ${data.id}`)
          
          // Upload images
          const folderName = item.name.replace(/[\/\\:*?"<>|]/g, '')
          const imagePath = path.join(EXPERIENCES_FOLDER, folderName)
          await processImages(imagePath, data.id, 'experience')
        }
      }
    }
    
    console.log('\n🎉 Import completed!')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  }
}

// Run the import
importExperiences()
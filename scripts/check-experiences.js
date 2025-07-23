const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  try {
    console.log('Checking current experiences in database...')
    
    const { data: experiences, error: expError } = await supabase
      .from('experiences')
      .select('*')
    
    if (expError) {
      console.error('Error fetching experiences:', expError)
    } else {
      console.log(`Found ${experiences.length} experiences:`)
      experiences.forEach(exp => {
        console.log(`- ${exp.name} ($${exp.base_price}) - ${exp.location}`)
      })
    }
    
    // Check if multilingual view exists
    console.log('\nChecking experiences_multilingual view...')
    const { data: multilingualData, error: multiError } = await supabase
      .from('experiences_multilingual')
      .select('*')
      .limit(3)
    
    if (multiError) {
      console.error('experiences_multilingual view error:', multiError)
    } else {
      console.log(`Found ${multilingualData.length} multilingual experiences`)
      multilingualData.forEach(exp => {
        console.log(`- ${exp.name} / ${exp.name_es}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkDatabase()
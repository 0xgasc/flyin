const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyExperiences() {
  try {
    console.log('Reading experiences SQL file...')
    const sqlPath = path.join(__dirname, '..', 'supabase', 'experiences-multilingual.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0)
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (!statement) continue
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`)
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          console.warn(`Warning on statement ${i + 1}:`, error.message)
          // Continue with other statements even if some fail
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.warn(`Error on statement ${i + 1}:`, err.message)
      }
    }
    
    console.log('✅ Migration completed!')
    
    // Test the new data
    const { data: experiences, error } = await supabase
      .from('experiences')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('Error testing experiences:', error)
    } else {
      console.log(`Found ${experiences.length} experiences in database`)
      experiences.forEach(exp => {
        console.log(`- ${exp.name} ($${exp.base_price})`)
      })
    }
    
  } catch (error) {
    console.error('Error applying experiences:', error)
    process.exit(1)
  }
}

applyExperiences()
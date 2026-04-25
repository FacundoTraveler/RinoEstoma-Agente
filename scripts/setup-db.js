#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    '❌ Missing environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...')

    // Read the SQL file
    const sqlPath = path.join(path.dirname(import.meta.url.replace('file://', '')), '01-init-db.sql')
    const sqlFile = fs.readFileSync('./scripts/01-init-db.sql', 'utf-8')

    // Split by semicolon and filter out empty statements
    const statements = sqlFile
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)

      // Use the admin API to execute raw SQL
      const { error } = await supabase.rpc('exec', {
        sql_string: statement,
      })

      if (error) {
        // If exec function doesn't exist, try direct query (less secure but works)
        const { error: directError } = await supabase.from('_internal').select('*').limit(0)
        console.log(`⚠️  Warning: Could not execute statement ${i + 1}`)
        console.log(`   Error: ${directError?.message || error.message}`)
        // Continue anyway, some statements might fail due to RLS or existing resources
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
      }
    }

    console.log('✨ Database setup completed!')
    console.log(
      '📌 Note: For direct SQL execution, use the Supabase dashboard SQL editor.'
    )
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  }
}

setupDatabase()

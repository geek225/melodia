import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import ws from 'ws'

global.WebSocket = ws
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPwd = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPwd) {
    console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.local")
    process.exit(1)
  }

  console.log(`Creating user: ${adminEmail}...`)
  
  // Create user using Admin API to bypass email confirmation
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    // deepcode ignore HardcodedCredential: Password is read securely from environment variables
    password: adminPwd,
    email_confirm: true,
    user_metadata: {
      full_name: 'Super Admin',
    }
  })

  if (authError) {
    console.error("Error creating user:", authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log(`User created with ID: ${userId}`)
  console.log("Waiting 2 seconds for triggers to run...")
  
  await new Promise(resolve => setTimeout(resolve, 2000))

  console.log("Promoting to super_admin...")
  
  // Update the profile role to super_admin
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('id', userId)

  if (updateError) {
    console.error("Error updating profile role:", updateError.message)
    process.exit(1)
  }

  console.log("Success! Admin user created.")
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPwd}`)
}

createAdmin()

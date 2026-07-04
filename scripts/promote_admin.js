import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import ws from 'ws'

global.WebSocket = ws
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function promote() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('email', 'admin@melodia.ai')
    .select()

  if (error) {
    console.error("Error:", error.message)
    process.exit(1)
  }
  console.log("Promoted user:", data)
}

promote()

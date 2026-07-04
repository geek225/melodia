require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function main() {
  const { data: txs, error: txError } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Latest transactions:", txs);
  
  const { data: users, error: uError } = await supabase.from('profiles').select('*').limit(5);
  console.log("Profiles:", users.map(u => ({ email: u.email, credits: u.credits })));
}
main();

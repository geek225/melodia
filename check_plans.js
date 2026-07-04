require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("Fetching plans from LIVE Supabase...");
  const { data, error } = await supabase.from('plans').select('name, price, credits').order('price');
  console.log("Database result:", data || error);
}
main();

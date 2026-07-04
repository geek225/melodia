require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.rpc('get_schema');
  console.log("RPC Error:", error);
  // If rpc fails, we can query information_schema
  const { data: tables, error: err2 } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  
  if (err2) {
    console.error("Info Schema Error:", err2);
  } else {
    console.log("Tables in public schema:", tables.map(t => t.table_name));
  }
}
main();

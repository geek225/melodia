require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.storage.getBucket('tracks');
  console.log("Bucket:", data, error);
  // Try listing files
  const { data: files, error: err } = await supabase.storage.from('tracks').list();
  console.log("Files length:", files ? files.length : err);
}
main();

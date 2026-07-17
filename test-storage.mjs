import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
global.WebSocket = WebSocket;
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.storage.from('tracks').list();
  if (error) console.error(error);
  else {
    const zeroByteFiles = data.filter(f => f.metadata?.size === 0);
    console.log(`Total files: ${data.length}`);
    console.log(`0 byte files: ${zeroByteFiles.length}`);
    if (zeroByteFiles.length > 0) console.log(zeroByteFiles[0]);
  }
}
check();

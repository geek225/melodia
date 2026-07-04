require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: txs } = await supabase.from('transactions').select('amount, created_at, status').eq('status', 'completed');
  let caJour = 0;
  let caMois = 0;
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  txs?.forEach(tx => {
    if (tx.created_at >= startOfDay) caJour += tx.amount;
    if (tx.created_at >= startOfMonth) caMois += tx.amount;
  });

  const { count: errCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'failed');
  const { count: trkCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true });
  
  console.log("caJour:", caJour, "caMois:", caMois, "errCount:", errCount, "trkCount:", trkCount);
}
main();

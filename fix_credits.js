require('dotenv').config({ path: '.env.local' });
async function fix() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Fetch latest transactions from paytech
  const txRes = await fetch(`${url}/rest/v1/transactions?select=*&order=created_at.desc&limit=10`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const txs = await txRes.json();
  console.log("Transactions:", txs);
  
  // Fetch profiles
  const pRes = await fetch(`${url}/rest/v1/profiles?select=*`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const profiles = await pRes.json();
  console.log("Profiles:", profiles.map(p => ({ id: p.id, email: p.email, credits: p.credits })));
}
fix();

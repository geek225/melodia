require('dotenv').config({ path: '.env.local' });
async function fix() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const pRes = await fetch(`${url}/rest/v1/profiles?id=eq.9500d40b-98bd-4ef9-b516-bbd6899a27b4`, {
    method: 'PATCH',
    headers: { 
      'apikey': key, 
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ credits: 120 })
  });
  const updated = await pRes.json();
  console.log("Updated:", updated);
}
fix();

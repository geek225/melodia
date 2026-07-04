require('dotenv').config({ path: '.env.local' });
async function main() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/bucket`;
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  console.log("Database buckets:", await res.json());

  // list files in 'tracks'
  const tracksUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/list/tracks`;
  const res2 = await fetch(tracksUrl, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ limit: 10 })
  });
  console.log("Database tracks:", await res2.json());
}
main();

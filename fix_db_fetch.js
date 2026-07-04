require('dotenv').config({ path: '.env.local' });
async function main() {
  const realPlans = [
    { name: "Pack Découverte", credits: 10, price: 500, is_active: true },
    { name: "Pack Starter", credits: 30, price: 1000, is_active: true },
    { name: "Pack Créateur", credits: 60, price: 1800, is_active: true },
    { name: "Pack Studio", credits: 120, price: 3000, is_active: true },
    { name: "Pack Producteur", credits: 250, price: 5500, is_active: true }
  ];

  const postUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/plans`;
  const res = await fetch(postUrl, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(realPlans)
  });
  console.log("Insert result:", await res.json());
}
main();

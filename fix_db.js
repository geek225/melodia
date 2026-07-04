require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("Deleting old plans...");
  await supabase.from('plans').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  console.log("Inserting real plans...");
  const realPlans = [
    { name: "Pack Découverte", credits: 10, price: 500, billing_cycle: "UNIQUE", is_active: true },
    { name: "Pack Starter", credits: 30, price: 1000, billing_cycle: "UNIQUE", is_active: true },
    { name: "Pack Créateur", credits: 60, price: 1800, billing_cycle: "UNIQUE", is_active: true },
    { name: "Pack Studio", credits: 120, price: 3000, billing_cycle: "UNIQUE", is_active: true },
    { name: "Pack Producteur", credits: 250, price: 5500, billing_cycle: "UNIQUE", is_active: true }
  ];

  const { data, error } = await supabase.from('plans').insert(realPlans);
  console.log("Insert result:", data || error);
}
main();

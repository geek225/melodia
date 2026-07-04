require('dotenv').config({ path: '.env.local' });
async function check() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const trebloKey = process.env.TREBLO_API_KEY || "sksonauto_48dtMwZYfnrRApJ0JAZ5p09Ep9w10p4xgDMSUQjrkf3JWu4I";
  
  // get latest processing track
  const pRes = await fetch(`${url}/rest/v1/tracks?status=eq.processing&order=created_at.desc&limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const tracks = await pRes.json();
  if (tracks.length === 0) return console.log("No processing tracks found.");
  
  const track = tracks[0];
  console.log("Track:", track.id, track.title, track.audio_url);
  
  const taskId = track.audio_url.replace('task:', '');
  console.log("Task ID:", taskId);
  
  const tRes = await fetch(`https://api.treblo.com/v1/generations/status/${taskId}`, {
    headers: { 'Authorization': `Bearer ${trebloKey}` }
  });
  console.log("Treblo Status Code:", tRes.status);
  const statusData = await tRes.text();
  console.log("Treblo Status:", statusData);
  
  if (statusData.includes("SUCCESS")) {
     const tRes2 = await fetch(`https://api.treblo.com/v1/generations/${taskId}`, {
        headers: { 'Authorization': `Bearer ${trebloKey}` }
     });
     console.log("Treblo Details:", await tRes2.text());
  }
}
check();

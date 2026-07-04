require('dotenv').config({ path: '.env.local' });
async function test() {
  const apiKey = process.env.TREBLO_API_KEY || "sksonauto_48dtMwZYfnrRApJ0JAZ5p09Ep9w10p4xgDMSUQjrkf3JWu4I";
  const apiRes = await fetch("https://api.treblo.com/v1/generations/v3", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: "Style musical: Afrobeats, naija pop, smooth, danceable, tropical. Voix: Homme. Chanson en Français. Histoire/Sujet : tester la génération",
        make_instrumental: false
      })
    });
    
  console.log("Status:", apiRes.status);
  const text = await apiRes.text();
  console.log("Response:", text);
}
test();

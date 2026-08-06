/**
 * Google Gemini API integration for Meliodia Lyrics Generation.
 */

export interface LyricsGenerationParams {
  title?: string;
  topic?: string;
  style?: string;
  mood?: string;
  language?: string;
}

export async function generateLyricsWithGemini(params: LyricsGenerationParams): Promise<{ success: boolean; lyrics?: string; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Clé API Gemini non configurée sur Vercel. Veuillez ajouter GEMINI_API_KEY dans les variables d'environnement de Vercel."
    };
  }

  const {
    title = "",
    topic = "",
    style = "Afrobeats",
    mood = "Énergique",
    language = "Français"
  } = params;

  const systemInstruction = `Tu es l'assistant de composition musicale de Meliodia, un parolier d'élite spécialisé dans tous les genres musicaux (Afrobeats, Coupé-Décalé, Zouglou, Rumba Congolaise, Gospel, Rap Ivoire, Pop, R&B, Chanson Française).
Ta mission est de rédiger des paroles de chanson hautement captivantes, poétiques, rythmées et adaptées au style musical demandé.

Instructions strictes de structure :
1. Organise les paroles avec des balises de structure musicales claires entre crochets :
   [Intro]
   [Couplet 1]
   [Refrain]
   [Couplet 2]
   [Refrain]
   [Pont]
   [Outro]
2. Inclus des rimes riches, une bonne métrique et une vraie musicalité.
3. Si le style est africain (Zouglou, Coupé-Décalé, Rap Ivoire, Rumba), utilise les expressions culturelles adaptées (ex: Nouchi pour Rap Ivoire/Coupé-Décalé, sonorités Woyo pour Zouglou, Atalaku subtil, etc.) tout en restant compréhensible.
4. Rends la chanson moderne, émouvante et mémorable.
5. Retourne SEULEMENT les paroles avec leurs balises de structure (pas d'intro ni d'explications superflues).`;

  const userPrompt = `Rédige les paroles d'une chanson en ${language}.
${title ? `Titre de la chanson : "${title}"` : ''}
${topic ? `Histoire / Idée / Sujet : "${topic}"` : ''}
Style musical : ${style}
Ambiance / Mood : ${mood}

Rédige une chanson complète, moderne et entraînante.`;

  // Standard valid Gemini models
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  let lastErrorMessage = "";

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemInstruction}\n\n${userPrompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 2048
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn("Gemini model failed:", model, response.status, errorData);
        lastErrorMessage = errorData?.error?.message || `HTTP ${response.status}`;
        continue; // Try next model
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText && generatedText.trim().length > 0) {
        return {
          success: true,
          lyrics: generatedText.trim()
        };
      }
    } catch (err) {
      console.warn("Error calling Gemini model:", model, err);
      lastErrorMessage = err instanceof Error ? err.message : "Erreur de connexion";
    }
  }

  return {
    success: false,
    error: lastErrorMessage
      ? `Erreur Gemini API (${lastErrorMessage}). Vérifiez votre clé GEMINI_API_KEY sur Vercel.`
      : "Impossible de générer les paroles avec l'API Gemini. Veuillez vérifier votre clé API sur Vercel."
  };
}

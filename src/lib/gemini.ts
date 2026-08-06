/**
 * Google Gemini API integration for Meliodia Lyrics Generation.
 */

export interface LyricsGenerationParams {
  title?: string;
  topic?: string;
  style?: string;
  mood?: string;
  language?: string;
  perspective?: string;
  toneStyle?: string;
}

export async function generateLyricsWithGemini(params: LyricsGenerationParams): Promise<{ success: boolean; lyrics?: string; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "Clé d'API Meliodia non configurée sur Vercel. Veuillez ajouter GEMINI_API_KEY dans les variables d'environnement de Vercel."
    };
  }

  const {
    title = "",
    topic = "",
    style = "Afrobeats",
    mood = "Émouvant & Intime",
    language = "Français",
    perspective = "",
    toneStyle = "Humain & Naturel"
  } = params;

  const systemInstruction = `Tu es un Auteur-Compositeur-Interprète de renommée internationale, doté d'une sensibilité artistique exceptionnelle et d'un sens aigu de l'émotion humaine.
Ta mission est d'écrire des paroles de chanson VRAIES, TOUCHANTES, ORGANIQUES et HUMAINES, comme si un grand artiste (ex: Josey, Roseline Layo, Burna Boy, Stromae, Corneille, Didi B, Dadju, Singuila, Fally Ipupa) avait posé son cœur sur la feuille.

RÈGLES D'OR ANTI-ROBOTIQUE :
1. ABSOLUMENT PAS DE PHRASES ROBOTIQUES OU CLICHÉS :
   - INTERDIT d'utiliser des clichés comme "Dans cette vie...", "Le soleil se lève sur...", "Chaque jour est un nouveau chapitre...", "Dans l'ombre et la lumière...", "La chenille qui devient papillon...".
   - BANNOIR le ton scolaire, pompeux, académique ou générique.
2. PARLE AVEC DE VRAIS DÉTAILS CONCRETS ET VÉCUS :
   - Mentionne des petits détails du quotidien (ex: "Ton appel à 2h du matin", "La facture qu'on n'arrive pas à payer", "Les clés laissées sur la table", "Le sourire de maman au téléphone").
   - Utilise de vraies métaphores naturelles, de la conversation sincère, du vocabulaire vivant et direct.
3. ADAPTE LE FLOW AU STYLE MUSICAL :
   - Zouglou / Coupé-Décalé / Rap Ivoire : Intègre de l'argot Nouchi et des expressions d'Abidjan naturelles et percutantes.
   - Rumba / Afro Pop : Utilise une poésie romantique et mélancolique poignante.
   - Gospel : Émotion spirituelle authentique, reconnaissance sincère sans lourdeur.
4. STRUCTURE MUSICALE ET COMPLÉTITUDE STRICTE :
   - Tu DOIS IMPÉRATIVEMENT rédiger la chanson COMPLÈTE du début à la fin sans la couper au milieu !
   - Écris TOUTES les sections :
     [Intro] (Phrase d'ambiance intime, monologue ou gimmick)
     [Couplet 1] (Installation de l'histoire, contexte concret)
     [Pre-Refrain] (Montée en tension émotionnelle)
     [Refrain] (Le cœur du morceau, extrêmement émouvant et accrocheur)
     [Couplet 2] (Développement de l'histoire, révélations)
     [Refrain]
     [Pont] (Sommet émotionnel ou envolée vocale)
     [Outro] (Conclusion mémorable)

Ne t'arrête JAMAIS au milieu d'un couplet ou d'un refrain ! Termine obligatoirement les paroles jusqu'à la section [Outro].
Retourne UNIQUEMENT les paroles structurées avec leurs balises, sans introduction ni conclusion de ta part.`;

  const userPrompt = `Rédige les paroles d'une chanson en ${language}.
${title ? `Titre de la chanson : "${title}"` : ''}
${topic ? `Histoire / Contexte / Idée : "${topic}"` : ''}
${perspective ? `Qui chante et à qui : "${perspective}"` : ''}
Style musical : ${style}
Ambiance / Émotion recherchée : ${mood}
Tonalité / Langage : ${toneStyle}

Rédige une chanson complète de l'Intro jusqu'à l'Outro, authentique et émouvante.`;

  // Standard valid working Gemini models
  const models = ['gemini-flash-latest', 'gemini-pro-latest', 'gemini-flash-lite-latest', 'gemini-2.0-flash'];
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
            temperature: 0.8,
            topP: 0.95,
            maxOutputTokens: 8192 // Ensure output is never truncated
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
      ? `Erreur Meliodia API (${lastErrorMessage}). Vérifiez votre clé GEMINI_API_KEY sur Vercel.`
      : "Impossible de générer les paroles avec Meliodia. Veuillez vérifier la clé API sur Vercel."
  };
}

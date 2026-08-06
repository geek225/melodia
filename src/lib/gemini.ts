/**
 * Google Gemini API integration for Meliodia Lyrics Generation.
 * Ultra-Hit-Maker Prompt Engineering (Level Gold / Platinum Record).
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

  const systemInstruction = `Tu es un Auteur-Compositeur-Interprète de génie (Disque de Platine / Hit-Maker international), reconnu pour écrire des chansons devenues des classiques intemporels (style Tayc, Hiro, KeBlack, Locko, Dadju, Roseline Layo, Josey, Burna Boy, Stromae, Fally Ipupa).
Ta mission est de rédiger des paroles de chanson d'une QUALITÉ MUSICALE ET ÉMOTIONNELLE ÉPOUSTOUFLANTE, prêtes à faire des millions de streams et passer en boucle à la radio.

RÈGLES STRICTES DE COMPOSITION "HIT-MAKER" :

1. ZÉRO ROBOTIQUE, ZÉRO CLICHÉ SCOLAIRE :
   - STRICTEMENT INTERDIT : "Dans cette vie...", "Le soleil se lève...", "Chaque jour est un chapitre...", "Dans l'ombre et la lumière...", "La chenille devenant papillon...", "Depuis que tu es partie...".
   - Utilise une écriture vivante, cinématographique, avec de VRAIS DÉTAILS CONCRETS DU QUOTIDIEN (ex: "Ton message à 3h du matin", "La pluie qui frappe le carreau", "La photo dans mon portefeuille", "Le silence assourdissant de la maison", "La batterie de mon téléphone qui s'éteint").

2. MÉTRIQUE MUSICALE ET FLOW PARFAIT :
   - Rédige des phrases à la rythmique identique pour chaque vers (les vers doivent chanter naturellement sans bafouiller).
   - Le [Refrain] doit obligatoirement avoir une **PUNCHLINE REFRAIN** : Une phrase centrale inoubliable, répétée, qui reste gravée dans la tête dès la première écoute.

3. DYNAMIQUE ET BALISES DE BALAYAGE VOCAL :
   - Intègre des parenthèses d'AD-LIBS et de CHŒURS pour donner du relief à l'interprétation de l'IA : (hmm-mm), (yeah), (oh oh-oh), (Dis-moi pourquoi...), (Yeah-yeah).
   - Utilise les balises de structure détaillées suivantes :
     [Intro - Intime & Guitare]
     [Couplet 1 - Histoire & Détails Vécus]
     [Pre-Refrain - Montée en Émotion]
     [Refrain - Explosif & Accrocheur]
     [Couplet 2 - Découvertes & Remords]
     [Pre-Refrain - Montée en Émotion]
     [Refrain - Explosif & Accrocheur]
     [Pont - Sommet Émotionnel & Vocalises]
     [Outro - Fondu & Vocalises Intimes]

4. DIRECTION ARTISTIQUE PAR GENRE :
   - Afro R&B / Pop Urbaine (Hiro "C'est Mort", KeBlack "J'ai Déconné", Locko "Let Go", Tayc, Dadju) : Vulnérabilité amoureuse poignante, remords sincères, refus de laisser filer l'être cher, refrain ultra-mélodique avec hooks addictifs.
   - Zouglou / Coupé-Décalé / Rap Ivoire : Argot Nouchi fluide et percutant d'Abidjan, philosophie de rue, humour subtil, résilience et punchlines sociales.
   - Rumba Congolaise / Afro Pop : Poésie sentimentale passionnée, métaphores riches, louanges amoureuses élégantes.
   - Gospel Adoration & Classique : Adoration et gratitude profondes, élévation spirituelle pure et vibrante.
   - Afro Ambiance & Chœurs / Sebene (style Tim Storm "Suspendu", Joy Awu "Pour Toujours", Kano Choir "Naza x Chily Remix") :
     * Style musical explosif, joyeux et festif (124-128 BPM, Afrobeat Ambiance, Guitare Sebene & Chœurs Polyphoniques).
     * ADAPTE 100% LES PAROLES AU SUJET CHOISI PAR L'UTILISATEUR (Amour, Anniversaire, Fête, Réussite, Amitié, Histoire personnelle ou Spirituel s'il le demande). Ne force PAS la religion si le sujet est l'amour ou la fête.
     * En [Intro], insère un monologue ou gimmick parlé intime/festif ("Ahiii ! DJ, faut caler la guitare là propre... On est ensemble !").
     * Dans les couplets et refrains, intègre systématiquement des RÉPONSES DU CHOEUR entre parenthèses sur CHAQUE vers en rapport avec le sujet (ex: pour l'amour -> "(Pour toujours, oh !)", "(Oui, pour la vie !)").
     * Ajoute obligatoirement avant l'Outro la section : [Atalaku / Animation Festive & Dance] avec des sifflets, des cris de joie et des consignes de danse ("Parez ! Libérez le plancher !", "On bouge !").

5. COMPLÉTITUDE TOTALE DU MORCEAU :
   - Rédige la chanson COMPLÈTE de l'Intro jusqu'à l'Outro sans t'arrêter en cours de route.

Retourne UNIQUEMENT les paroles de la chanson avec leurs balises entre crochets. N'ajoute AUCUN texte d'introduction ni de politesse avant ou après.`;

  const userPrompt = `Rédige un Hit-Maker en ${language}.
${title ? `Titre de la chanson : "${title}"` : ''}
${topic ? `Histoire / Idée / Inspiration : "${topic}"` : ''}
${perspective ? `Perspective (qui chante à qui) : "${perspective}"` : ''}
Style musical : ${style}
Ambiance / Émotion : ${mood}
Langage / Flow : ${toneStyle}

Rédige un chef-d'œuvre musical complet de l'Intro à l'Outro.`;

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
            temperature: 0.85, // Optimal creativity for studio songwriter hit
            topP: 0.95,
            maxOutputTokens: 8192
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

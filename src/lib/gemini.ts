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
  voice?: "Homme" | "Femme" | "Duo" | string;
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
    toneStyle = "Humain & Naturel",
    voice = "Homme"
  } = params;

  const isDuo = voice === "Duo" || perspective.toLowerCase().includes("duo");
  const isFemme = voice === "Femme";

  let structureGuide = "";
  if (isDuo) {
    structureGuide = `
      [Intro - Duo (Homme & Femme)]
      [Couplet 1 - Voix Homme] (L'homme pose son histoire avec émotion et sincérité, 4 à 6 vers max)
      [Couplet 2 - Voix Femme] (La femme répond avec sa voix et sa sensibilité, 4 à 6 vers max)
      [Pre-Refrain - Duo Alterné] (Montée en émotion avec échange rapide de phrases)
      [Refrain - Duo Harmonisé (Homme & Femme Ensemble)] (Refrain explosif et mémorable chanté à deux)
      [Pont - Dialogue Homme & Femme]
      [Homme]: (Phrase poignante de l'homme)
      [Femme]: (Réponse vibrante de la femme)
      [Refrain - Duo Harmonisé (Homme & Femme Ensemble)]
      [Outro - Fondu Duo / Fade Out]
      [End]`;
  } else if (isFemme) {
    structureGuide = `
      [Intro - Voix Femme]
      [Couplet 1 - Voix Femme] (4 à 6 vers max)
      [Pre-Refrain - Voix Femme] (2 à 4 vers max)
      [Refrain - Voix Femme] (Refrain explosif et mémorable, 4 vers)
      [Couplet 2 - Voix Femme] (4 à 6 vers max)
      [Pre-Refrain - Voix Femme]
      [Refrain - Voix Femme]
      [Pont - Voix Femme & Vocalises]
      [Refrain - Voix Femme]
      [Outro - Voix Femme / Fade Out]
      [End]`;
  } else {
    structureGuide = `
      [Intro - Voix Homme]
      [Couplet 1 - Voix Homme] (4 à 6 vers max)
      [Pre-Refrain - Voix Homme] (2 à 4 vers max)
      [Refrain - Voix Homme] (Refrain explosif et mémorable, 4 vers)
      [Couplet 2 - Voix Homme] (4 à 6 vers max)
      [Pre-Refrain - Voix Homme]
      [Refrain - Voix Homme]
      [Pont - Voix Homme & Vocalises]
      [Refrain - Voix Homme]
      [Outro - Voix Homme / Fade Out]
      [End]`;
  }

  const systemInstruction = `Tu es un Auteur-Compositeur-Interprète de génie (Disque de Platine / Hit-Maker international), reconnu pour écrire des chansons devenues des classiques intemporels (style Tayc, Hiro, KeBlack, Locko, Dadju, Roseline Layo, Josey, Burna Boy, Stromae, Fally Ipupa).
Ta mission est de rédiger des paroles de chanson d'une QUALITÉ MUSICALE ET ÉMOTIONNELLE ÉPOUSTOUFLANTE, prêtes à faire des millions de streams et passer en boucle à la radio.

RÈGLES STRICTES DE COMPOSITION "HIT-MAKER" :

1. FORMAT ET DURÉE STRICTE (FORMAT RADIO 3MIN À 3MIN30S MAXIMUM) :
   - Évite les textes à rallonge ! Les chansons doivent être percutantes, sans couplets superflus.
   - Respecte scrupuleusement la structure standard (2 couplets, pré-refrains, refrains, pont, outro).
   - Termine TOUJOURS impérativement la chanson par les balises [Outro - Fade Out] et [End] pour que l'IA musicale boucle et arrête le morceau entre 3:00 et 3:45 max.

2. GESTION STRICTE DU TYPE DE VOIX :
   ${isDuo ? "- ATTENTION FORMAT DUO : C'est un DUO VIBRANT HOMME ET FEMME. Tu DOIS obligatoirement alterner les rôles avec les balises [Couplet 1 - Voix Homme], [Couplet 2 - Voix Femme], [Homme]:, [Femme]:, et [Refrain - Duo Harmonisé (Homme & Femme Ensemble)]." : isFemme ? "- VOIX FEMME : Écris la chanson à la première personne pour une voix de femme puissante et émouvante, avec balises [Voix Femme]." : "- VOIX HOMME : Écris la chanson pour une voix d'homme chaleureuse et expressive, avec balises [Voix Homme]."}

3. ZÉRO ROBOTIQUE, ZÉRO CLICHÉ SCOLAIRE :
   - STRICTEMENT INTERDIT : "Dans cette vie...", "Le soleil se lève...", "Chaque jour est un chapitre...", "Dans l'ombre et la lumière...", "La chenille devenant papillon...", "Depuis que tu es partie...".
   - Utilise une écriture vivante, cinématographique, avec de VRAIS DÉTAILS CONCRETS DU QUOTIDIEN (ex: "Ton message à 3h du matin", "La pluie qui frappe le carreau", "La photo dans mon portefeuille", "Le silence assourdissant de la maison", "La batterie de mon téléphone qui s'éteint").

4. MÉTRIQUE MUSICALE, MÉLODIE ET ACCROCHE HYPNOTIQUE :
   - Écris des vers d'une métrique rigoureuse et mélodique, très faciles à chanter, pour forcer l'IA musicale à produire des envolées mélodiques magnifiques.
   - Le [Refrain] doit obligatoirement être un **CHEF-D'ŒUVRE DE MÉLODIE** avec un motif vocal obsédant et une PUNCHLINE REFRAIN inoubliable (qu'on peut tous fredonner dès la 1ère écoute).
   - Intègre des parenthèses de vocalises mélodiques : (mélodie envolée), (voix mélodieuse), (harmonie chaude), (oh-oh-oh).

5. DYNAMIQUE ET BALISES DE STRUCTURE :
   - Intègre des parenthèses d'AD-LIBS et de CHŒURS pour donner du relief à l'interprétation de l'IA : (hmm-mm), (yeah), (oh oh-oh), (Dis-moi pourquoi...), (Yeah-yeah).
   - Utilise obligatoirement cette structure :
${structureGuide}

6. DIRECTION ARTISTIQUE PAR GENRE :
   - Reggae & Afro-Reggae (Bob Marley "One Love", Alpha Blondy "Sweet Fanta Diallo", Tiken Jah Fakoly, Lucky Dube) : Chanson poignante, consciente, engagée ou d'amour sincère (72-84 BPM). Rédige en Français, Anglais ou Bilingue avec une poésie spirituelle, de la résilience, de la dignité et de la fraternité ("One love", "Paix et unité", "Rise up", "Reste debout"), un refrain hymne chanté en chœur et des vocalises roots (yeah man, woah-oh, jah bless).
   - Afro Zouk / Zouk Love (Monique Séka "First Love", Oliver N'Goma "Bane", Nelson Freitas, Kaysha, Fanny J, Princess Lover) : Chanson d'amour sensuelle, langoureuse et romantique (84-96 BPM). Rédige en Français, Anglais ou Bilingue (FR/EN) avec une vraie tendresse, des mots doux ("Doudou", "Mon amour", "Baby stay with me", "Bébé dis-moi que tu m'aimes"), un refrain ultra-mélodique qui invite à la danse à deux, et des ad-libs sensuels (hmm, yeah, oh-oh).
   - Musique Rap Décalé Urban (Coupé-Décalé + Rap Ivoire + Urban Abidjan) : Flow Nouchi rythmé et percutant, punchlines de rue, ambiance club décalée, refrain obsédant et giga-ambiance (128-135 BPM).
   - Musique Urbaine & Zouglou (Zouglou + Roseline Layo, Josey, VDA) : Philosophie du vécu, poésie sentimentale et urbaine, métaphores poignantes d'Abidjan, chœurs woyo polyphoniques harmonieux (102-114 BPM).
   - Rumba Congolaise / Afro Pop : Poésie sentimentale passionnée, métaphores riches, louanges amoureuses élégantes.
   - Gospel Adoration & Classique : Adoration et gratitude profondes, élévation spirituelle pure et vibrante.
   - Afro Ambiance & Chœurs / Sebene (style Tim Storm "Suspendu", Joy Awu "Pour Toujours", Kano Choir "Naza x Chily Remix") :
     * Style musical explosif, joyeux et festif (124-128 BPM, Afrobeat Ambiance, Guitare Sebene & Chœurs Polyphoniques).
     * ADAPTE 100% LES PAROLES AU SUJET CHOISI PAR L'UTILISATEUR (Amour, Anniversaire, Fête, Réussite, Amitié, Histoire personnelle ou Spirituel s'il le demande). Ne force PAS la religion si le sujet est l'amour ou la fête.
     * En [Intro], insère un monologue ou gimmick parlé intime/festif ("Ahiii ! DJ, faut caler la guitare là propre... On est ensemble !").
     * Dans les couplets et refrains, intègre systématiquement des RÉPONSES DU CHOEUR entre parenthèses sur CHAQUE vers en rapport avec le sujet (ex: pour l'amour -> "(Pour toujours, oh !)", "(Oui, pour la vie !)").
     * Ajoute obligatoirement avant l'Outro la section : [Atalaku / Animation Festive & Dance] avec des sifflets, des cris de joie et des consignes de danse ("Parez ! Libérez le plancher !", "On bouge !").

7. COMPLÉTITUDE TOTALE DU MORCEAU :
   - Rédige la chanson COMPLÈTE de l'Intro jusqu'à [End] sans t'arrêter en cours de route.

Retourne UNIQUEMENT les paroles de la chanson avec leurs balises entre crochets. N'ajoute AUCUN texte d'introduction ni de politesse avant ou après.`;

  const userPrompt = `Rédige un Hit-Maker en ${language}.
${title ? `Titre de la chanson : "${title}"` : ''}
${topic ? `Histoire / Idée / Inspiration : "${topic}"` : ''}
Type de Voix : ${isDuo ? "DUO HOMME ET FEMME (Voix alternées et refrain harmonisé)" : isFemme ? "VOIX FEMME" : "VOIX HOMME"}
${perspective ? `Perspective (qui chante à qui) : "${perspective}"` : ''}
Style musical : ${style}
Ambiance / Émotion : ${mood}
Langage / Flow : ${toneStyle}
Durée : Format standard radio (3:00 - 3:30 max).

Rédige un chef-d'œuvre musical complet et concis de l'Intro à [End].`;

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

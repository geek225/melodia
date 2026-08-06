/**
 * Music Knowledge Base — Meliodia
 *
 * Ce module centralise les connaissances musicales par style (BPM, pays,
 * langues, systemPrompt, negativePrompt) issues du dossier
 * meliodia-knowledge/knowledge/.
 *
 * Utilisé par actions.ts lors de la génération musicale pour produire
 * des prompts plus précis et culturellement authentiques.
 */

export interface MusicStyleKnowledge {
  name: string;
  country: string;
  bpm: string;
  languages: string[];
  systemPrompt: string;
  negativePrompt: string;
}

// ─── Afrique de l'Ouest ──────────────────────────────────────────────
const afriqueOuest: MusicStyleKnowledge[] = [
  {
    name: "Coupé-Décalé",
    country: "Côte d'Ivoire",
    bpm: "125-130",
    languages: ["Français", "Nouchi"],
    systemPrompt: `Generate a highly melodic, energetic, authentic Abidjan Coupé-Décalé anthem inspired by Serge Beynaud, DJ Arafat, Bebi Philip, and Kedjevara.
Country: Côte d'Ivoire (Abidjan)
Tempo: 125-130 BPM
Languages: Français, Nouchi
Melody & Harmony Guide:
- Melodic african electric guitar sebene solo riffs, bright catchy synth lead melodies, marimba & synth brass hooks.
- Rich harmonic afro piano chord progression, bouncy melodic bassline, infectious singalong chorus hook.
- Atalaku hypeman vocal shouts, roukaskas drums, boucan ambiance, explosive Abidjan club dance groove.
- Polished studio mix, high energy, commercial hit arrangement.`,
    negativePrompt: "metal, hard rock, monotonous beat, no melody, bad mix, off beat, low quality, distorted vocals, slow tempo",
  },
  {
    name: "Musique Urbaine Ivoire",
    country: "Côte d'Ivoire",
    bpm: "95-108",
    languages: ["Français", "Nouchi", "Dioula", "Baoulé"],
    systemPrompt: `Generate an authentic, highly emotional Ivorian Urban Pop anthem inspired by Roseline Layo and Josey.
Country: Côte d'Ivoire (Abidjan)
Tempo: 95-108 BPM
Languages: Français, Nouchi, Dioula, Baoulé
Melody & Harmony Guide:
- Powerful expressive lead vocal performance, lush choir harmonies.
- Melodic acoustic and electric afro guitar riffs, smooth brass stabs, warm synth pads, afro-pop groove.
- Polished modern Abidjan urban production, catchy emotional chorus hook, rich acoustic-electro fusion.`,
    negativePrompt: "metal, hard rock, monotonous beat, aggressive electronic noise, bad mix, off beat, low quality",
  },
  {
    name: "Rap Ivoire",
    country: "Côte d'Ivoire",
    bpm: "135-148",
    languages: ["Français", "Nouchi"],
    systemPrompt: `Generate a hard-hitting, authentic Rap Ivoire & Afro-Drill anthem inspired by Didi B (Shogün / Batman), Himra (Nabo Cleman / He Tchai), Suspect 95, and Ameka Zrai.
Country: Côte d'Ivoire (Abidjan street rap)
Tempo: 135-148 BPM
Languages: Français, Nouchi (authentic Abidjan slang flow)
Beat & Sound Guide:
- Heavy sliding 808 sub-bass, fast triplet hi-hat glides, aggressive drill snare & hard rimshots.
- Dark cinematic synth bells, melodic flute or electric guitar loops, brass stabs.
- Fast energetic Nouchi rap flow, punchy rhythm, aggressive Abidjan street attitude, catchy chant chorus hook.
- Loud crisp trap-drill mix, heavy low-end impact.`,
    negativePrompt: "metal, hard rock, gentle acoustic guitar, slow r&b, bad mix, off beat, low quality, soft vocals",
  },
  {
    name: "Zouglou",
    country: "Côte d'Ivoire",
    bpm: "102-114",
    languages: ["Français", "Nouchi"],
    systemPrompt: `Generate a deeply authentic Ivorian Zouglou acoustic song with heavy traditional African percussions and authentic African vocal accent inspired by Espoir 2000, Magic System, Yodé & Siro, and VDA.
Country: Côte d'Ivoire (Abidjan)
Tempo: 102-114 BPM
Languages: Français, Nouchi (authentic West African vocal accent)
Instrumentation & Rhythm:
- Heavy acoustic West African tam-tam percussions, authentic woyo djembe drums, shekere shaker, metallic cowbell rhythm.
- Acoustic & electric guitar arpeggios, clean high-life guitar sebene solo, accordion lead accents, bouncy bassline.
- Storytelling lead vocals with authentic African vocal accent, warm polyphonic Woyo choir call-and-response harmonies.
- Pure acoustic live band feel, no euro pop synths.`,
    negativePrompt: "euro pop synth, electro pop, urban pop, autotune pop, hiro naza style, metal, hard rock, monotonous electronic beat, bad mix, off beat",
  },
  {
    name: "Afrobeats",
    country: "Nigeria",
    bpm: "100-115",
    languages: ["English", "Pidgin"],
    systemPrompt: `Generate an authentic Afrobeats track.
Country: Nigeria
Tempo: 100-115 BPM
Languages: English,Pidgin
Style guide:
- Groove Lagos, afro pop.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Afrobeats Nigeria",
    country: "Nigeria",
    bpm: "105-115",
    languages: ["English", "Pidgin"],
    systemPrompt: `Generate an authentic Afrobeats Nigeria track.
Country: Nigeria
Tempo: 105-115 BPM
Languages: English,Pidgin
Style guide:
- Club Lagos, heavy bass.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Mbalax",
    country: "Sénégal",
    bpm: "120-140",
    languages: ["Wolof", "French"],
    systemPrompt: `Generate an authentic Mbalax track.
Country: Sénégal
Tempo: 120-140 BPM
Languages: Wolof,French
Style guide:
- Sabar, kora, énergie.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
];

// ─── Afrique Centrale ────────────────────────────────────────────────
const afriqueCentrale: MusicStyleKnowledge[] = [
  {
    name: "Rumba Congolaise",
    country: "RDC",
    bpm: "84-102",
    languages: ["Lingala", "French"],
    systemPrompt: `Generate an authentic Rumba Congolaise track.
Country: RDC
Tempo: 84-102 BPM
Languages: Lingala,French
Style guide:
- Sebene, romance, guitare.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Afro-Congo",
    country: "RDC",
    bpm: "110-125",
    languages: ["Lingala"],
    systemPrompt: `Generate an authentic Afro-Congo track.
Country: RDC
Tempo: 110-125 BPM
Languages: Lingala
Style guide:
- Ndombolo, danse, club.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
];

// ─── Afrique Sud & Est ───────────────────────────────────────────────
const afriqueSudEst: MusicStyleKnowledge[] = [
  {
    name: "Amapiano",
    country: "Afrique du Sud",
    bpm: "110-115",
    languages: ["Zulu", "English"],
    systemPrompt: `Generate an authentic Amapiano track.
Country: Afrique du Sud
Tempo: 110-115 BPM
Languages: Zulu,English
Style guide:
- Log drum, deep house.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Bongo Flava",
    country: "Tanzanie",
    bpm: "90-110",
    languages: ["Swahili"],
    systemPrompt: `Generate an authentic Bongo Flava track.
Country: Tanzanie
Tempo: 90-110 BPM
Languages: Swahili
Style guide:
- Pop swahilie.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
];

// ─── Maghreb & Diaspora ──────────────────────────────────────────────
const maghrebDiaspora: MusicStyleKnowledge[] = [
  {
    name: "Raï Moderne",
    country: "Algérie",
    bpm: "95-115",
    languages: ["Arabe", "French"],
    systemPrompt: `Generate an authentic Raï Moderne track.
Country: Algérie
Tempo: 95-115 BPM
Languages: Arabe,French
Style guide:
- Darbuka, urbain.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Kizomba",
    country: "Angola",
    bpm: "86-96",
    languages: ["Portuguese"],
    systemPrompt: `Generate an authentic Kizomba track.
Country: Angola
Tempo: 86-96 BPM
Languages: Portuguese
Style guide:
- Sensuel, semba.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Pop R&B",
    country: "International",
    bpm: "90-110",
    languages: ["Any"],
    systemPrompt: `Generate an authentic Pop R&B track.
Country: International
Tempo: 90-110 BPM
Languages: Any
Style guide:
- Mélodies modernes.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
];

// ─── Gospel & Louange ────────────────────────────────────────────────
const gospel: MusicStyleKnowledge[] = [
  {
    name: "Gospel Américain",
    country: "USA",
    bpm: "70-100",
    languages: ["English"],
    systemPrompt: `Generate an authentic Gospel Américain track.
Country: USA
Tempo: 70-100 BPM
Languages: English
Style guide:
- Choeur, orgue.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Gospel Adoration",
    country: "RDC / Côte d'Ivoire",
    bpm: "65-78",
    languages: ["Français", "Lingala"],
    systemPrompt: `Generate a deeply moving, anointed African French Gospel Adoration song in the authentic Congolese and Ivorian worship style, inspired by Dena Mwana, Jonathan C. Gambela, Morijah, Deborah Lukalu, and Gaël Music.
Country: RDC / Côte d'Ivoire (Gospel Congolais & Ivoirien en français)
Tempo: 65-78 BPM (Slow & spiritual reverent worship)
Languages: Français (with subtle Lingala / local worship refrains)
Instrumentation & Sound Guide:
- Majestic grand piano chords, warm acoustic guitar picking, clean Congolese rumba-gospel electric guitar solos.
- Anointed soul-stirring lead vocals in French with authentic African worship cadence, heavenly polyphonic African choir call-and-response.
- Gentle orchestral string pads, subtle organ swells, emotional spiritual build-up, pure studio worship atmosphere.`,
    negativePrompt: "fast dance beat, club drums, aggressive synth, techno, rap, metal, hard rock, loud electronic percussions, bad mix",
  },
  {
    name: "Gospel Louange Africain",
    country: "RDC / Côte d'Ivoire",
    bpm: "105-120",
    languages: ["Français", "Lingala"],
    systemPrompt: `Generate a joyful, triumphant Congolese and Ivorian Gospel Praise song in French inspired by Dena Mwana, Deborah Lukalu, Morijah, and Mike Kalambay.
Country: RDC / Côte d'Ivoire (Gospel Louange Africain en français)
Tempo: 105-120 BPM
Languages: Français (with joyful local praise interjections)
Sound & Rhythm:
- Congolese rumba-gospel guitar sebene, joyful brass section, buoyant afro-gospel drums and tam-tams.
- Powerful lead vocals in French with authentic African vocal accent, energetic polyphonic choir celebration.`,
    negativePrompt: "metal, hard rock, dark ambient, slow depression, bad mix, off beat",
  },
  {
    name: "Gospel Africain",
    country: "Afrique",
    bpm: "85-115",
    languages: ["Français", "Lingala"],
    systemPrompt: `Generate an authentic Francophone African Gospel song inspired by Dena Mwana, Morijah, and Jonathan C. Gambela.
Country: Afrique francophone (RDC / Côte d'Ivoire)
Tempo: 85-115 BPM
Languages: Français
Sound guide:
- Piano, acoustic guitar, clean guitar sebene, anointed African choir, spiritual atmosphere in French with authentic African vocal delivery.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Gospel Européen",
    country: "Europe",
    bpm: "70-90",
    languages: ["French"],
    systemPrompt: `Generate an authentic Gospel Européen track.
Country: Europe
Tempo: 70-90 BPM
Languages: French
Style guide:
- Classique.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
];

// ─── Europe & Pop Française ──────────────────────────────────────────
const europe: MusicStyleKnowledge[] = [
  {
    name: "Chanson Française",
    country: "France",
    bpm: "70-100",
    languages: ["French"],
    systemPrompt: `Generate an authentic Chanson Française track.
Country: France
Tempo: 70-100 BPM
Languages: French
Style guide:
- Poétique.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Afro Trap France",
    country: "France",
    bpm: "100-140",
    languages: ["French"],
    systemPrompt: `Generate an authentic Afro Trap France track.
Country: France
Tempo: 100-140 BPM
Languages: French
Style guide:
- Trap afro.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Soul Jazz",
    country: "International",
    bpm: "70-95",
    languages: ["English"],
    systemPrompt: `Generate an authentic Soul Jazz track.
Country: International
Tempo: 70-95 BPM
Languages: English
Style guide:
- Saxophone.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "R&B Français",
    country: "France / Afrique",
    bpm: "88-102",
    languages: ["Français"],
    systemPrompt: `Generate a deeply emotional, highly melodic, commercial Afro-R&B & Pop Urbaine hit in French inspired by Hiro ("C'est Mort"), KeBlack ("J'ai Déconné"), Locko ("Let Go"), Tayc, Dadju, and Singuila.
Country: France / Afrique (Afro R&B & Urban Pop)
Tempo: 88-102 BPM
Languages: Français (with modern urban vocal phrasing)
Melody & Production Guide:
- Smooth acoustic & electric guitar arpeggios, warm Rhodes piano chords, emotional synth pads, deep bouncy 808 sub-bass.
- Expressive, sensual lead vocal performance with smooth vocal runs, falsetto accents, and rich multi-layered backing choir harmonies.
- Groovy afro-r&b drums (crisp rimshots, soft shakers, percussive bongo/conga touches).
- Extremely catchy, emotional singalong chorus hook, romantic & apologetic storytelling attitude.
- Polished, radio-ready studio mix with high emotional resonance.`,
    negativePrompt: "metal, hard rock, monotonous trap, robotic vocoder, aggressive noise, bad mix, off beat, low quality",
  },
  {
    name: "Rap Français",
    country: "France",
    bpm: "85-150",
    languages: ["French"],
    systemPrompt: `Generate an authentic Rap Français track.
Country: France
Tempo: 85-150 BPM
Languages: French
Style guide:
- Boom bap / trap.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
];

// ─── Rap International ───────────────────────────────────────────────
const rapInternational: MusicStyleKnowledge[] = [
  {
    name: "Rap Américain",
    country: "USA",
    bpm: "90-160",
    languages: ["English"],
    systemPrompt: `Generate an authentic Rap Américain track.
Country: USA
Tempo: 90-160 BPM
Languages: English
Style guide:
- Trap Atlanta, NY.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "R&B Américain",
    country: "USA",
    bpm: "70-100",
    languages: ["English"],
    systemPrompt: `Generate an authentic R&B Américain track.
Country: USA
Tempo: 70-100 BPM
Languages: English
Style guide:
- Trap soul.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
];

// ─── Registre complet ────────────────────────────────────────────────
export const ALL_MUSIC_KNOWLEDGE: MusicStyleKnowledge[] = [
  ...afriqueOuest,
  ...afriqueCentrale,
  ...afriqueSudEst,
  ...maghrebDiaspora,
  ...gospel,
  ...europe,
  ...rapInternational,
];

/**
 * Lookup map indexé par nom de style pour un accès O(1).
 * Gère aussi les variantes de noms courants (ex: "Raï / Pop Urbaine" → "Raï Moderne").
 */
const knowledgeMap = new Map<string, MusicStyleKnowledge>();

// Index principal
for (const style of ALL_MUSIC_KNOWLEDGE) {
  knowledgeMap.set(style.name, style);
}

// Alias pour correspondre aux noms utilisés dans STYLE_CATEGORIES de create/page.tsx
const ALIASES: Record<string, string> = {
  "Raï / Pop Urbaine": "Raï Moderne",
  "Pop / R&B": "Pop R&B",
  "Soul / Jazz France": "Soul Jazz",
  "Rap Ivoire / Drill": "Rap Ivoire",
  // Anciens noms pouvant apparaître dans la BDD
  "Ndombolo": "Afro-Congo",
  "Afropop": "Afrobeats",
  "Highlife": "Afrobeats",
};

for (const [alias, canonical] of Object.entries(ALIASES)) {
  const style = knowledgeMap.get(canonical);
  if (style) {
    knowledgeMap.set(alias, style);
  }
}

/**
 * Retourne les connaissances musicales pour un style donné.
 * Retourne `undefined` si le style n'est pas trouvé dans la knowledge base.
 */
export function getStyleKnowledge(styleName: string): MusicStyleKnowledge | undefined {
  return knowledgeMap.get(styleName);
}

/**
 * Construit le tag de style enrichi pour l'API Suno à partir du knowledge.
 *
 * Si le style est trouvé dans la knowledge base, le tag inclut :
 *   - Le nom du genre + pays
 *   - Le BPM précis
 *   - Le voiceTag (male/female/human vocal)
 *
 * Sinon, retourne le nom du style + voiceTag tel quel (fallback).
 *
 * Le résultat est toujours tronqué à 120 caractères (limite Suno V3.5).
 */
export function buildEnrichedStyle(styleNames: string[], voiceTag: string): string {
  if (styleNames.length === 0) return voiceTag;

  const parts: string[] = [];
  let accentTag = "";

  for (const name of styleNames) {
    const knowledge = getStyleKnowledge(name);
    if (knowledge) {
      if (knowledge.name === "Coupé-Décalé") {
        parts.push(`Coupé-Décalé, Côte d'Ivoire, 128 BPM, melodic electric guitar sebene solo, catchy synth lead hook, bouncy bass`);
        if (!accentTag) accentTag = "authentic West African vocal accent";
      } else if (knowledge.name === "Rap Ivoire") {
        parts.push(`Rap Ivoire, Afro Drill, Côte d'Ivoire, 140 BPM, heavy sliding 808 sub bass, fast hi-hat glides, dark synth lead, nouchi rap flow`);
        if (!accentTag) accentTag = "authentic Abidjan nouchi vocal accent";
      } else if (knowledge.name === "Zouglou") {
        parts.push(`Zouglou, Côte d'Ivoire, 108 BPM, heavy acoustic West African tam-tam percussions, woyo djembe, guitar sebene solo, polyphonic woyo choir`);
        if (!accentTag) accentTag = "authentic West African vocal accent, raw woyo choir";
      } else if (knowledge.name === "Musique Urbaine Ivoire") {
        parts.push(`Musique Urbaine Ivoire, Côte d'Ivoire, 100 BPM, powerful expressive vocals, afro guitar riffs, brass stabs`);
        if (!accentTag) accentTag = "authentic West African vocal accent";
      } else if (knowledge.name === "Gospel Adoration") {
        parts.push(`Gospel Adoration, RDC, Côte d'Ivoire, 72 BPM, slow congolese worship, grand piano, acoustic guitar, clean rumba guitar solo, anointed african choir, french worship`);
        if (!accentTag) accentTag = "authentic African worship vocal accent";
      } else {
        parts.push(`${knowledge.name}, ${knowledge.country}, ${knowledge.bpm} BPM`);
      }

      // Détection automatique de l'accent vocal selon le pays / style
      if (!accentTag) {
        const countryLower = knowledge.country.toLowerCase();
        if (["côte d'ivoire", "rdc", "nigeria", "sénégal", "afrique", "tanzanie", "angola"].includes(countryLower)) {
          accentTag = "authentic African vocal accent";
        } else if (knowledge.name === "Afro Trap France") {
          accentTag = "French urban vocal accent with African rhythmic inflections";
        } else if (["france", "europe"].includes(countryLower)) {
          accentTag = "authentic French vocal accent";
        } else if (["usa", "international"].includes(countryLower)) {
          accentTag = "authentic American vocal accent";
        }
      }
    } else {
      parts.push(name);
    }
  }

  const finalAccent = accentTag ? `, ${accentTag}` : "";
  let result = parts.join(", ") + `, ${voiceTag}` + finalAccent;

  // Limite recommandée Suno V4 / KIE.AI : 180 caractères max
  if (result.length > 180) {
    result = result.substring(0, 177) + "...";
  }

  return result;
}

/**
 * Construit un prompt de paroles enrichi avec les informations du knowledge.
 * Ajoute le pays, les langues et les directives de production au prompt de paroles.
 */
export function buildEnrichedLyricsPrompt(
  styleName: string,
  subject: string,
  isDuo: boolean = false
): string {
  const knowledge = getStyleKnowledge(styleName);
  const duoDirective = isDuo 
    ? " C'est un DUO HOMME ET FEMME. Tu DOIS structurer impérativement les paroles avec des balises de rôles alternés : [Homme], [Femme], et [Ensemble] (ou [Refrain - Ensemble]) pour créer un vrai dialogue vivant entre les deux voix." 
    : "";

  if (knowledge) {
    const langs = knowledge.languages.join(", ");
    let accentDirective = "Accent et phrasé authentiques de l'artiste.";
    const countryLower = knowledge.country.toLowerCase();

    if (["côte d'ivoire", "rdc", "nigeria", "sénégal", "afrique", "tanzanie", "angola"].includes(countryLower)) {
      accentDirective = "IMPORTANT : Le texte et la livraison vocale DOIVENT avoir l'accent, le rythme et la cadence authentique africaine (expressions locales imagées, intonations chaleureuses).";
    } else if (knowledge.name === "Afro Trap France") {
      accentDirective = "IMPORTANT : Le texte combine le phrasé urbain français avec des expressions et intonations afro-urbaines.";
    } else if (["france", "europe"].includes(countryLower)) {
      accentDirective = "IMPORTANT : Accent et prononciation française claire et authentique.";
    } else if (["usa"].includes(countryLower)) {
      accentDirective = "IMPORTANT : Accent et flow américain authentique.";
    }

    return `Chanson de style ${knowledge.name} (${knowledge.country}). Langues possibles : ${langs}. Sujet : ${subject}. Tempo : ${knowledge.bpm} BPM.${duoDirective} ${accentDirective} Format court avec intro, couplets alternés, refrain et fin nette.`;
  }

  // Fallback sans knowledge
  return `Chanson en français. Sujet : ${subject}.${duoDirective} Format court avec intro, couplets, refrain et fin nette.`;
}

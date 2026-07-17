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
    bpm: "124-128",
    languages: ["Français", "Nouchi"],
    systemPrompt: `Generate an authentic Coupé-Décalé track.
Country: Côte d'Ivoire
Tempo: 124-128 BPM
Languages: Français,Nouchi
Style guide:
- Atalaku, dance, club, bass puissante.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Rap Ivoire",
    country: "Côte d'Ivoire",
    bpm: "90-150",
    languages: ["Français", "Nouchi"],
    systemPrompt: `Generate an authentic Rap Ivoire track.
Country: Côte d'Ivoire
Tempo: 90-150 BPM
Languages: Français,Nouchi
Style guide:
- Flow nouchi, 808, trap ivoire.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
  },
  {
    name: "Zouglou",
    country: "Côte d'Ivoire",
    bpm: "92-108",
    languages: ["Français", "Nouchi"],
    systemPrompt: `Generate an authentic Zouglou track.
Country: Côte d'Ivoire
Tempo: 92-108 BPM
Languages: Français,Nouchi
Style guide:
- Live band, choeurs, message social.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
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
    name: "Gospel Africain",
    country: "Afrique",
    bpm: "95-125",
    languages: ["French", "English"],
    systemPrompt: `Generate an authentic Gospel Africain track.
Country: Afrique
Tempo: 95-125 BPM
Languages: French,English
Style guide:
- Percussions, danse.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
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
    country: "France",
    bpm: "80-100",
    languages: ["French"],
    systemPrompt: `Generate an authentic R&B Français track.
Country: France
Tempo: 80-100 BPM
Languages: French
Style guide:
- R&B moderne.
- Commercial quality
- Rich arrangement
- Emotional authenticity
- Modern mix & mastering
- Strong hook
- Respect the cultural identity of the genre.`,
    negativePrompt: "metal, hard rock, bad mix, off beat, low quality, distorted vocals",
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

  for (const name of styleNames) {
    const knowledge = getStyleKnowledge(name);
    if (knowledge) {
      // Construire un tag compact mais riche à partir du knowledge
      parts.push(`${knowledge.name}, ${knowledge.country}, ${knowledge.bpm} BPM`);
    } else {
      // Fallback : utiliser le nom brut
      parts.push(name);
    }
  }

  let result = parts.join(", ") + `, ${voiceTag}`;

  // Limite Suno V3.5 : 120 caractères max
  if (result.length > 120) {
    result = result.substring(0, 117) + "...";
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
): string {
  const knowledge = getStyleKnowledge(styleName);

  if (knowledge) {
    const langs = knowledge.languages.join(", ");
    return `Chanson de style ${knowledge.name} (${knowledge.country}). Langues possibles : ${langs}. Sujet : ${subject}. Tempo : ${knowledge.bpm} BPM. Format court avec intro, couplet, refrain, fin nette.`;
  }

  // Fallback sans knowledge
  return `Chanson en français. Sujet : ${subject}. Format court avec intro, couplet, refrain, fin nette.`;
}

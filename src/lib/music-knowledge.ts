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
    name: "Musique Rap Décalé Urban",
    country: "Côte d'Ivoire",
    bpm: "128-135",
    languages: ["Français", "Nouchi"],
    systemPrompt: `Generate a highly melodic, energetic, modern fusion hit of Rap Ivoire, Coupé-Décalé club bounce, and Abidjan Urban Pop inspired by Didi B, Serge Beynaud, DJ Arafat, and Himra.
Country: Côte d'Ivoire (Abidjan)
Tempo: 128-135 BPM
Languages: Français, Nouchi
Melody & Rhythm Fusion Guide:
- Melodic african electric guitar sebene solo riffs, fast Nouchi rap flow, bright catchy synth lead melodies.
- Heavy sliding 808 sub bass combined with bouncy coupé-décalé drum beat, marimba & synth brass hooks.
- Atalaku hypeman vocal shouts, roukaskas drums, boucan ambiance, explosive Abidjan club dance groove.
- Polished studio mix, high energy, commercial hit arrangement.`,
    negativePrompt: "metal, hard rock, monotonous beat, no melody, bad mix, off beat, low quality, distorted vocals, slow tempo",
  },
  {
    name: "Musique Urbaine & Zouglou",
    country: "Côte d'Ivoire",
    bpm: "102-114",
    languages: ["Français", "Nouchi", "Dioula", "Baoulé"],
    systemPrompt: `Generate a deeply emotional, highly melodic Ivorian Urban Pop & Zouglou acoustic song inspired by Roseline Layo, Josey, Espoir 2000, Magic System, Yodé & Siro, and VDA.
Country: Côte d'Ivoire (Abidjan)
Tempo: 102-114 BPM
Languages: Français, Nouchi, Dioula, Baoulé
Melody & Rhythm Fusion Guide:
- Heavy acoustic West African tam-tam percussions, authentic woyo djembe drums, shekere shaker, metallic cowbell rhythm.
- Clean high-life guitar sebene solo, acoustic guitar arpeggios, accordion lead accents, bouncy bassline.
- Storytelling lead vocals with authentic African vocal accent, warm polyphonic Woyo choir call-and-response harmonies.
- Pure acoustic live band feel combined with modern Abidjan urban production.`,
    negativePrompt: "metal, hard rock, monotonous electronic beat, aggressive noise, bad mix, off beat, low quality",
  },
  {
    name: "Afro Zouk",
    country: "Côte d'Ivoire / Gabon / Antilles / Diaspora",
    bpm: "84-96",
    languages: ["Français", "English", "Créole"],
    systemPrompt: `Generate a sensual, romantic, highly melodic Afro-Zouk & Zouk Love hit in French or English inspired by Monique Séka ("First Love"), Oliver N'Goma ("Bane"), Nelson Freitas, Kaysha, Fanny J, and Princess Lover.
Country: Côte d'Ivoire / Gabon / Antilles / Diaspora (Sensual Afro-Zouk & Zouk Love)
Tempo: 84-96 BPM (intimate, smooth, danceable sensual pulse)
Languages: Français, English, Bilingue (FR/EN)
Sound & Production Guide:
- Lush digital synthesizer pads, classic Zouk chime keyboard chords, warm Rhodes piano, clean Caribbean guitar arpeggios with West African guitar licks.
- Smooth Zouk Love electronic drum pattern (bouncy 808 sub-bass, crisp snare/shaker) combined with soft African djembe percussions.
- Vocals: Silky, sensual, highly romantic organic human lead vocals in French or English with rich 3-part backing harmonies and intimate vocal ad-libs ("Doudou", "Mon amour", "Stay with me").
- Production: Crystalline radio-ready mix, spatial stereo warmth, ultra-sensual atmosphere.`,
    negativePrompt: "metal, hard rock, monotonous trap, aggressive noise, robotic autotune, metallic vocoder, fast techno, bad mix, off beat",
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
    name: "Afro Ambiance & Chœurs",
    country: "Côte d'Ivoire / RDC / Nigeria",
    bpm: "124-128",
    languages: ["Français", "Nouchi", "Lingala"],
    systemPrompt: `Generate a high-energy, explosive, highly danceable Afro-Pop Ambiance & Ndombolo Sebene hit inspired by Tim Storm ("Suspendu"), Joy Awu ("Pour Toujours"), and Kano Choir ("Tout donner x Rebanav 126 BPM Remix").
Genre: African Afro-Pop Ambiance / Ndombolo Sebene / Choir-backed Afrobeat Dance (124-128 BPM)
Tempo: 124-128 BPM (explosive, highly danceable, joyful party & love bounce)
Languages: Français, Nouchi (authentic West African vocal accent)
Sound & Instrumentation:
- Fast highlife & Congolese Rumba electric guitar sebene solo, bright synth brass hooks, bouncy bassline.
- Heavy West African tam-tam percussions, authentic woyo djembe drums, metallic cowbell claps, roukaskas drums.
- Energetic lead singer with authentic African vocal accent and modern urban energy.
- Massive polyphonic choir singing energetic call-and-response on every line.
- Explosive Atalaku dance animation breakdown with whistles, clapping, and celebration energy.
- Production: Pristine commercial studio mix, maximum energy, radio-ready hit mastering.`,
    negativePrompt: "metal, hard rock, dark ambient, sad depression, slow ballad, bad mix, off beat, low quality, distorted audio, robotic autotune",
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
    name: "Afro Pop & R&B Urbain",
    country: "France / Afrique",
    bpm: "102-114",
    languages: ["Français"],
    systemPrompt: `Generate a platinum-certified, radio-ready Afro-Pop & R&B Urbain club & love anthem inspired by Hiro ("C'est Mort"), KeBlack ("J'ai Déconné", "Bazardée"), Naza ("Sac à dos", "MMM"), and Vegedream ("Ramenez la coupe à la maison", "Elle est bonne sa mère").
Genre: Modern French Afro-Pop & R&B Urbain
Tempo: 102-114 BPM (infectious afrobeat club bounce & sensual R&B groove)
Vocals: Organic warm expressive male lead singer with smooth natural vocal phrasing, infectious singalong refrain hook, and lush backing vocal harmonies.
Instrumentation: Acoustic guitar arpeggios, bouncy 808 sub-bass, bright afrobeat brass stabs, clean Rhodes piano chords, crisp rimshot percussion pattern.
Arrangement: Radio hit structure, catchy chorus hook, dynamic verse, swelling pre-chorus, energetic guitar solo bridge, fading chorus outro.
Production Quality: Pristine commercial studio mix, radio-ready mastering, warm natural vocal presence.`,
    negativePrompt: "metal, hard rock, monotonous trap, robotic autotune, metallic vocoder, distorted audio, off beat, low quality",
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

// ─── Reggae & Afro-Reggae 🇯🇲🌍 ──────────────────────────────────────
const reggae: MusicStyleKnowledge[] = [
  {
    name: "Reggae",
    country: "Jamaïque / Afrique (International)",
    bpm: "72-84",
    languages: ["Français", "English", "Patois"],
    systemPrompt: `Generate an authentic, soul-stirring Reggae & Afro-Reggae roots hit in French or English inspired by Bob Marley ("One Love", "Redemption Song"), Alpha Blondy ("Sweet Fanta Diallo", "Brigadier Sabari"), Tiken Jah Fakoly ("Le Balayeur", "Plus rien ne m'étonne"), and Lucky Dube ("Remember Me").
Country: Jamaïque / Afrique (Sensual Roots Reggae & Afro-Reggae)
Tempo: 72-84 BPM (one-drop rhythm, laid-back roots reggae pulse)
Languages: Français, English, Bilingue (FR/EN)
Sound & Production Guide:
- Clean off-beat electric guitar skank, deep warm bass guitar line, Hammond organ bubble groove, roots brass section (tenor sax, trumpet, trombone).
- Heavy one-drop reggae drum beat (deep kick on beat 3, crisp rimshot, hi-hat syncopation), traditional Nyabinghi percussion (kete drum, shaker, guiro).
- Vocals: Soulful, conscious, warm organic human lead singer with passionate delivery, supported by rich 3-part backing vocal harmonies and conscious chant refrains.
- Production: Warm analog studio mix, deep low-end bass resonance, spatial dub reverb, radio-ready mastering.`,
    negativePrompt: "metal, hard rock, aggressive EDM, electronic techno, trap 808 glides, robotic autotune, metallic vocoder, bad mix, off beat",
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

// ─── Piano Ballads, Pop & Soul Vocale ────────────────────────────────
const popSoulBallads: MusicStyleKnowledge[] = [
  {
    name: "Piano Ballad Émotion",
    country: "International",
    bpm: "72-85",
    languages: ["French", "English"],
    systemPrompt: `Generate a soul-stirring, emotional piano ballad hit inspired by Lewis Capaldi ("Someone You Loved"), John Legend ("All of Me"), Christina Aguilera & A Great Big World ("Say Something"), Kodaline ("All I Want"), and Lukas Graham ("7 Years").
Country: International
Tempo: 72-85 BPM
Languages: French, English
Style guide:
- Cinematic grand piano, expressive solo acoustic piano chords, swelling string quartet (cellos, violins).
- Raw, emotional lead vocal performance with rich vocal range, falsetto climax, and deep tear-jerking delivery.
- Intimate piano intro, swelling emotional building, massive chorus hook, orchestral string climax bridge.
- Commercial radio mastering, crystal-clear vocal acoustic mix.`,
    negativePrompt: "metal, hard rock, monotonous trap, robotic autotune, aggressive synth, loud electronic beat, bad mix, distorted audio",
  },
  {
    name: "Soul Vocale & Powerhouse",
    country: "International",
    bpm: "75-92",
    languages: ["French", "English"],
    systemPrompt: `Generate a powerful, explosive Soul & Vocal Powerhouse anthem inspired by Teddy Swims ("Lose Control"), Sam Smith ft. Mary J. Blige ("Stay With Me"), Whitney Houston ("I Will Always Love You"), Cynthia Erivo, Andra Day ("Rise Up"), and Jessie J.
Country: International
Tempo: 75-92 BPM
Languages: French, English
Style guide:
- Heavy gospel Hammond B3 organ, grand piano chords, warm vintage brass section, deep sub-bass, acoustic drums.
- Incredible powerhouse soul singer with massive vocal range, gritty emotional raspy belts, falsetto runs, 4-part gospel choir harmonies.
- Legendary studio soul mix, wide stereo image, epic emotional resonance.`,
    negativePrompt: "metal, hard rock, aggressive EDM, harsh noise, robotic autotune, flat monotone vocal, bad mix",
  },
  {
    name: "Pop Acoustique & Piano",
    country: "International",
    bpm: "85-102",
    languages: ["French", "English"],
    systemPrompt: `Generate a warm, catchy acoustic Pop & Piano hit inspired by Ed Sheeran ("Perfect", "Thinking Out Loud"), Justin Bieber ("Love Yourself", "Intentions"), and Wiz Khalifa ft. Charlie Puth ("See You Again").
Country: International
Tempo: 85-102 BPM
Languages: French, English
Style guide:
- Fingerpicked acoustic guitar, clean piano chords, warm sub-bass, light bouncy percussions (snap, shaker, soft kick).
- Smooth, intimate, conversational lead singer with catchy pop-R&B phrasing, silky vocal harmonies.
- Radio-hit structure, infectious singalong hook chorus.`,
    negativePrompt: "metal, hard rock, heavy synth noise, distorted autotune, bad mix",
  },
  {
    name: "Dark Pop Ambient",
    country: "International",
    bpm: "65-80",
    languages: ["French", "English"],
    systemPrompt: `Generate a haunting, beautiful Dark Pop & Cinematic Ambient hit inspired by Billie Eilish & Khalid ("Lovely").
Country: International
Tempo: 65-80 BPM
Languages: French, English
Style guide:
- Minimalist melancholic piano motifs, dark cinematic cello & string quartet, deep atmospheric sub-bass drone.
- Intimate, whispery yet powerful vocal duet with breathy harmonies, soaring falsetto notes.
- Spatial cinematic audio, crystalline vocals, deep sub-bass warmth.`,
    negativePrompt: "metal, hard rock, upbeat disco, loud drums, party pop, bad mix",
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
  ...reggae,
  ...popSoulBallads,
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
  "Coupé-Décalé": "Musique Rap Décalé Urban",
  "Rap Décalé": "Musique Rap Décalé Urban",
  "Zouglou": "Musique Urbaine & Zouglou",
  "Musique Urbaine Ivoire": "Musique Urbaine & Zouglou",
  "Raï / Pop Urbaine": "Raï Moderne",
  "Pop / R&B": "Pop R&B",
  "Soul / Jazz France": "Soul Jazz",
  "Rap Ivoire / Drill": "Rap Ivoire",
  "Afro Gospel Urbain": "Afro Ambiance & Chœurs",
  "Afrobeat Ambiance": "Afro Ambiance & Chœurs",
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
export function buildEnrichedStyle(styleNames: string[], voiceOrTag: string = "Homme"): string {
  // 1. Tag vocal avec priorité absolue en tête de prompt
  let leadVoiceTag = "";
  if (voiceOrTag === "Duo") {
    leadVoiceTag = "duet, male and female vocals, alternating lead duet";
  } else if (voiceOrTag === "Femme") {
    leadVoiceTag = "solo female vocals, warm expressive melodic voice";
  } else if (voiceOrTag === "Homme") {
    leadVoiceTag = "solo male vocals, warm expressive melodic voice";
  } else {
    leadVoiceTag = voiceOrTag.length > 50 ? voiceOrTag.substring(0, 50) : voiceOrTag;
  }

  if (styleNames.length === 0) {
    return `${leadVoiceTag}, Afrobeats, 108 BPM, highly melodic guitar riffs, catchy earworm chorus, rich harmonies, no vocoder`.substring(0, 190);
  }

  const parts: string[] = [];

  for (const name of styleNames) {
    const knowledge = getStyleKnowledge(name);
    if (knowledge) {
      if (knowledge.name === "Musique Rap Décalé Urban" || knowledge.name === "Coupé-Décalé") {
        parts.push(`Rap Ivoire, Coupe-Decale, 130 BPM, highly melodic sebene guitar solo, catchy synth lead, 808 bass`);
      } else if (knowledge.name === "Musique Urbaine & Zouglou" || knowledge.name === "Zouglou" || knowledge.name === "Musique Urbaine Ivoire") {
        parts.push(`Zouglou Ivoire, 108 BPM, highly melodic acoustic guitar, woyo choir, tam-tam, sebene`);
      } else if (knowledge.name === "Piano Ballad Émotion") {
        parts.push(`Piano Ballad, 78 BPM, highly melodic grand piano, swelling strings, cello`);
      } else if (knowledge.name === "Soul Vocale & Powerhouse") {
        parts.push(`Soul Gospel R&B, 85 BPM, highly melodic organ, grand piano, powerhouse soul voice`);
      } else if (knowledge.name === "Pop Acoustique & Piano") {
        parts.push(`Acoustic Pop, 92 BPM, highly melodic acoustic guitar, piano, catchy singalong hook`);
      } else if (knowledge.name === "Afro Ambiance & Chœurs" || knowledge.name === "Afro Gospel Urbain") {
        parts.push(`African Sebene, Coupe Decale, 126 BPM, highly melodic electric guitar solo, choir response`);
      } else if (knowledge.name === "R&B Français") {
        parts.push(`Afro R&B, French Urban, 92 BPM, highly melodic Rhodes chords, silky harmonies, deep 808`);
      } else if (knowledge.name === "Afro Pop & R&B Urbain") {
        parts.push(`Afro Pop, French R&B, 108 BPM, highly melodic guitar arpeggios, bouncy 808`);
      } else if (knowledge.name === "Afro Zouk") {
        parts.push(`Afro-Zouk, Zouk Love, 90 BPM, highly melodic digital chime keys, sensual synth pads, smooth bass`);
      } else if (knowledge.name === "Reggae") {
        parts.push(`Roots Reggae, 76 BPM, highly melodic organ bubble, roots brass, guitar skank, bass groove`);
      } else {
        parts.push(`${knowledge.name}, highly melodic${knowledge.bpm ? `, ${knowledge.bpm} BPM` : ''}`);
      }
    } else {
      parts.push(name);
    }
  }

  let result = `${leadVoiceTag}, ` + parts.join(", ") + `, catchy earworm melody, rich harmonies, radio edit, no vocoder`;

  // Limite ABSOLUE Suno V4 : Strictement <= 190 caractères (marge de sécurité sous 200)
  if (result.length > 190) {
    const cut = result.substring(0, 190);
    const lastComma = cut.lastIndexOf(",");
    result = lastComma > 70 ? cut.substring(0, lastComma) : cut;
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
    ? " C'est un DUO HOMME ET FEMME. Tu DOIS structurer impérativement les paroles avec des balises de rôles alternés : [Couplet 1 - Male Vocals], [Couplet 2 - Female Vocals], [Pre-Refrain - Duet], [Refrain - Male & Female Duet], [Male]:, [Female]:, [Both]:, et [Outro - Duet] [End]." 
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

    return `Chanson de style ${knowledge.name} (${knowledge.country}). Langues possibles : ${langs}. Sujet : ${subject}. Tempo : ${knowledge.bpm} BPM.${duoDirective} ${accentDirective} Format standard radio court (3min à 3min30s max) avec intro, couplets alternés, refrain explosif et fin nette avec [Outro - Fade Out] [End].`;
  }

  // Fallback sans knowledge
  return `Chanson en français. Sujet : ${subject}.${duoDirective} Format standard radio court (3min à 3min30s max) avec intro, couplets, refrain explosif et fin nette avec [Outro - Fade Out] [End].`;
}

export interface AfricanProfile {
  id: string;
  label: string;
  description: string;
  promptInstruction: string;
}

export interface AfricanCategoryProfiles {
  categoryId: string; // Fait le lien avec les styles de l'interface (ex: 'Coupé-Décalé')
  categoryLabel: string;
  profiles: AfricanProfile[];
}

export const AFRICAN_PROFILES: AfricanCategoryProfiles[] = [
  {
    categoryId: "Zouglou",
    categoryLabel: "Zouglou ivoirien",
    profiles: [
      {
        id: "zouglou-chorale",
        label: "Chorale de quartier",
        description: "Chœurs masculins et féminins en appel-réponse, refrains collectifs faciles à reprendre, applaudissements naturels.",
        promptInstruction: "Warm Ivorian zouglou group vocals, call-and-response chorus, handclaps, communal street-choir energy."
      },
      {
        id: "zouglou-chronique",
        label: "Chronique sociale",
        description: "Chant parlé expressif, paroles humaines et imagées sur le quotidien, humour tendre, solidarité et espoir.",
        promptInstruction: "Narrative zouglou delivery with conversational African French phrasing, social storytelling, warmth and gentle humor."
      },
      {
        id: "zouglou-percussions",
        label: "Percussions ambiance facile",
        description: "Tambours vivants, grattements métalliques discrets, bouteilles ou petites percussions, groove organique.",
        promptInstruction: "Organic zouglou percussion: hand drums, shakers, metallic scrapes, bottle-like accents, lively human timing."
      },
      {
        id: "zouglou-maquis",
        label: "Maquis dansant",
        description: "Basse ronde, guitare africaine légère, rythme médium festif, énergie de fête populaire.",
        promptInstruction: "Mid-tempo Ivorian dance groove with rounded bass, light African guitar, festive maquis atmosphere."
      },
      {
        id: "zouglou-final",
        label: "Final fédérateur",
        description: "Refrain qui monte progressivement, réponses de foule, émotion positive et très dansante.",
        promptInstruction: "Build toward a joyful communal finale with layered chants, claps, uplifting harmonies and danceable momentum."
      }
    ]
  },
  {
    categoryId: "Coupé-Décalé",
    categoryLabel: "Coupé-décalé ivoirien",
    profiles: [
      {
        id: "coupe-club",
        label: "Club à quatre temps",
        description: "Rythme électronique direct, kick régulier, basse énergique et danse immédiate.",
        promptInstruction: "Fast Ivorian club groove, driving four-on-the-floor beat, punchy electronic bass and high dance energy."
      },
      {
        id: "coupe-sebene",
        label: "Sébène électrique",
        description: "Guitare vive et répétitive, motifs dansants, montée progressive.",
        promptInstruction: "Bright repetitive sebene-inspired electric guitar patterns, rising dance intensity and celebratory movement."
      },
      {
        id: "coupe-animation",
        label: "Animation et réponses",
        description: "Voix principale animée, cris festifs, chœurs courts et mémorables.",
        promptInstruction: "Animated lead vocals, short crowd responses, celebratory shouts and catchy dance commands."
      },
      {
        id: "coupe-percussions",
        label: "Percussions urbaines",
        description: "Kicks secs, congas synthétiques, claps nets, claps nets, breaks pour la danse.",
        promptInstruction: "Crisp electronic percussion, synthetic congas, sharp claps and dance-break transitions."
      },
      {
        id: "coupe-luxe",
        label: "Luxe festif sans excès",
        description: "Mélodie brillante, ambiance nocturne, confiance et joie, sans citer de personne.",
        promptInstruction: "Glossy celebratory nightlife mood, bright melodic hooks, confident joyful delivery, no artist references."
      }
    ]
  },
  {
    categoryId: "Afrobeats",
    categoryLabel: "Afrobeats / Afro-pop ouest-africain",
    profiles: [
      {
        id: "afro-guitare",
        label: "Guitare highlife",
        description: "Guitare syncopée et lumineuse, basse souple, harmonie chaleureuse.",
        promptInstruction: "Syncopated highlife-influenced guitar, warm bass groove and bright West African pop harmony."
      },
      {
        id: "afro-rb",
        label: "Afro-R&B sensuel",
        description: "Voix douces, percussions feutrées, mélodie romantique et aérienne.",
        promptInstruction: "Smooth Afro-R&B vocals, restrained percussion, intimate melodic phrasing and warm atmosphere."
      },
      {
        id: "afro-solaire",
        label: "Afropop solaire",
        description: "Refrain immédiat, synthés clairs, percussions souples et énergie positive.",
        promptInstruction: "Sunny Afropop hook, clean synths, buoyant percussion and optimistic danceable feel."
      },
      {
        id: "afro-organique",
        label: "Afro-fusion organique",
        description: "Percussions africaines et instruments modernes équilibrés, son texturé.",
        promptInstruction: "Organic Afro-fusion with hand percussion, modern drums, African melodic textures and balanced production."
      },
      {
        id: "afro-fete",
        label: "Fête pan-africaine",
        description: "Chœurs multicouches, groove accessible, énergie de célébration.",
        promptInstruction: "Pan-African celebratory groove, layered vocal responses, accessible rhythmic hook and joyful uplift."
      }
    ]
  },
  {
    categoryId: "Amapiano",
    categoryLabel: "Amapiano sud-africain",
    profiles: [
      {
        id: "ama-logdrum",
        label: "Log drum profond",
        description: "Basse log drum caractéristique, grave rebondissant et hypnotique.",
        promptInstruction: "Deep rolling log-drum bassline, hypnotic low-end pulse and spacious amapiano groove."
      },
      {
        id: "ama-piano",
        label: "Piano soulful",
        description: "Accords de piano jazzy, nappes douces, mélodie émotionnelle.",
        promptInstruction: "Soulful jazzy piano chords, soft pads and emotionally warm amapiano harmony."
      },
      {
        id: "ama-private",
        label: "Private-school élégant",
        description: "Production propre, minimaliste, raffinée et dansante.",
        promptInstruction: "Polished elegant amapiano, minimal percussion, refined chords and relaxed dance-floor feel."
      },
      {
        id: "ama-street",
        label: "Street amapiano",
        description: "Percussions plus rugueuses, chants courts, énergie de rue.",
        promptInstruction: "Raw street amapiano percussion, short vocal chants, gritty township dance energy."
      },
      {
        id: "ama-lente",
        label: "Progression lente",
        description: "Tempo détendu, construction graduelle et longue section instrumentale.",
        promptInstruction: "Relaxed mid-tempo amapiano, gradual arrangement, extended instrumental groove and spacious mix."
      }
    ]
  },
  {
    categoryId: "Rap Ivoire / Drill",
    categoryLabel: "Rap ivoirien / Afro-rap",
    profiles: [
      {
        id: "rap-iv-narratif",
        label: "Rap de quartier narratif",
        description: "Flow clair, humour, nouchi léger et récit de faits de société.",
        promptInstruction: "Ivorian Afro-rap with clear narrative flow, light Nouchi expressions, social observation and wit."
      },
      {
        id: "rap-iv-trap",
        label: "Trap ivoire mélodique",
        description: "808 profondes, refrains chantés, son urbain moderne.",
        promptInstruction: "Melodic Ivorian trap with deep 808s, sung hook, modern African urban rhythm."
      },
      {
        id: "rap-iv-conscient",
        label: "Rap conscient",
        description: "Texte réfléchi, articulation posée, instrumentation sobre et émotionnelle.",
        promptInstruction: "Conscious West African rap, thoughtful verses, measured delivery and restrained emotional production."
      },
      {
        id: "rap-iv-dirty",
        label: "Dirty décalé",
        description: "Rap énergique fusionné à une rythmique ivoirienne de danse.",
        promptInstruction: "Energetic rap fused with Ivorian dance percussion, playful rhythmic switches and club-ready momentum."
      },
      {
        id: "rap-iv-soul",
        label: "Rap afro-soul",
        description: "Couplets rappés, refrain chanté, accords soul et percussions africaines.",
        promptInstruction: "Afro-soul rap: rhythmic verses, emotive sung chorus, soulful chords and African percussion."
      }
    ]
  },
  {
    categoryId: "Afrobeats Nigeria",
    categoryLabel: "Rap Naija / hip-hop nigérian",
    profiles: [
      {
        id: "naija-highlife",
        label: "Hip-hop highlife",
        description: "Rap posé sur guitare highlife et groove ouest-africain syncopé.",
        promptInstruction: "Nigerian hip-hop over syncopated highlife guitar and warm West African groove."
      },
      {
        id: "naija-trap",
        label: "Afro-trap mélodique",
        description: "808, hats rapides, voix mi-rappée mi-chantée et mélodie accrocheuse.",
        promptInstruction: "Melodic Afro-trap with deep 808s, agile hi-hats, rap-singing and a memorable hook."
      },
      {
        id: "naija-pidgin",
        label: "Rap pidgin énergique",
        description: "Flow vif, intonation vivante, esprit urbain et festif.",
        promptInstruction: "Energetic Nigerian urban rap delivery with lively phrasing, street confidence and danceable rhythm."
      },
      {
        id: "naija-fusion",
        label: "Rap afro-fusion",
        description: "Hip-hop, afrobeats et touches de percussions traditionnelles.",
        promptInstruction: "Afro-fusion rap blending hip-hop drums, afrobeats groove and subtle traditional percussion."
      },
      {
        id: "naija-intro",
        label: "Rap introspectif",
        description: "Instrumentale épurée, voix proche, refrain émotionnel.",
        promptInstruction: "Introspective African rap, sparse production, intimate vocal delivery and emotional melodic hook."
      }
    ]
  },
  {
    categoryId: "Mbalax",
    categoryLabel: "Mbalax sénégalais",
    profiles: [
      {
        id: "mbalax-sabar",
        label: "Sabar virtuose",
        description: "Percussions sabar rapides, polyrythmie et énergie de danse.",
        promptInstruction: "Fast Senegalese sabar percussion, layered polyrhythms and high-energy dance movement."
      },
      {
        id: "mbalax-appel",
        label: "Chant d’appel-réponse",
        description: "Voix soliste puissante, réponses de chœur et intensité collective.",
        promptInstruction: "Powerful lead vocal with responsive chorus, communal call-and-response and live performance energy."
      },
      {
        id: "mbalax-orchestre",
        label: "Orchestre mbalax",
        description: "Guitare, claviers, cuivres légers et percussions au premier plan.",
        promptInstruction: "Modern mbalax band texture: foreground percussion, rhythmic guitar, keys and light brass accents."
      },
      {
        id: "mbalax-pop",
        label: "Mbalax pop moderne",
        description: "Mélodie accessible, production actuelle, tout en gardant les sabars.",
        promptInstruction: "Contemporary Senegalese pop melody anchored by authentic sabar rhythms and lively percussion."
      },
      {
        id: "mbalax-ceremoniel",
        label: "Mbalax cérémoniel",
        description: "Longues montées rythmiques, voix expressives et ambiance de célébration.",
        promptInstruction: "Ceremonial Senegalese rhythmic build, expressive vocals, layered drums and celebratory intensity."
      }
    ]
  },
  {
    categoryId: "Bongo Flava",
    categoryLabel: "Bongo Flava tanzanien",
    profiles: [
      {
        id: "bongo-swahili",
        label: "Mélodie swahili douce",
        description: "Chant très mélodique, rythme fluide et ambiance romantique.",
        promptInstruction: "Highly melodic East African pop vocals, fluid beat, romantic and warm atmosphere."
      },
      {
        id: "bongo-rap",
        label: "Bongo rap urbain",
        description: "Couplets rap, refrain chanté et basse dansante.",
        promptInstruction: "Tanzanian urban rap verses, melodic sung hook and smooth danceable bass groove."
      },
      {
        id: "bongo-taarab",
        label: "Taarab moderne",
        description: "Ornements mélodiques, poésie vocale et arrangement pop actuel.",
        promptInstruction: "Modern East African pop with taarab-inspired melodic ornamentation, poetic vocals and refined groove."
      },
      {
        id: "bongo-dancehall",
        label: "Dancehall est-africain",
        description: "Rythme plus rapide, basse rebondissante et chant énergique.",
        promptInstruction: "East African dancehall-influenced rhythm, bouncing bass, animated vocals and club energy."
      },
      {
        id: "bongo-dar",
        label: "Afropop de Dar es Salaam",
        description: "Synthés doux, percussions africaines légères et refrain radio.",
        promptInstruction: "Dar es Salaam Afropop feel: soft synths, light African percussion and a radio-ready chorus."
      }
    ]
  }
];

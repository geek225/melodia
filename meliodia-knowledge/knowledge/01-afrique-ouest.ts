export interface MusicStyle{
name:string;
country:string;
bpm:string;
languages:string[];
systemPrompt:string;
negativePrompt:string;
}

export const styles: MusicStyle[] = [
{
name:"Coupé-Décalé",
country:"Côte d'Ivoire",
bpm:"124-128",
languages:['Français', 'Nouchi'],
systemPrompt:`Generate an authentic Coupé-Décalé track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Rap Ivoire",
country:"Côte d'Ivoire",
bpm:"90-150",
languages:['Français', 'Nouchi'],
systemPrompt:`Generate an authentic Rap Ivoire track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Zouglou",
country:"Côte d'Ivoire",
bpm:"92-108",
languages:['Français', 'Nouchi'],
systemPrompt:`Generate an authentic Zouglou track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Afrobeats",
country:"Nigeria",
bpm:"100-115",
languages:['English', 'Pidgin'],
systemPrompt:`Generate an authentic Afrobeats track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Afrobeats Nigeria",
country:"Nigeria",
bpm:"105-115",
languages:['English', 'Pidgin'],
systemPrompt:`Generate an authentic Afrobeats Nigeria track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Mbalax",
country:"Sénégal",
bpm:"120-140",
languages:['Wolof', 'French'],
systemPrompt:`Generate an authentic Mbalax track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
];
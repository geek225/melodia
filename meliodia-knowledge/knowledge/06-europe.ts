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
name:"Chanson Française",
country:"France",
bpm:"70-100",
languages:['French'],
systemPrompt:`Generate an authentic Chanson Française track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Afro Trap France",
country:"France",
bpm:"100-140",
languages:['French'],
systemPrompt:`Generate an authentic Afro Trap France track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Soul Jazz",
country:"International",
bpm:"70-95",
languages:['English'],
systemPrompt:`Generate an authentic Soul Jazz track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"R&B Français",
country:"France",
bpm:"80-100",
languages:['French'],
systemPrompt:`Generate an authentic R&B Français track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Rap Français",
country:"France",
bpm:"85-150",
languages:['French'],
systemPrompt:`Generate an authentic Rap Français track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
];
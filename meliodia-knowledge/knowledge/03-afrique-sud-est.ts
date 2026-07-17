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
name:"Amapiano",
country:"Afrique du Sud",
bpm:"110-115",
languages:['Zulu', 'English'],
systemPrompt:`Generate an authentic Amapiano track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Bongo Flava",
country:"Tanzanie",
bpm:"90-110",
languages:['Swahili'],
systemPrompt:`Generate an authentic Bongo Flava track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
];
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
name:"Raï Moderne",
country:"Algérie",
bpm:"95-115",
languages:['Arabe', 'French'],
systemPrompt:`Generate an authentic Raï Moderne track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Kizomba",
country:"Angola",
bpm:"86-96",
languages:['Portuguese'],
systemPrompt:`Generate an authentic Kizomba track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Pop R&B",
country:"International",
bpm:"90-110",
languages:['Any'],
systemPrompt:`Generate an authentic Pop R&B track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
];
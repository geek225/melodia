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
name:"Rap Américain",
country:"USA",
bpm:"90-160",
languages:['English'],
systemPrompt:`Generate an authentic Rap Américain track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"R&B Américain",
country:"USA",
bpm:"70-100",
languages:['English'],
systemPrompt:`Generate an authentic R&B Américain track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
];
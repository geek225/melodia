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
name:"Gospel Américain",
country:"USA",
bpm:"70-100",
languages:['English'],
systemPrompt:`Generate an authentic Gospel Américain track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Gospel Africain",
country:"Afrique",
bpm:"95-125",
languages:['French', 'English'],
systemPrompt:`Generate an authentic Gospel Africain track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Gospel Européen",
country:"Europe",
bpm:"70-90",
languages:['French'],
systemPrompt:`Generate an authentic Gospel Européen track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
];
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
name:"Rumba Congolaise",
country:"RDC",
bpm:"84-102",
languages:['Lingala', 'French'],
systemPrompt:`Generate an authentic Rumba Congolaise track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
{
name:"Afro-Congo",
country:"RDC",
bpm:"110-125",
languages:['Lingala'],
systemPrompt:`Generate an authentic Afro-Congo track.
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
negativePrompt:`metal, hard rock, bad mix, off beat, low quality, distorted vocals`
},
];
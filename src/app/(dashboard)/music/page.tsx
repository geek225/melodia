import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TrackCardActions from "./TrackCardActions";
import FavoriteButton from "./FavoriteButton";

export default async function MyMusicPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  const TRACKS = tracks || [];
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ma musique</h1>
          <p className="text-muted-foreground mt-1">Toutes tes créations générées par l&apos;IA.</p>
        </div>
        <Link href="/create">
          <Button className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white">
            Créer une musique
          </Button>
        </Link>
      </div>

      {TRACKS.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-[32px] border border-border border-dashed">
          <span className="text-6xl mb-4 block">🎵</span>
          <h2 className="text-xl font-bold mb-2">Aucune musique générée</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">Tu n&apos;as pas encore créé de musique. Laisse l&apos;IA t&apos;inspirer !</p>
          <Link href="/create">
            <Button className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-md shadow-primary/20">
              Créer ma première musique
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRACKS.map((track) => (
            <Card key={track.id} className="border-border/50 shadow-sm rounded-[24px] overflow-hidden hover:shadow-md transition-shadow group">
              {/* Cover Area */}
              <div className="aspect-video bg-gray-100 relative overflow-hidden group/cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={track.cover_url || "/default-cover.png"} 
                  alt={track.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Link href={`/music/${track.id}`}>
                    <button className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                      <Play className="w-6 h-6 ml-1 fill-current" />
                    </button>
                  </Link>
                </div>
              </div>
              
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link href={`/music/${track.id}`} className="hover:underline">
                      <h3 className="font-bold text-lg leading-tight">{track.title}</h3>
                    </Link>
                    <p className="text-sm text-[#FF6B00] font-medium mt-1">{track.style}</p>
                  </div>
                  <FavoriteButton trackId={track.id} isFavorite={track.is_favorite || false} />
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium mb-6">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(track.created_at).toLocaleDateString()}
                  </div>
                  {track.duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {track.duration}
                    </div>
                  )}
                </div>

                <TrackCardActions track={track} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

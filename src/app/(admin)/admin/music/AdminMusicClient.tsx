"use client";

import { useEffect, useState, useRef } from "react";
import { getAdminTracks, toggleFeaturedTrack } from "./actions";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Play, Pause, AlertCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminMusicClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    setLoading(true);
    const res = await getAdminTracks();
    if (res.success && res.data) {
      setTracks(res.data);
    }
    setLoading(false);
  };

  const filteredTracks = tracks.filter((t) => 
    t.title?.toLowerCase().includes(search.toLowerCase()) || 
    t.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const togglePlay = (url: string, id: string) => {
    if (!url || !audioRef.current) return;
    
    let finalUrl = url;
    if (!finalUrl.startsWith('task:') && !finalUrl.endsWith('.mp3') && !finalUrl.endsWith('.wav') && !finalUrl.includes('?')) {
      finalUrl += '.mp3';
    }

    if (playingTrackId === id) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = finalUrl;
      audioRef.current.play();
      setPlayingTrackId(id);
    }
  };

  const handleToggleFeatured = async (trackId: string, currentStatus: boolean) => {
    const res = await toggleFeaturedTrack(trackId, currentStatus);
    if (res.success) {
      setTracks(tracks.map(t => t.id === trackId ? { ...t, is_featured: !currentStatus } : t));
      toast.success(currentStatus ? "Musique retirée de l'accueil" : "Musique mise à la une");
    } else {
      toast.error(res.error || "Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} className="hidden" />
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par titre ou email..." 
            className="pl-9 rounded-xl bg-background border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead>Lecture</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>À la une</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTracks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Aucune musique trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filteredTracks.map((track) => (
                <TableRow key={track.id} className="border-border/50">
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={!track.audio_url}
                      onClick={() => togglePlay(track.audio_url, track.id)}
                      className={playingTrackId === track.id ? "text-primary" : ""}
                    >
                      {playingTrackId === track.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{track.title || "Sans titre"}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-50">{track.prompt}</div>
                  </TableCell>
                  <TableCell>{track.profiles?.email || "Inconnu"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal capitalize">{track.style || "Normal"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(track.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {track.status === 'completed' ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border-0">Terminé</Badge>
                    ) : track.status === 'failed' ? (
                      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none border-0"><AlertCircle className="w-3 h-3 mr-1" /> Échoué</Badge>
                    ) : (
                      <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 shadow-none border-0 animate-pulse">En cours</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {track.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFeatured(track.id, track.is_featured)}
                        className={track.is_featured ? "text-yellow-500 hover:text-yellow-600" : "text-gray-300 hover:text-yellow-500"}
                      >
                        <Star className="w-5 h-5" fill={track.is_featured ? "currentColor" : "none"} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

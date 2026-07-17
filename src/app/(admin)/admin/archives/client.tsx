"use client";

import { useEffect, useState, useRef } from "react";
import { getArchivedTracks } from "./actions";
import { archiveSingleTrack } from "../music/actions";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Download, Trash2, Play, Pause, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export default function AdminArchivesClient() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchTracks();
    audioRef.current = new Audio();
    audioRef.current.onended = () => setPlayingTrackId(null);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const fetchTracks = async () => {
    setLoading(true);
    const res = await getArchivedTracks();
    if (res.success && res.data) {
      setTracks(res.data);
    } else {
      toast.error(res.error || "Erreur de chargement");
    }
    setLoading(false);
  };

  const filteredTracks = tracks.filter((t) => 
    t.title?.toLowerCase().includes(search.toLowerCase()) || 
    t.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const togglePlay = (url: string, id: string) => {
    if (!url || !audioRef.current) return;
    if (playingTrackId === id) {
      audioRef.current.pause();
      setPlayingTrackId(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.play();
      setPlayingTrackId(id);
    }
  };

  const handleDownload = (track: any) => {
    if (!track.audio_url) return;
    toast.success("Téléchargement de la musique...");
    const url = new URL('/api/download', window.location.origin);
    url.searchParams.set('url', track.audio_url);
    url.searchParams.set('filename', `${track.title || 'Meliodia_Music'}.mp3`);
    window.location.assign(url.toString());
  };

  const handleDelete = async (track: any) => {
    if (confirm(`Veux-tu vraiment supprimer définitivement "${track.title}" de la base de données ?`)) {
      const { error } = await supabase.from('tracks').delete().eq('id', track.id);
      if (error) {
        toast.error("Erreur lors de la suppression");
      } else {
        toast.success("Musique supprimée");
        setTracks(tracks.filter(t => t.id !== track.id));
      }
    }
  };

  const handleReArchive = async (track: any) => {
    toast.info("Tentative de re-téléchargement depuis Suno...");
    
    // Hack: Restaurer temporairement une URL suno
    const oldUrl = track.audio_url;
    const sunoUrl = `https://cdn1.suno.ai/${track.id}.mp3`;
    
    // On met à jour la db silencieusement pour archiveSingleTrack
    await supabase.from('tracks').update({ audio_url: sunoUrl }).eq('id', track.id);
    
    const res = await archiveSingleTrack(track.id);
    if (res.success) {
      toast.success("Fichier corrompu réparé avec succès !");
      fetchTracks();
    } else {
      // Revert si erreur
      await supabase.from('tracks').update({ audio_url: oldUrl }).eq('id', track.id);
      toast.error(res.error || "Impossible de récupérer le fichier depuis Suno.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl p-4 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Information sur les fichiers "0 octet"</p>
          <p>
            Si tu constates qu'un fichier téléchargé pèse "0 octet" ou ne se lit pas, c'est parce que Suno a bloqué le téléchargement côté serveur lors de la procédure d'archivage.
            Utilise le bouton <strong>"Réparer (Re-Archiver)"</strong> <RefreshCw className="w-4 h-4 inline mx-1"/> pour essayer de récupérer à nouveau le vrai fichier audio depuis Suno.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher par titre ou email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-md bg-white"
        />
      </div>

      <div className="border border-border/50 rounded-2xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Date d'archivage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Chargement des archives...
                </TableCell>
              </TableRow>
            ) : filteredTracks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucune musique archivée trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filteredTracks.map((track) => (
                <TableRow key={track.id} className="group hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePlay(track.audio_url, track.id)}
                      className="w-8 h-8 rounded-full bg-primary/5 hover:bg-primary/10 text-primary"
                    >
                      {playingTrackId === track.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium max-w-50 truncate" title={track.title || "Sans titre"}>
                      {track.title || "Sans titre"}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {track.profiles?.email || 'Anonyme'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(track.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReArchive(track)}
                        title="Réparer fichier 0 octet"
                        className="h-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Réparer
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(track)}
                        title="Télécharger"
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(track)}
                        title="Supprimer"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

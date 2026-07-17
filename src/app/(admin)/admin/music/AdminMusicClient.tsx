"use client";

import { useEffect, useState, useRef } from "react";
import { getAdminTracks, toggleFeaturedTrack, getUnarchivedTracksCount, archiveSingleTrack, deleteOldUnarchivedTracks } from "./actions";
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
import { Search, Play, Pause, AlertCircle, Star, Download, ArchiveRestore, Trash2, RefreshCw, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SUPABASE_STORAGE_HOST = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname; } catch { return ''; }
})();

function isExternalAudioUrl(url: string): boolean {
  if (!url || url.startsWith('task:')) return false;
  if (SUPABASE_STORAGE_HOST && url.includes(SUPABASE_STORAGE_HOST)) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

export default function AdminMusicClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [unarchivedCount, setUnarchivedCount] = useState(0);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [isBulkArchiving, setIsBulkArchiving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchTracks();
    fetchUnarchivedCount();
  }, []);

  const fetchTracks = async () => {
    setLoading(true);
    const res = await getAdminTracks();
    if (res.success && res.data) {
      setTracks(res.data);
    }
    setLoading(false);
  };

  const fetchUnarchivedCount = async () => {
    const res = await getUnarchivedTracksCount();
    if (res.success) setUnarchivedCount(res.count);
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

  const handleDownload = async (track: { audio_url?: string; title?: string }) => {
    if (!track.audio_url || track.audio_url.startsWith('task:')) return;
    try {
      toast.success("Téléchargement en cours...");
      const res = await fetch(track.audio_url);
      const audioBlob = await res.blob();
      const url = window.URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.setAttribute("href", url);
      a.setAttribute("download", `${track.title || 'Meliodia_Music'}.mp3`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (e) {
      toast.error("Erreur lors du téléchargement.");
    }
  };

  /** Archive une seule piste vers Supabase */
  const handleArchiveSingle = async (trackId: string) => {
    setArchivingId(trackId);
    const res = await archiveSingleTrack(trackId);
    if (res.success) {
      if (res.alreadyArchived) {
        toast.info("Cette piste est déjà archivée sur Supabase.");
      } else {
        toast.success("✅ Piste archivée avec succès sur Supabase !");
        // Mettre à jour l'URL localement sans recharger tout
        if (res.url) {
          setTracks(prev => prev.map(t => t.id === trackId ? { ...t, audio_url: res.url } : t));
        }
        fetchUnarchivedCount();
      }
    } else {
      toast.error(`❌ Échec de l'archivage : ${res.error || 'URL expirée ?'}`);
    }
    setArchivingId(null);
  };

  /** Archive toutes les pistes non archivées */
  const handleBulkArchive = async () => {
    setIsBulkArchiving(true);
    const toArchive = tracks.filter(t => t.status === 'completed' && isExternalAudioUrl(t.audio_url));
    
    if (toArchive.length === 0) {
      toast.info("Toutes les pistes sont déjà archivées !");
      setIsBulkArchiving(false);
      return;
    }

    let success = 0;
    let failed = 0;

    for (const track of toArchive) {
      const res = await archiveSingleTrack(track.id);
      if (res.success && !res.alreadyArchived) {
        success++;
        if (res.url) {
          setTracks(prev => prev.map(t => t.id === track.id ? { ...t, audio_url: res.url } : t));
        }
      } else {
        failed++;
      }
    }

    toast.success(`Archivage terminé : ${success} réussie(s), ${failed} échouée(s) (URL expirées)`);
    fetchUnarchivedCount();
    setIsBulkArchiving(false);
  };

  /** Supprime les pistes de plus de 7 jours non archivées */
  const handleDeleteOld = async () => {
    setIsDeleting(true);
    const res = await deleteOldUnarchivedTracks(7);
    if (res.success) {
      toast.success(`🗑️ ${res.deleted} piste(s) supprimée(s) sur ${res.total} concernée(s).`);
      fetchTracks();
      fetchUnarchivedCount();
    } else {
      toast.error("Erreur lors de la suppression.");
    }
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-6">
      <audio ref={audioRef} onEnded={() => setPlayingTrackId(null)} className="hidden" />

      {/* Bannière d'alerte archivage */}
      {unarchivedCount > 0 && (
        <div className="relative rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-amber-600 text-sm">
                {unarchivedCount} piste{unarchivedCount > 1 ? "s" : ""} non archivée{unarchivedCount > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-700/80 mt-0.5">
                Ces pistes pointent encore vers le CDN Suno et risquent de disparaître. Archivez-les sur Supabase ou supprimez celles de plus de 7 jours.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleBulkArchive}
              disabled={isBulkArchiving}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-1.5 text-xs font-bold"
            >
              {isBulkArchiving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArchiveRestore className="w-3.5 h-3.5" />
              )}
              {isBulkArchiving ? "Archivage..." : "Archiver toutes"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="border-red-300 text-red-500 hover:bg-red-50 rounded-xl gap-1.5 text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer &gt;7 jours
            </Button>
          </div>
        </div>
      )}

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
              <TableHead>Stockage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTracks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Aucune musique trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filteredTracks.map((track) => {
                const isExternal = track.status === 'completed' && isExternalAudioUrl(track.audio_url);
                return (
                  <TableRow key={track.id} className={`border-border/50 ${isExternal ? 'bg-amber-50/30' : ''}`}>
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
                    {/* Colonne stockage */}
                    <TableCell>
                      {track.status === 'completed' && (
                        isExternal ? (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-300/50 text-xs gap-1 shadow-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                            Externe
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-300/50 text-xs shadow-none">
                            ✓ Supabase
                          </Badge>
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      {track.status === 'completed' && (
                        <div className="flex items-center justify-end gap-1">
                          {/* Bouton archiver si URL externe */}
                          {isExternal && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleArchiveSingle(track.id)}
                              disabled={archivingId === track.id}
                              className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                              title="Archiver sur Supabase"
                            >
                              {archivingId === track.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <ArchiveRestore className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFeatured(track.id, track.is_featured)}
                            className={track.is_featured ? "text-yellow-500 hover:text-yellow-600" : "text-gray-300 hover:text-yellow-500"}
                            title="Mettre à la une"
                          >
                            <Star className="w-5 h-5" fill={track.is_featured ? "currentColor" : "none"} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(track)}
                            className="text-gray-400 hover:text-gray-900"
                            title="Télécharger en MP3"
                          >
                            <Download className="w-5 h-5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog confirmation suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Supprimer les pistes expirées
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va supprimer définitivement toutes les pistes <strong>non archivées créées il y a plus de 7 jours</strong> dont l&apos;URL audio pointe encore vers le CDN Suno (URLs expirées/inaccessibles). Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOld}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isDeleting ? "Suppression..." : "Oui, supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

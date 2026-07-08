"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Share2, Heart, Play, Pause, Upload, Music, Loader2, Copy, Check, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ID3Writer } from "browser-id3-writer";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

type Track = {
  id: string;
  title: string;
  audio_url: string;
  cover_url: string;
  style: string;
  mood: string;
  language: string;
  voice: string;
  duration: string;
  prompt: string;
  lyrics: string;
  created_at: string;
  status: string;
};

export default function MusicPlayerClient({ track, isPublic = false }: { track: Track; isPublic?: boolean }) {
  const formatTrack = (t: Track) => {
    const newTrack = { ...t };
    if (newTrack.audio_url && !newTrack.audio_url.startsWith('task:') && !newTrack.audio_url.endsWith('.mp3') && !newTrack.audio_url.endsWith('.wav') && !newTrack.audio_url.includes('?')) {
      newTrack.audio_url += '.mp3';
    }
    return newTrack;
  };

  const [currentTrack, setCurrentTrack] = useState<Track>(formatTrack(track));
  const [isPlaying, setIsPlaying] = useState(false);
  const [coverUrl, setCoverUrl] = useState(track.cover_url);
  const [isUploading, setIsUploading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const supabase = createClient();
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/share/${currentTrack.id}` : "";

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!currentTrack.audio_url || currentTrack.audio_url.startsWith('task:')) return;
    try {
      // Fetch Audio
      const res = await fetch(currentTrack.audio_url);
      const audioBuffer = await res.arrayBuffer();
      
      const writer = new ID3Writer(audioBuffer);
      writer.setFrame('TIT2', currentTrack.title || 'Meliodia Music')
            .setFrame('TPE1', ['Meliodia AI'])
            .setFrame('TALB', currentTrack.style || 'Généré par IA');

      // Fetch Cover Image if exists
      if (coverUrl) {
        try {
          const coverRes = await fetch(coverUrl);
          const coverBuffer = await coverRes.arrayBuffer();
          writer.setFrame('APIC', {
            type: 3,
            data: coverBuffer,
            description: 'Cover',
            useUnicodeEncoding: false
          });
        } catch (e) {
          console.error("Erreur lors du téléchargement de la pochette pour l'ID3", e);
        }
      }

      writer.addTag();
      const taggedBlob = writer.getBlob();
      const url = window.URL.createObjectURL(taggedBlob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentTrack.title || 'Meliodia_Music'}.mp3`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erreur de téléchargement", e);
      alert("Erreur lors du téléchargement.");
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', currentTrack.id);
        
      if (error) throw error;
      
      router.push('/music');
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de la piste.");
      setIsDeleting(false);
    }
  };

  // Auto-scroll lyrics based on audio progress
  useEffect(() => {
    const audio = audioRef.current;
    const lyricsContainer = lyricsRef.current;
    
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setAudioDuration(audio.duration || 0);

      if (lyricsContainer && isPlaying) {
        const progress = audio.currentTime / audio.duration;
        if (!isNaN(progress)) {
          const scrollAmount = progress * (lyricsContainer.scrollHeight - lyricsContainer.clientHeight);
          lyricsContainer.scrollTop = scrollAmount;
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleTimeUpdate);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleTimeUpdate);
    };
  }, [isPlaying]);

  const isGenerating = currentTrack.status === 'processing' || (currentTrack.audio_url && currentTrack.audio_url.startsWith('task:'));

  // Demande de permission pour les notifications
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Gestion du faux chargement et du rafraîchissement
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isGenerating) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 1 : prev));
      }, 1500); // 1.5s par % (environ 2min20 pour arriver à 95%)
    } else if (currentTrack.status === 'completed' && progress > 0 && progress < 100) {
      setProgress(100);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("🎵 Ta chanson est prête !", { 
          body: `La génération de "${currentTrack.title}" est terminée.`,
          icon: coverUrl || "/favicon.ico"
        });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, currentTrack.status, currentTrack.title, coverUrl, progress]);

  // Ping le serveur tous les 10% de progression pour rafraîchir le statut via l'API
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    if (isGenerating) {
      pollingInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/music/status?trackId=${currentTrack.id}`);
          if (res.ok) {
            const updatedTrack = await res.json();
            if (updatedTrack.status === 'completed' && updatedTrack.audio_url && !updatedTrack.audio_url.startsWith('task:')) {
              // Mettre à jour l'état local et rafraîchir
              setCurrentTrack(formatTrack(updatedTrack));
              router.refresh();
            } else if (updatedTrack.status === 'failed') {
              setCurrentTrack(updatedTrack);
              router.refresh();
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 5000); // Polling toutes les 5 secondes
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [isGenerating, currentTrack.id, router]);



  const togglePlay = () => {
    if (!audioRef.current || !currentTrack.audio_url || currentTrack.audio_url.startsWith('task:')) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentTrack.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('music_covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('music_covers')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('tracks')
        .update({ cover_url: publicUrl })
        .eq('id', track.id);

      if (updateError) throw updateError;

      setCoverUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert("Erreur lors de l'upload de la pochette.");
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
        
        {/* Colonne Gauche : Pochette & Contrôles */}
        <div className="w-full lg:w-105 shrink-0 flex flex-col items-center space-y-10">
          
          {/* Pochette Premium (Light Mode) */}
          <div className={`w-full aspect-square rounded-[40px] flex items-center justify-center relative overflow-hidden group transition-all duration-700 bg-white ${isPlaying ? 'scale-[1.02] shadow-[0_30px_60px_-15px_rgba(255,107,0,0.3)]' : 'shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]'}`}>
              <Image 
                src={coverUrl || '/images/logo.png'} 
                alt={currentTrack.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              
              {/* Overlay pour changer l'image (Caché si public) */}
              {!isPublic && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleUploadCover} 
                  />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                size="lg"
                className="rounded-full bg-black/80 hover:bg-black text-white shadow-xl"
              >
                {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                {isUploading ? "Upload..." : "Changer la pochette"}
                  </Button>
                  <p className="absolute bottom-6 text-sm font-semibold text-gray-900 bg-white/80 px-4 py-2 rounded-full shadow-md">
                    Changement 100% Gratuit
                  </p>
                </div>
              )}
            </div>

            {!isPublic && (
              <p className="text-sm text-gray-500 text-center font-medium px-4">
                💡 Survolez la pochette pour uploader votre propre image et la sauvegarder gratuitement.
              </p>
            )}
        
          {/* Contrôles Principaux */}
          <div className="w-full bg-white rounded-[32px] p-8 shadow-[0_15px_35px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center">
            
            {/* Titre avec mini spectre audio animé */}
            <div className="flex items-center justify-center gap-3 mb-1">
              {isPlaying && (
                <div className="flex items-end gap-1 h-6">
                  <div className="w-1.5 bg-[#FF6B00] rounded-t-sm animate-[bounce_0.8s_ease-in-out_infinite]" style={{ height: '40%' }}></div>
                  <div className="w-1.5 bg-[#FF6B00] rounded-t-sm animate-[bounce_0.6s_ease-in-out_infinite_0.1s]" style={{ height: '100%' }}></div>
                  <div className="w-1.5 bg-[#FF6B00] rounded-t-sm animate-[bounce_0.9s_ease-in-out_infinite_0.2s]" style={{ height: '60%' }}></div>
                  <div className="w-1.5 bg-[#FF6B00] rounded-t-sm animate-[bounce_0.7s_ease-in-out_infinite_0.3s]" style={{ height: '80%' }}></div>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{currentTrack.title}</h1>
            </div>
            
            <p className="text-lg text-[#FF6B00] font-semibold text-center mb-6">{currentTrack.style || 'Musique'}</p>

            {/* Barre de progression (Timeline) ou Loader */}
            {isGenerating ? (
              <div className="w-full flex flex-col items-center mb-8 px-4">
                <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full bg-linear-to-r from-purple-500 to-[#FF6B00] transition-all duration-1000 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center h-full min-h-75 text-center px-4 max-w-sm mx-auto">
                  <Loader2 className="w-12 h-12 text-[#FF6B00] animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-slate-800 mb-3 text-balance">
                    Génération en cours... {progress}%
                  </h3>
                  <p className="text-slate-500 text-sm text-balance">
                    Nous sommes en train de composer <span className="font-semibold text-slate-700">&quot;{currentTrack.title}&quot;</span>.
                    Cela prend généralement entre 2 et 3 minutes.
                  </p>
                </div>
              </div>
            ) : currentTrack.status === 'failed' ? (
              <div className="w-full flex flex-col items-center mb-8 px-4">
                <div className="flex flex-col items-center justify-center h-full min-h-75 text-center px-4 max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-red-600 mb-3 text-balance">
                    Génération échouée
                  </h3>
                  <p className="text-slate-500 text-sm text-balance">
                    La génération de cette musique a été rejetée par le système d&apos;intelligence artificielle, probablement parce qu&apos;elle contient des noms d&apos;artistes protégés.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full flex items-center gap-3 mb-8 text-sm font-medium text-gray-500">
                  <span className="w-10 text-right">{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                  <div 
                    className="flex-1 h-2 bg-gray-100 rounded-full cursor-pointer relative overflow-hidden group"
                    onClick={(e) => {
                      if (audioRef.current && audioDuration) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        audioRef.current.currentTime = percent * audioDuration;
                      }
                    }}
                  >
                    <div 
                      className="absolute top-0 left-0 h-full bg-linear-to-r from-[#FF8F3D] to-[#FF6B00] rounded-full group-hover:brightness-110 transition-all"
                      style={{ width: `${audioDuration ? (currentTime / audioDuration) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-10">{audioDuration ? `${Math.floor(audioDuration / 60)}:${(Math.floor(audioDuration % 60)).toString().padStart(2, '0')}` : '0:00'}</span>
                </div>

                {currentTrack.audio_url && !currentTrack.audio_url.startsWith('task:') && (
                  <audio ref={audioRef} src={currentTrack.audio_url!} onEnded={() => setIsPlaying(false)} className="hidden" />
                )}

                <Button 
                  size="lg" 
                  onClick={togglePlay}
                  disabled={!currentTrack.audio_url}
                  className="w-20 h-20 rounded-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white shadow-[0_10px_25px_-5px_rgba(255,107,0,0.5)] transition-transform hover:scale-105 mb-8"
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </Button>
              </>
            )}

            <div className="flex w-full justify-center gap-4">
              <Button size="icon" variant="ghost" className="w-12 h-12 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-6 h-6" />
              </Button>
              <Button size="icon" variant="ghost" disabled={!currentTrack.audio_url || currentTrack.audio_url.startsWith('task:')} onClick={handleDownload} className="w-12 h-12 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
                <Download className="w-6 h-6" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setShowShareModal(true)} className="w-12 h-12 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
                <Share2 className="w-6 h-6" />
              </Button>
              {!isPublic && (
                <Button size="icon" variant="ghost" onClick={() => setShowDeleteModal(true)} className="w-12 h-12 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-6 h-6" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Colonne Droite : Paroles et Détails */}
        <div className="flex-1 space-y-8 w-full">
          {/* Section Paroles */}
          <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 h-150 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-2xl text-gray-900 flex items-center gap-3">
                <Music className="w-7 h-7 text-[#FF6B00]" /> Paroles
              </h3>
              {(currentTrack.lyrics || currentTrack.prompt?.includes('[')) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full flex items-center gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(currentTrack.lyrics || currentTrack.prompt || "");
                    setCopiedLyrics(true);
                    setTimeout(() => setCopiedLyrics(false), 2000);
                  }}
                >
                  {copiedLyrics ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} 
                  {copiedLyrics ? "Copié" : "Copier"}
                </Button>
              )}
            </div>
            
            {(currentTrack.lyrics || currentTrack.prompt?.includes('[')) ? (
               <div className="relative flex-1 min-h-0 overflow-hidden">
                 {/* Fading mask top/bottom pour effet de défilement pro */}
                 <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-white to-transparent z-10 pointer-events-none" />
                 
                 <div 
                   ref={lyricsRef}
                   className="h-full text-gray-700 whitespace-pre-wrap leading-[2.5] font-semibold text-2xl text-center overflow-y-auto px-4 scrollbar-hide pb-32 pt-16 selection:bg-[#FF6B00]/20"
                 >
                   {currentTrack.lyrics || currentTrack.prompt}
                 </div>
                 
                 <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent z-10 pointer-events-none" />
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-400 italic gap-4">
                 <Music className="w-16 h-16 opacity-20" />
                 <p className="text-xl">Instrumental / Aucune parole</p>
               </div>
            )}
          </div>

          {/* Détails */}
          <div className="bg-white p-8 rounded-[32px] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
            <h3 className="font-bold text-xl text-gray-900 mb-6">Détails de la création</h3>
            <p className="text-gray-600 leading-relaxed text-lg bg-gray-50 p-6 rounded-2xl border border-gray-100">{currentTrack.prompt}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[currentTrack.style, currentTrack.mood, currentTrack.language].filter(Boolean).map((tag, i) => (
                <span key={i} className="bg-[#FF6B00]/10 text-[#FF6B00] px-5 py-2.5 text-sm font-bold rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Share Modal */}
      <AlertDialog open={showShareModal} onOpenChange={setShowShareModal}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Partager ta musique</AlertDialogTitle>
            <AlertDialogDescription>
              Toute personne avec ce lien pourra écouter ta création.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <Input
              readOnly
              value={shareUrl}
              className="flex-1 bg-muted font-medium text-muted-foreground"
            />
            <Button size="icon" onClick={handleCopyShareUrl} className="shrink-0 bg-primary hover:bg-primary/90 text-white">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex flex-col gap-3 mt-6">
             <Button 
               className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center gap-2" 
               onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Écoute ma nouvelle musique générée par IA: ${currentTrack.title} 🎵 ${shareUrl}`)}`, '_blank')}
             >
               Partager sur WhatsApp
             </Button>
             <div className="flex justify-end mt-2">
               <AlertDialogCancel onClick={() => setShowShareModal(false)}>Fermer</AlertDialogCancel>
             </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Supprimer la piste
            </AlertDialogTitle>
            <AlertDialogDescription>
              Es-tu sûr de vouloir supprimer définitivement &quot;{track.title}&quot; ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isDeleting ? "Suppression..." : "Oui, supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Music2 } from "lucide-react";

export default function SidebarPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Le lien vers le fichier audio réel
  const audioSrc = "/audio/suspendu.mp3"; 

  const togglePlay = () => {
    if (!audioRef.current || !audioSrc) {
      // Simulation pour le moment s'il n'y a pas de son
      setIsPlaying(!isPlaying);
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => {
        console.error("Playback failed:", e);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Simuler une progression si on joue sans source réelle
  useEffect(() => {
    if (isPlaying && !audioSrc) {
      const interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 1));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isPlaying, audioSrc]);

  const handleTimeUpdate = () => {
    if (audioRef.current && audioSrc) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (total > 0) {
        setProgress((current / total) * 100);
      }
    }
  };

  return (
    <div className="mt-auto p-4 rounded-2xl bg-[#13131A] border border-white/5 relative flex flex-col gap-4 shadow-xl">
      {audioSrc && (
        <audio 
          ref={audioRef} 
          src={audioSrc} 
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}
      
      {/* Track Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-500/20 rounded-lg overflow-hidden shrink-0 border border-purple-500/30 flex items-center justify-center relative">
          <Music2 className={`w-5 h-5 text-purple-400 ${isPlaying ? 'animate-bounce' : ''}`} />
          {isPlaying && (
            <div className="absolute inset-0 bg-purple-500/20 animate-pulse"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white truncate">Suspendu (Gospel)</h4>
          <p className="text-xs text-purple-300 truncate">Création IA</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-purple-500 to-[#FF6B00] transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button className="text-white/40 hover:text-white transition-colors outline-none cursor-pointer">
            <SkipBack className="w-4 h-4 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform outline-none cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
          </button>

          <button className="text-white/40 hover:text-white transition-colors outline-none cursor-pointer">
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}

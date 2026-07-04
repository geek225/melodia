"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Play, Pause, Mic2, Heart, Shield, SkipBack, SkipForward } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import CommunityGallery from "./components/CommunityGallery";

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const skipBack = () => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10); };
  const skipFwd  = () => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10); };

  return (
    <div className="min-h-screen bg-white font-sans">
      <audio ref={audioRef} src="/audio/suspendu.mp3" preload="metadata" />

      {/* ─── NAVBAR ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" alt="Melodia Logo" width={160} height={52} className="h-14 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
          <a href="#styles" className="hover:text-gray-900 transition-colors">Styles</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors hidden md:block">
            Se connecter
          </Link>
          <Link href="/register" className="flex items-center gap-1.5 h-10 px-5 rounded-full bg-linear-to-r from-[#FF6B00] to-pink-500 text-white text-sm font-bold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-orange-500/20">
            Commencer
          </Link>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="min-h-screen flex items-center pt-16 px-6 md:px-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-br from-purple-50 via-white to-orange-50 z-0" />
        <div className="absolute top-20 right-0 w-150 h-150 bg-purple-200/30 rounded-full blur-[120px] z-0" />
        <div className="absolute bottom-0 left-0 w-100 h-100 bg-orange-200/20 rounded-full blur-[100px] z-0" />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-gray-900">
                Ton histoire.
              </h1>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-500">
                Ta musique.
              </h1>
              <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-linear-to-r from-[#FF6B00] to-pink-500">
                Ton émotion.
              </h1>
            </div>

            <p className="text-lg text-gray-500 max-w-md leading-relaxed">
              Notre IA transforme tes idées en chansons uniques, avec ta voix, ton style et ton émotion.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-linear-to-r from-[#FF6B00] to-pink-500 text-white font-bold text-base hover:opacity-90 transition-all hover:scale-105 shadow-xl shadow-orange-500/25">
                <Sparkles className="w-5 h-5" />
                Créer ma première chanson
              </Link>
              <button onClick={togglePlay} className="flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-gray-200 text-gray-700 font-bold text-base hover:border-purple-400 hover:text-purple-600 transition-all">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause" : "Écouter des exemples"}
              </button>
            </div>
          </div>

          {/* Right — Headphones image */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-105 h-105 md:w-125 md:h-125">
              <Image
                src="/images/hero_headphones.png"
                alt="Casque premium Melodia AI"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
              {["♪", "♫", "♩", "♬"].map((note, i) => (
                <span
                  key={i}
                  className="absolute text-2xl font-bold animate-bounce"
                  style={{
                    top: `${[15, 60, 20, 70][i]}%`,
                    left: `${[80, 85, 5, 0][i]}%`,
                    color: ["#FF6B00", "#a855f7", "#ec4899", "#FF6B00"][i],
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${2 + i * 0.3}s`,
                  }}
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── REAL AUDIO PLAYER ─── */}
      <section id="examples" className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden p-8 space-y-6">
          {/* Song info */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-purple-600 to-orange-400 flex items-center justify-center text-4xl shrink-0 shadow-lg">
              🎶
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900">Suspendu (Gospel)</h3>
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Gospel</span>
              <p className="text-xs text-gray-400 mt-1">Melodia AI · Exemple de création</p>
            </div>
          </div>

          {/* Waveform / Progress bar */}
          <div className="space-y-2">
            <div
              className="w-full h-3 bg-gray-100 rounded-full cursor-pointer overflow-hidden"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-linear-to-r from-[#FF6B00] via-pink-500 to-purple-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>{fmt(currentTime)}</span>
              <span>{duration ? fmt(duration) : "--:--"}</span>
            </div>
          </div>

          {/* Animated waveform bars */}
          <div className="flex items-center justify-center gap-0.5 h-12">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-150"
                style={{
                  height: isPlaying
                    ? `${(30 + Math.sin(i * 0.7 + currentTime * 5) * 30 + ((i % 5) * 5)).toFixed(2)}%`
                    : `${(15 + Math.sin(i * 0.5) * 10).toFixed(2)}%`,
                  backgroundColor: i / 40 < progress / 100 ? "transparent" : "#e5e7eb",
                  backgroundImage: i / 40 < progress / 100 ? "linear-gradient(to top, #FF6B00, #ec4899)" : "none",
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={skipBack}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              title="-10s"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-linear-to-br from-[#FF6B00] to-pink-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/30 hover:scale-110 transition-transform"
            >
              {isPlaying
                ? <Pause className="w-7 h-7 fill-white" />
                : <Play className="w-7 h-7 fill-white ml-1" />
              }
            </button>

            <button
              onClick={skipFwd}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              title="+10s"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Pulse animation when playing */}
          {isPlaying && (
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-linear-to-t from-[#FF6B00] to-pink-500 animate-pulse"
                  style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
              <span className="text-xs text-gray-400 ml-2 font-medium">En lecture...</span>
            </div>
          )}
        </div>
      </section>

      {/* ─── COMMUNITY GALLERY ─── */}
      <CommunityGallery />

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 px-6 md:px-12 bg-linear-to-br from-purple-50 to-orange-50">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-14">
          <p className="text-sm font-bold text-[#FF6B00] uppercase tracking-widest">Pour toutes tes idées</p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">Une expérience simple, puissante et humaine</h2>
          <p className="text-gray-500 text-lg">Tout ce dont tu as besoin pour donner vie à ta musique.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              color: "from-[#FF6B00] to-orange-400",
              title: "Génération IA avancée",
              desc: "Choisis ton style, ton ambiance et laisse l'IA composer une musique unique qui te correspond.",
            },
            {
              icon: Mic2,
              color: "from-purple-500 to-pink-500",
              title: "Paroles synchronisées",
              desc: "Profite d'un lecteur premium avec les paroles qui défilent en temps réel pendant l'écoute.",
            },
            {
              icon: Heart,
              color: "from-pink-500 to-rose-500",
              title: "Émotion garantie",
              desc: "Des chansons qui touchent le cœur et créent des souvenirs inoubliables.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${f.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES / STYLES ─── */}
      <section id="styles" className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-sm font-bold text-purple-600 uppercase tracking-widest">Explore les genres</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">Trouve ton rythme</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Découvre les styles les plus populaires et crée ta propre version en quelques clics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: "afrobeat", name: "Afrobeat", image: "/images/styles/afrobeats_style.png" },
              { id: "amapiano", name: "Amapiano", image: "/images/styles/amapiano_style.png" },
              { id: "coupe", name: "Coupé Décalé", image: "/images/styles/coupe_decale_style.png" },
              { id: "gospel", name: "Gospel", image: "/images/styles/gospel_style.png" },
              { id: "pop", name: "Pop & R&B", image: "/images/styles/pop_rb_style.png" },
              { id: "rumba", name: "Rumba Congolaise", image: "/images/styles/rumba_congolaise_style.png" },
            ].map((style, idx) => (
              <div 
                key={style.id} 
                className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Image Background */}
                <Image 
                  src={style.image} 
                  alt={style.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-bold text-white mb-2">{style.name}</h3>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <span className="text-sm font-medium text-purple-300">Créer avec ce style</span>
                      <Play className="w-4 h-4 text-purple-300" />
                    </div>
                  </div>
                </div>

                {/* Animated Border on hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500/50 rounded-3xl transition-colors duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-6 md:px-12 border-t border-gray-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-gray-400">
          <Shield className="w-4 h-4" />
          <p className="text-sm">Tes données sont sécurisées et ne seront jamais partagées.</p>
        </div>
        <p className="text-sm text-gray-400">© 2026 Melodia AI. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

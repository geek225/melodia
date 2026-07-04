"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTrack } from "./actions";
import Image from "next/image";
import { Music2, Play, Pause, FastForward, Rewind, Heart, Shuffle, Repeat, Check, ArrowLeft, Loader2, Mic, MicOff } from "lucide-react";
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

const CREATE_REASONS = [
  { id: "cadeau", title: "Offrir un cadeau unique", desc: "Crée une chanson personnalisée pour un être cher.", icon: "🎁" },
  { id: "surprise", title: "Faire une surprise", desc: "Fais plaisir avec une chanson qui marque les esprits.", icon: "🎉" },
  { id: "sentiments", title: "Exprimer mes sentiments", desc: "Mets tes émotions en mots et en musique.", icon: "💖" },
  { id: "fun", title: "Juste pour le fun", desc: "Crée quelque chose de cool, original et amusant.", icon: "😎" },
  { id: "decouvrir", title: "Je veux découvrir", desc: "Laisse l'IA t'inspirer et t'aider à créer ta musique.", icon: "🔍" },
];

const STYLE_OPTIONS = [
  { id: "Afrobeats", label: "Afrobeat", desc: "Rythmes africains", icon: "🥁" },
  { id: "Amapiano", label: "Amapiano", desc: "Ambiance lounge", icon: "🎹" },
  { id: "Pop / R&B", label: "R&B", desc: "Mélodies douces", icon: "🎤" },
  { id: "Rap / Hip-Hop", label: "Rap / Hip-Hop", desc: "Flow percutant", icon: "🎧" },
  { id: "Coupé-Décalé", label: "Coupé-Décalé", desc: "Ambiance festive", icon: "👞" },
  { id: "Gospel", label: "Gospel", desc: "Spiritualité, foi", icon: "🙏" },
  { id: "Acoustique", label: "Acoustique", desc: "Simplicité", icon: "🎸" },
  { id: "Reggae", label: "Reggae", desc: "Vibes positives", icon: "🇯🇲" },
];

export default function NewCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFundsModal, setShowFundsModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    reason: "",
    title: "",
    prompt: "",
    style: "",
    voice: "",
  });

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioSrc = "/audio/suspendu.mp3"; 

  const togglePlay = () => {
    if (!audioRef.current || !audioSrc) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error("Playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (total > 0) setProgress((current / total) * 100);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const nextStep = () => setStep((s) => s < 5 ? s + 1 : s);
  const updateForm = (key: string, value: string) => setFormData({ ...formData, [key]: value });

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setErrorMsg("");
      setStep(5); // Show the big loading screen

      const finalFormData = {
        title: formData.title || "Ma Musique",
        prompt: formData.prompt, // send just the prompt, actions.ts will format it
        style: formData.style,
        mood: "Énergique",
        language: "Français",
        voice: formData.voice || "Duo", // use selected voice
        duration: "1min30s"
      };

      const result = await createTrack(finalFormData);
      
      if (result && !result.success) {
        setIsGenerating(false);
        setStep(4); // Go back to show error
        if (result.error === 'INSUFFICIENT_FUNDS') {
          setShowFundsModal(true);
        } else {
          setErrorMsg(result.message || result.error || "Une erreur est survenue lors de la création.");
        }
        return;
      }
      
      setTimeout(() => {
        if (result && result.trackId) router.push(`/music/${result.trackId}`);
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
      setStep(4); // Go back to show error
      setErrorMsg(error instanceof Error ? error.message : "Erreur de connexion au serveur");
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !formData.reason) return true;
    if (step === 2 && (!formData.title || !formData.prompt)) return true;
    if (step === 3 && (!formData.style || !formData.voice)) return true;
    return false;
  };

  // Voice to Text State
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Désolé, ton navigateur ne supporte pas la saisie vocale.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1][0].transcript;
      setFormData(prev => ({ 
        ...prev, 
        prompt: prev.prompt ? `${prev.prompt} ${current}` : current 
      }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => {
      console.error("Speech recognition error", e);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col lg:flex-row text-foreground">
      
      {/* Left Sidebar — hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex w-[30%] xl:w-[25%] min-h-screen bg-[#0B0B0F] text-white flex-col overflow-hidden shadow-2xl sticky top-0 self-start h-screen">
        <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen">
          <Image 
            src={step <= 2 ? '/images/sidebars/sidebar_mic.png' : '/images/sidebars/sidebar_headphones.png'} 
            alt="Background" 
            fill 
            className="object-cover transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0B0F]/80 via-transparent to-[#0B0B0F]"></div>
        </div>
        
        <div className="relative z-20 flex-1 flex flex-col p-8 xl:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-[#FF6B00] rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-[#FF6B00]/20">
                <Music2 className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Melodia</span>
            </div>
            <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border border-white/5">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </div>

          <div className="mt-10">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Ton histoire.<br/>
              Ta musique.<br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-[#FF6B00]">Ton émotion.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-70">
              Notre IA transforme tes idées en chansons uniques, avec ta voix, ton style et ton émotion.
            </p>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Sécurisé et privé à 100%</p>
                <p className="text-xs text-white/50">Tes créations t&apos;appartiennent.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-20">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-[#FF6B00] rounded-xl flex items-center justify-center">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Melodia</span>
          </div>
          <div className="w-10" />{/* Spacer */}
        </div>

        {/* Stepper Header */}
        <div className="w-full max-w-3xl mx-auto pt-6 md:pt-10 pb-4 md:pb-6 px-4 md:px-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-linear-to-r from-purple-500 to-[#FF6B00] rounded-full z-0 transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
            
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-1">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-colors shadow-sm
                  ${step === i ? 'bg-linear-to-r from-purple-500 to-[#FF6B00] text-white' : 
                    step > i ? 'bg-white border-2 border-purple-500 text-purple-500' : 'bg-white border border-gray-200 text-gray-400'}`}>
                  {i}
                </div>
                <span className={`text-[10px] md:text-xs font-semibold hidden sm:block ${step === i ? 'text-purple-600' : 'text-gray-400'}`}>
                  {i === 1 ? 'Type' : i === 2 ? 'Détails' : i === 3 ? 'Style' : i === 4 ? 'Aperçu' : 'Paiement'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full px-4 md:px-6 pb-32 overflow-y-auto">

          
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-6 md:mt-10">
              <div className="text-center mb-6 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Pourquoi tu veux créer une <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-[#FF6B00]">musique</span> ?</h2>
                <p className="text-gray-500 text-sm md:text-base">Dis-nous ce qui t&apos;amène ici, on s&apos;occupe du reste.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {CREATE_REASONS.map((r) => (
                  <div 
                    key={r.id}
                    onClick={() => updateForm('reason', r.title)}
                    className={`bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 cursor-pointer border-2 transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col items-center text-center
                      ${formData.reason === r.title ? 'border-purple-500 shadow-xl shadow-purple-500/10 relative' : 'border-transparent shadow-sm'}`}
                  >
                    {formData.reason === r.title && (
                      <div className="absolute top-4 right-4 bg-purple-500 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="text-4xl md:text-5xl mb-3 md:mb-4 p-3 md:p-4 bg-gray-50 rounded-full">{r.icon}</div>
                    <h3 className="font-bold text-base md:text-lg mb-1 md:mb-2">{r.title}</h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mt-6 md:mt-10">
               <div className="text-center mb-6 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Parle-nous de ton <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-[#FF6B00]">idée</span> ✨</h2>
                <p className="text-gray-500 text-sm md:text-base">Ces informations nous aident à personnaliser la chanson.</p>
              </div>
              <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm space-y-5 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">Titre de la chanson <span className="w-2 h-2 rounded-full bg-purple-500"></span></label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    placeholder="Ex: Joyeux anniversaire Kevin" 
                    className="h-12 md:h-14 text-base md:text-lg rounded-[16px] px-4 md:px-6 border-gray-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">Détails de ton histoire <span className="w-2 h-2 rounded-full bg-purple-500"></span></label>
                  <div className="relative">
                    <Textarea 
                      value={formData.prompt}
                      onChange={(e) => updateForm("prompt", e.target.value)}
                      placeholder={isListening ? "Écoute en cours..." : "Raconte ton histoire, donne quelques mots clés..."} 
                      className={`min-h-32 md:min-h-37.5 text-base md:text-lg rounded-[16px] p-4 md:p-6 pb-14 border-gray-200 focus:border-purple-500 resize-none transition-colors ${
                        isListening ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/50' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`absolute bottom-4 right-4 p-3 rounded-full flex items-center justify-center transition-all ${
                        isListening 
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 animate-pulse' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-purple-600'
                      }`}
                      title={isListening ? "Arrêter l'enregistrement" : "Parler"}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-6 md:mt-10">
              <div className="text-center mb-6 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Quel style de musique <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-[#FF6B00]">préfères-tu</span> ?</h2>
                <p className="text-gray-500 text-sm md:text-base">Tu pourras changer à chaque chanson.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
                {STYLE_OPTIONS.map((style) => (
                  <div 
                    key={style.id}
                    onClick={() => updateForm('style', style.id)}
                    className={`bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 cursor-pointer border-2 transition-all hover:shadow-lg flex flex-col items-center text-center
                      ${formData.style === style.id ? 'border-purple-500 shadow-xl shadow-purple-500/10' : 'border-transparent shadow-sm'}`}
                  >
                    <div className="text-3xl md:text-4xl mb-2 md:mb-3">{style.icon}</div>
                    <h3 className="font-bold text-sm md:text-md mb-0.5 md:mb-1">{style.label}</h3>
                    <p className="text-gray-500 text-[10px] md:text-xs">{style.desc}</p>
                  </div>
                ))}
              </div>
              
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Choisis la <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-[#FF6B00]">voix</span> 🎤</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div 
                  onClick={() => updateForm('voice', 'Homme')}
                  className={`bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 cursor-pointer border-2 transition-all hover:shadow-lg flex flex-col items-center text-center
                    ${formData.voice === 'Homme' ? 'border-purple-500 shadow-xl shadow-purple-500/10' : 'border-transparent shadow-sm'}`}
                >
                  <div className="text-4xl mb-3">👨🏽‍🎤</div>
                  <h3 className="font-bold text-lg">Homme</h3>
                </div>
                <div 
                  onClick={() => updateForm('voice', 'Femme')}
                  className={`bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 cursor-pointer border-2 transition-all hover:shadow-lg flex flex-col items-center text-center
                    ${formData.voice === 'Femme' ? 'border-purple-500 shadow-xl shadow-purple-500/10' : 'border-transparent shadow-sm'}`}
                >
                  <div className="text-4xl mb-3">👩🏽‍🎤</div>
                  <h3 className="font-bold text-lg">Femme</h3>
                </div>
              </div>
            </motion.div>
          )}
          
          {step === 4 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mt-10">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-3">Résumé de ta <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-[#FF6B00]">création</span></h2>
                  <p className="text-gray-500">Vérifie si tout est correct.</p>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-2">
                    {STYLE_OPTIONS.find(s => s.id === formData.style)?.icon || "🎵"}
                  </div>
                  <h3 className="text-2xl font-bold">{formData.title}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="inline-block bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {formData.style}
                    </div>
                    <div className="inline-block bg-orange-50 text-[#FF6B00] px-3 py-1 rounded-full text-sm font-semibold">
                      Voix : {formData.voice}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm italic border-t pt-4">&quot;{formData.prompt}&quot;</p>
                  {errorMsg && (
                    <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200">
                      {errorMsg}
                    </div>
                  )}
                </div>
             </motion.div>
          )}
          
          {step === 5 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mt-20 text-center">
              <div className="w-32 h-32 mx-auto relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 rounded-full border-[6px] border-purple-500/30 border-t-purple-500 animate-spin"></div>
                <div className="absolute inset-4 rounded-full border-4 border-[#FF6B00]/30 border-b-[#FF6B00] animate-[spin_1.5s_linear_infinite_reverse]"></div>
                <span className="text-4xl">🎵</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Création de la magie...</h2>
              <p className="text-gray-500 text-lg">Cela peut prendre quelques minutes.</p>
            </motion.div>
          )}

        </div>

        {/* Floating Bottom Action Bar */}
        {step < 5 && (
          <div className="sticky bottom-0 left-0 right-0 bg-linear-to-t from-[#F9FAFB] via-[#F9FAFB]/90 to-transparent pt-6 pb-6 md:pb-8 flex flex-col items-center justify-center z-10">
            <Button 
              onClick={step === 4 ? handleGenerate : nextStep} 
              disabled={isNextDisabled() || isGenerating}
              className="h-12 md:h-14 rounded-full px-8 md:px-12 text-base md:text-lg font-bold bg-linear-to-r from-purple-500 to-[#FF6B00] hover:scale-105 transition-transform text-white shadow-xl shadow-[#FF6B00]/20 flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {step === 4 ? "Générer (10 Mélodies)" : "Continuer"} 
              {!isGenerating && <ArrowLeft className="w-5 h-5 rotate-180" />}
            </Button>
            {step === 2 && (
              <p className="text-xs text-gray-400 mt-4">🔒 Tes données sont sécurisées et ne seront jamais partagées.</p>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar - Floating Player */}
      <div className="hidden xl:flex w-75 bg-white border-l border-gray-100 flex-col p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] relative z-20">
         {audioSrc && (
           <audio 
             ref={audioRef} 
             src={audioSrc} 
             onTimeUpdate={handleTimeUpdate}
             onEnded={() => setIsPlaying(false)}
           />
         )}
         <div className="w-full aspect-4/5 bg-gray-100 rounded-3xl overflow-hidden relative mb-6 shadow-md mt-10">
           <Image src="/images/styles/afrobeats_style.png" alt="Player cover" fill className="object-cover" />
           <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-4">
             {/* Fake waveform */}
             <div className="flex items-end justify-center gap-1 h-10 opacity-80">
               {[...Array(20)].map((_, i) => (
                 <div key={i} className={`w-1 bg-white rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ height: `${30 + (i * 17 % 60)}%`, animationDelay: `${(i * 0.13) % 1}s` }}></div>
               ))}
             </div>
           </div>
           {/* Play button overlay */}
           <div onClick={togglePlay} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-purple-600 shadow-xl cursor-pointer hover:scale-110 transition-transform">
             {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
           </div>
         </div>
         
         <div className="text-center mb-8">
           <h3 className="font-bold text-lg">Suspendu (Gospel)</h3>
           <p className="text-gray-500 text-sm">Instrumental</p>
         </div>
         
         <div className="flex justify-center mb-8">
           <Heart className="w-6 h-6 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
         </div>
         
         <div className="space-y-2 mb-8">
           <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
           </div>
           <div className="flex justify-between text-xs text-gray-400 font-medium">
             <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
             <span>{formatTime(audioRef.current?.duration || 0)}</span>
           </div>
         </div>
         
         <div className="flex items-center justify-between px-2 text-gray-600">
           <Shuffle className="w-5 h-5 cursor-pointer hover:text-purple-500 transition-colors" />
           <Rewind className="w-6 h-6 cursor-pointer hover:text-purple-500 transition-colors fill-current" />
           <div onClick={togglePlay} className="w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-[#FF6B00] text-white flex items-center justify-center shadow-lg shadow-purple-500/30 cursor-pointer hover:scale-105 transition-transform">
             {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
           </div>
           <FastForward className="w-6 h-6 cursor-pointer hover:text-purple-500 transition-colors fill-current" />
           <Repeat className="w-5 h-5 cursor-pointer hover:text-purple-500 transition-colors" />
         </div>
         
         <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-center gap-3 text-gray-400 text-sm">
           <Music2 className="w-4 h-4" /> En attendant, écoute des exemples
         </div>
      </div>

      {/* AlertDialog pour Solde Insuffisant */}
      <AlertDialog open={showFundsModal} onOpenChange={setShowFundsModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Solde de Mélodies insuffisant</AlertDialogTitle>
            <AlertDialogDescription>
              Vous n&apos;avez pas assez de Mélodies pour générer cette musique. Une chanson coûte 10 Mélodies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white" onClick={() => router.push('/credits')}>
              Acheter des Mélodies
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

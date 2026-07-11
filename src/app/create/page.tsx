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
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
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

const STYLE_CATEGORIES = [
  {
    id: "afrique_ouest",
    title: "Afrique de l'Ouest 🇨🇮 🇳🇬 🇸🇳",
    styles: [
      { id: "Coupé-Décalé", label: "Coupé-Décalé", desc: "Atalaku, boucan, Abidjan", icon: "👞" },
      { id: "Rap Ivoire / Drill", label: "Rap Ivoire", desc: "Nouchi flow authentique", icon: "🎤" },
      { id: "Zouglou", label: "Zouglou", desc: "Woyo, contes, ambiance", icon: "🥁" },
      { id: "Afrobeats", label: "Afrobeats", desc: "Naija groove Lagos", icon: "🇳🇬" },
      { id: "Mbalax", label: "Mbalax", desc: "Sabar, kora, Dakar", icon: "🇸🇳" },
    ]
  },
  {
    id: "afrique_centrale",
    title: "Afrique Centrale 🇨🇩 🇨🇲",
    styles: [
      { id: "Rumba Congolaise", label: "Rumba", desc: "Sebene, romantique, Kinshasa", icon: "🎸" },
      { id: "Afro-Congo", label: "Afro-Congo", desc: "Ndombolo, énergie, club", icon: "🕺" },
    ]
  },
  {
    id: "afrique_sud_est",
    title: "Afrique Sud & Est 🇿🇦 🇹🇿",
    styles: [
      { id: "Amapiano", label: "Amapiano", desc: "Log drum, deep house, Joburg", icon: "🎹" },
      { id: "Bongo Flava", label: "Bongo Flava", desc: "Swahili pop, Dar es Salaam", icon: "🇹🇿" },
    ]
  },
  {
    id: "maghreb_diaspora",
    title: "Maghreb & Diaspora 🌍",
    styles: [
      { id: "Raï / Pop Urbaine", label: "Raï Moderne", desc: "Oran, darbuka, urbain", icon: "🇩🇿" },
      { id: "Kizomba", label: "Kizomba", desc: "Sensuel, Luanda, semba", icon: "🇦🇴" },
      { id: "Pop / R&B", label: "Pop R&B", desc: "Radio, mélodies émotives", icon: "🎧" },
      { id: "Gospel", label: "Gospel", desc: "Chœur puissant, église", icon: "🙏" },
    ]
  },
  {
    id: "europe_diaspora",
    title: "Europe & Pop Française 🇫🇷 🎶",
    styles: [
      { id: "Chanson Française", label: "Chanson Française", desc: "Cabaret, Paris, poétique", icon: "🥂" },
      { id: "Afro Trap France", label: "Afro Trap France", desc: "Banlieue, afro, urban", icon: "🏙️" },
      { id: "Soul / Jazz France", label: "Soul Jazz", desc: "Club intime, soul, sax", icon: "🎷" },
      { id: "Rap Français", label: "Rap Français", desc: "Flow FR, Boom Bap / Trap", icon: "🇫🇷" },
    ]
  },
  {
    id: "rap_us",
    title: "Rap International 🇺🇸 🌐",
    styles: [
      { id: "Rap Américain", label: "Rap Américain", desc: "Flow US, Trap Atlanta / NY", icon: "🇺🇸" },
    ]
  }
];

const STYLE_OPTIONS = STYLE_CATEGORIES.flatMap(c => c.styles);

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
    styles: [] as string[], // tableau de styles sélectionnés (max 3)
    voice: "",
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState("afrique_ouest");

  // Voice Recording State
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Choisir le meilleur format supporté par le navigateur (mp4 > ogg > webm)
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setVoiceBlob(audioBlob);
        setVoicePreviewUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 29) {
             stopRecording();
             return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
      toast.error("Veuillez autoriser l'accès au microphone pour vous enregistrer.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  // Step 2 Audio Recording State
  const [step2InputType, setStep2InputType] = useState<"text" | "audio">("text");
  const [promptAudioBlob, setPromptAudioBlob] = useState<Blob | null>(null);
  const [promptAudioPreviewUrl, setPromptAudioPreviewUrl] = useState<string | null>(null);
  const [isPromptRecording, setIsPromptRecording] = useState(false);
  const [promptRecordingTime, setPromptRecordingTime] = useState(0);
  const promptMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const promptAudioChunksRef = useRef<Blob[]>([]);
  const promptRecordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startPromptRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Choisir le meilleur format supporté par le navigateur (mp4 > ogg > webm)
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
        ? 'audio/ogg;codecs=opus'
        : 'audio/webm';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      promptMediaRecorderRef.current = mediaRecorder;
      promptAudioChunksRef.current = [];
      setPromptRecordingTime(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          promptAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(promptAudioChunksRef.current, { type: mimeType });
        setPromptAudioBlob(audioBlob);
        setPromptAudioPreviewUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsPromptRecording(true);
      promptRecordingTimerRef.current = setInterval(() => {
        setPromptRecordingTime((prev) => {
          if (prev >= 29) {
             stopPromptRecording();
             return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
      toast.error("Veuillez autoriser l'accès au microphone pour vous enregistrer.");
    }
  };

  const stopPromptRecording = () => {
    if (promptMediaRecorderRef.current && promptMediaRecorderRef.current.state === "recording") {
      promptMediaRecorderRef.current.stop();
    }
    if (promptRecordingTimerRef.current) clearInterval(promptRecordingTimerRef.current);
    setIsPromptRecording(false);
  };

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

  const toggleStyle = (styleId: string) => {
    setFormData(prev => {
      const current = prev.styles;
      if (current.includes(styleId)) {
        // Désélectionner
        return { ...prev, styles: current.filter(s => s !== styleId) };
      } else if (current.length < 3) {
        // Sélectionner (max 3)
        return { ...prev, styles: [...current, styleId] };
      }
      return prev; // Déjà 3 sélectionnés, on ignore
    });
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setErrorMsg("");
      setStep(5); // Show the big loading screen
      
      let finalCoverUrl = null;
      if (coverImage) {
        const supabase = createClient();
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(filePath, coverImage);
          
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('covers')
            .getPublicUrl(filePath);
          finalCoverUrl = publicUrl;
        } else {
          console.error("Cover upload error:", uploadError);
        }
      }

      let finalVoiceUrl = null;
      if (formData.voice === "Clonage" && voiceBlob && step2InputType !== 'audio') {
        const supabase = createClient();
        // Extension dynamique selon le format réel du Blob
        const voiceExt = voiceBlob.type.includes('mp4') ? 'mp4'
          : voiceBlob.type.includes('ogg') ? 'ogg'
          : 'webm';
        const fileName = `voice_${Math.random().toString(36).substring(2, 15)}.${voiceExt}`;
        
        const { error: uploadVoiceError } = await supabase.storage
          .from('voices')
          .upload(fileName, voiceBlob, { contentType: voiceBlob.type });
          
        if (!uploadVoiceError) {
          const { data: { publicUrl } } = supabase.storage
            .from('voices')
            .getPublicUrl(fileName);
          finalVoiceUrl = publicUrl;
        } else {
          console.error("Voice upload error:", uploadVoiceError);
        }
      }

      let finalPromptAudioUrl = null;
      if (step2InputType === 'audio' && promptAudioBlob) {
        const supabase = createClient();
        // Extension dynamique selon le format réel du Blob
        const promptExt = promptAudioBlob.type.includes('mp4') ? 'mp4'
          : promptAudioBlob.type.includes('ogg') ? 'ogg'
          : 'webm';
        const fileName = `prompt_audio_${Math.random().toString(36).substring(2, 15)}.${promptExt}`;
        
        const { error: uploadPromptAudioError } = await supabase.storage
          .from('voices')
          .upload(fileName, promptAudioBlob, { contentType: promptAudioBlob.type });
          
        if (!uploadPromptAudioError) {
          const { data: { publicUrl } } = supabase.storage
            .from('voices')
            .getPublicUrl(fileName);
          finalPromptAudioUrl = publicUrl;
        } else {
          console.error("Prompt audio upload error:", uploadPromptAudioError);
        }
      }

      // Fusionner les styles sélectionnés en une étiquette lisible
      const styleLabelMerged = formData.styles.length > 0
        ? formData.styles.map(s => STYLE_OPTIONS.find(o => o.id === s)?.label || s).join(' + ')
        : "Afrobeats";

      const finalFormData = {
        title: formData.title || "Ma Musique",
        prompt: step2InputType === 'audio' ? "" : formData.prompt,
        style: styleLabelMerged,
        styles: formData.styles,
        mood: "Énergique",
        language: "Français",
        voice: formData.voice || "Duo",
        duration: "1min30s",
        coverUrl: finalCoverUrl,
        voiceUrl: finalVoiceUrl,
        promptAudioUrl: finalPromptAudioUrl,
        // Durée réelle de l'enregistrement en secondes (pour continueAt de l'API Suno)
        audioRecordingDuration: step2InputType === 'audio'
          ? Math.max(1, promptRecordingTime)   // enregistrement vocal pour l'ambiance
          : Math.max(1, recordingTime)          // enregistrement pour clonage de voix
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
        if (result && result.trackId) {
          const slug = finalFormData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          router.push(`/music/${result.trackId}-${slug}`);
        }
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
    if (step === 2) {
      if (step2InputType === 'text' && (!formData.title || !formData.prompt)) return true;
      if (step2InputType === 'audio' && !promptAudioBlob) return true;
    }
    if (step === 3) {
      if (formData.styles.length === 0 || (step2InputType !== 'audio' && !formData.voice)) return true;
      if (formData.voice === "Clonage" && !voiceBlob && step2InputType !== 'audio') return true;
    }
    return false;
  };

  const handleAutoInspire = () => {
    if (!formData.title) {
      alert("Écris d'abord un titre de chanson pour que je puisse t'inspirer !");
      return;
    }
    setFormData(prev => ({
      ...prev,
      prompt: `Une chanson entraînante parlant de ${prev.title}. Le rythme est plein d'émotion et d'énergie.`
    }));
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
      if (e.error === 'not-allowed') {
        toast.error("Veuillez autoriser l'accès au microphone dans votre navigateur.");
      } else {
        toast.error(`Erreur du micro: ${e.error}`);
      }
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
            <div className="flex items-center">
              <Image src="/images/logo.png" alt="Melodia Logo" width={180} height={60} className="h-16 w-auto object-contain drop-shadow-md" />
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
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="Melodia Logo" width={140} height={48} className="h-12 w-auto object-contain" />
          </div>
          <div className="w-10" />{/* Spacer */}
        </div>

        {/* Stepper Header */}
        <div className="w-full max-w-3xl mx-auto pt-6 md:pt-10 pb-4 md:pb-6 px-4 md:px-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-linear-to-r from-purple-500 to-[#FF6B00] rounded-full z-0 transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
            
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`relative z-10 flex flex-col items-center gap-1 ${i < step && step < 5 ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => {
                  if (i < step && step < 5) setStep(i);
                }}
              >
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
                <div className="flex bg-gray-100 p-1 rounded-xl mb-2 w-full md:w-fit mx-auto">
                  <button 
                    type="button"
                    onClick={() => setStep2InputType("text")}
                    className={`flex-1 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${step2InputType === "text" ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    ✍️ Texte
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep2InputType("audio")}
                    className={`flex-1 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${step2InputType === "audio" ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    🎤 Chanter (Audio)
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">Titre de la chanson (Optionnel)<span className="w-2 h-2 rounded-full bg-purple-500"></span></label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    placeholder="Ex: Joyeux anniversaire Kevin" 
                    className="h-12 md:h-14 text-base md:text-lg rounded-[16px] px-4 md:px-6 border-gray-200 focus:border-purple-500"
                  />
                </div>

                {step2InputType === "text" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold flex items-center gap-2">Détails de ton histoire <span className="w-2 h-2 rounded-full bg-purple-500"></span></label>
                    <button 
                      type="button" 
                      onClick={handleAutoInspire}
                      className="text-xs font-semibold text-[#FF6B00] bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                    >
                      ✨ Inspirer
                    </button>
                  </div>
                  <div className="relative">
                    <Textarea 
                      value={formData.prompt}
                      onChange={(e) => updateForm("prompt", e.target.value)}
                      maxLength={1000}
                      placeholder={isListening ? "Écoute en cours..." : "Raconte ton histoire, colle tes paroles ou donne quelques mots clés..."} 
                      className={`min-h-32 md:min-h-37.5 text-base md:text-lg rounded-[16px] p-4 md:p-6 pb-14 border-gray-200 focus:border-purple-500 resize-none transition-colors ${
                        isListening ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/50' : ''
                      }`}
                    />
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 max-w-[60%]">
                      {['[Intro]', '[Couplet]', '[Refrain]', '[Pont]', '[Solo]'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => updateForm("prompt", formData.prompt ? `${formData.prompt}\n${tag}\n` : `${tag}\n`)}
                          className="text-[10px] md:text-xs bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-600 px-2 py-1 rounded border border-gray-200 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className={`absolute bottom-5 right-16 text-xs font-medium ${formData.prompt?.length >= 1000 ? 'text-red-500' : formData.prompt?.length > 900 ? 'text-orange-400' : 'text-gray-400'}`}>
                      {formData.prompt?.length || 0} / 1000
                    </div>
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`absolute bottom-3 right-3 p-2.5 rounded-full flex items-center justify-center transition-all ${
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
                ) : (
                <div className="space-y-4">
                  <div className="p-6 md:p-8 rounded-[24px] border-2 border-dashed border-purple-100 bg-purple-50/30 flex flex-col items-center justify-center text-center">
                    {!promptAudioBlob ? (
                      <>
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                          <Mic className={`w-8 h-8 ${isPromptRecording ? 'animate-pulse text-red-500' : ''}`} />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Chante ta mélodie</h4>
                        <p className="text-sm text-gray-500 mb-6 max-w-sm">
                          Fredonne un air ou chante tes paroles (max 30s). L&apos;IA utilisera cette mélodie pour composer la chanson.
                        </p>
                        
                        {isPromptRecording ? (
                          <div className="w-full max-w-xs space-y-4">
                            <div className="flex items-center justify-between text-sm font-medium text-red-500">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                Enregistrement...
                              </span>
                              <span>0:{promptRecordingTime.toString().padStart(2, '0')} / 0:30</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-red-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(promptRecordingTime / 30) * 100}%` }}></div>
                            </div>
                            <Button onClick={stopPromptRecording} className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full h-12">
                              Arrêter l&apos;enregistrement
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={startPromptRecording} className="bg-purple-600 hover:bg-purple-700 text-white rounded-full h-12 px-8">
                            🎤 Commencer (30s)
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="w-full max-w-sm">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Check className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">Mélodie enregistrée !</h4>
                        <audio src={promptAudioPreviewUrl!} controls className="w-full h-12 mb-4" />
                        <Button variant="outline" onClick={() => { setPromptAudioBlob(null); setPromptAudioPreviewUrl(null); }} className="w-full rounded-full h-10 border-gray-200">
                          Recommencer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                )}
                
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-sm font-bold flex items-center gap-2">Pochette de la musique (Optionnel) 🎨</label>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverImage(file);
                          setCoverPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {coverPreview && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border shadow-sm">
                        <Image src={coverPreview} alt="Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">Si tu ne mets pas d&apos;image, une pochette par défaut (Melodia) sera utilisée.</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-6 md:mt-10">
              <div className="text-center mb-6 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Choisis jusqu&apos;à <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-[#FF6B00]">3 styles</span> à fusionner 🎛️</h2>
                <p className="text-gray-500 text-sm md:text-base">Mix de styles = sons uniques et inédits.</p>
                {/* Badge compteur */}
                <div className="mt-3 inline-flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-full px-4 py-1.5">
                  <span className="text-purple-700 font-bold text-sm">{formData.styles.length}/3 styles sélectionnés</span>
                  {formData.styles.length > 0 && (
                    <span className="text-purple-500 text-xs">
                      {formData.styles.map(s => STYLE_OPTIONS.find(o => o.id === s)?.icon).join(" ")}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-4 mb-10 text-left max-w-2xl mx-auto">
                {STYLE_CATEGORIES.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
                    <button
                      type="button"
                      onClick={() => setOpenCategory(openCategory === category.id ? "" : category.id)}
                      className={`w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors ${openCategory === category.id ? 'bg-purple-50/50 text-purple-700' : 'hover:bg-gray-50 text-gray-800'}`}
                    >
                      <span className="font-bold text-base md:text-lg">{category.title}</span>
                      <span className="text-sm md:text-base text-gray-400">{openCategory === category.id ? '▼' : '▶'}</span>
                    </button>
                    
                    {openCategory === category.id && (
                      <div className="p-4 md:p-5 border-t border-gray-100 bg-gray-50/30">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                          {category.styles.map((style) => {
                            const isSelected = formData.styles.includes(style.id);
                            const isDisabled = !isSelected && formData.styles.length >= 3;
                            return (
                              <div 
                                key={style.id}
                                onClick={() => !isDisabled && toggleStyle(style.id)}
                                className={`bg-white rounded-xl p-3 md:p-4 border-2 transition-all flex flex-col items-center text-center relative
                                  ${isSelected ? 'border-purple-500 shadow-lg shadow-purple-500/10 scale-[1.02] cursor-pointer' 
                                    : isDisabled ? 'border-gray-100 opacity-40 cursor-not-allowed' 
                                    : 'border-transparent shadow-sm hover:shadow-md cursor-pointer'}`}
                              >
                                {isSelected && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )}
                                <div className="text-3xl mb-2">{style.icon}</div>
                                <h3 className="font-bold text-xs md:text-sm mb-1">{style.label}</h3>
                                <p className="text-gray-500 text-[9px] md:text-[10px] leading-tight">{style.desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Choisis la <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-[#FF6B00]">voix</span> 🎤</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div 
                  onClick={() => {
                    if (step2InputType !== 'audio') updateForm('voice', 'Homme')
                  }}
                  className={`bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 transition-all flex flex-col items-center text-center
                    ${step2InputType === 'audio' ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : 'cursor-pointer hover:shadow-lg'}
                    ${formData.voice === 'Homme' ? 'border-purple-500 shadow-xl shadow-purple-500/10' : 'border-transparent shadow-sm'}`}
                >
                  <div className="text-4xl mb-3">👨🏽‍🎤</div>
                  <h3 className="font-bold text-lg">Homme</h3>
                </div>
                <div 
                  onClick={() => {
                    if (step2InputType !== 'audio') updateForm('voice', 'Femme')
                  }}
                  className={`bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 transition-all flex flex-col items-center text-center
                    ${step2InputType === 'audio' ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : 'cursor-pointer hover:shadow-lg'}
                    ${formData.voice === 'Femme' ? 'border-purple-500 shadow-xl shadow-purple-500/10' : 'border-transparent shadow-sm'}`}
                >
                  <div className="text-4xl mb-3">👩🏽‍🎤</div>
                  <h3 className="font-bold text-lg">Femme</h3>
                </div>
                <div 
                  onClick={() => {
                    if (step2InputType !== 'audio') {
                      updateForm('voice', 'Clonage');
                    }
                  }}
                  className={`bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 transition-all flex flex-col items-center text-center col-span-2 md:col-span-1 relative
                    ${step2InputType === 'audio' ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : 'cursor-pointer hover:shadow-lg'}
                    ${formData.voice === 'Clonage' ? 'border-purple-500 shadow-xl shadow-purple-500/10' : 'border-transparent shadow-sm'}`}
                >
                  <div className="absolute -top-3 -right-3 bg-linear-to-r from-purple-500 to-[#FF6B00] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md animate-bounce">
                    15 Mélodies
                  </div>
                  <div className="text-4xl mb-3">🎙️</div>
                  <h3 className="font-bold text-lg">Ma Voix</h3>
                  <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                    {step2InputType === 'audio' ? 'Désactivé (Chansonnette utilisée)' : 'Clonage vocal'}
                  </p>
                </div>
              </div>

              {formData.voice === 'Clonage' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-8 max-w-xl mx-auto w-full">
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-left mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl"></div>
                    <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                      <span className="text-xl">🎧</span> Conseil de pro
                    </h4>
                    <p className="text-sm text-orange-700/90 leading-relaxed">
                      Pour un résultat vraiment magique, utilise des <strong>écouteurs avec micro</strong> (ou place-toi dans une pièce très calme). L&apos;IA a besoin d&apos;entendre ta voix clairement sans bruit de fond.
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    {!voiceBlob ? (
                      <>
                        <h3 className="font-bold text-xl mb-2">Enregistre ta voix (30s max)</h3>
                        <p className="text-gray-500 text-sm mb-8">Parle normalement ou chante quelques mots pour que l&apos;IA capte ton timbre de voix.</p>
                        
                        <div className="relative mb-4">
                          {isRecording && (
                            <>
                              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                              <div className="absolute -inset-4 bg-red-500 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.2s' }}></div>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                              isRecording 
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-110' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                          >
                            {isRecording ? <div className="w-8 h-8 bg-white rounded-sm" /> : <Mic className="w-10 h-10" />}
                          </button>
                        </div>
                        
                        {isRecording && (
                          <div className="text-red-500 font-bold text-2xl tabular-nums tracking-wider mt-4">
                            00:{recordingTime.toString().padStart(2, '0')}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                          <Check className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-xl mb-4">Voix enregistrée !</h3>
                        <audio src={voicePreviewUrl!} controls className="w-full max-w-sm mb-6" />
                        <button
                          type="button"
                          onClick={() => { setVoiceBlob(null); setVoicePreviewUrl(null); }}
                          className="text-purple-600 text-sm font-semibold hover:underline"
                        >
                          Recommencer l&apos;enregistrement
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          
          {step === 4 && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mt-10">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold mb-3">Résumé de ta <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-[#FF6B00]">création</span></h2>
                  <p className="text-gray-500">Vérifie si tout est correct.</p>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-4xl mb-2">
                    {formData.styles.length > 0
                      ? formData.styles.map(s => STYLE_OPTIONS.find(o => o.id === s)?.icon || "🎵").join(" ")
                      : "🎵"}
                  </div>
                  <h3 className="text-2xl font-bold">{formData.title}</h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    {formData.styles.map(s => (
                      <div key={s} className="inline-block bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {STYLE_OPTIONS.find(o => o.id === s)?.label || s}
                      </div>
                    ))}
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
              <p className="text-gray-500 text-lg">Génération des paroles (Qualité Studio)... puis de la musique.</p>
              <p className="text-gray-400 text-sm mt-2">Cela prend généralement 1 à 2 minutes.</p>
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
              {step === 4 ? ((formData.voice === "Clonage" || step2InputType === "audio") ? "Générer (15 Mélodies)" : "Générer (10 Mélodies)") : "Continuer"} 
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const GOALS = [
  { id: "me", label: "Pour moi", icon: "🎧" },
  { id: "gift", label: "Offrir", icon: "🎁" },
  { id: "social", label: "Réseaux sociaux", icon: "📱" },
  { id: "career", label: "Lancer ma carrière", icon: "🎤" },
  { id: "gospel", label: "Gospel", icon: "⛪" },
  { id: "ads", label: "Publicité", icon: "🏢" },
  { id: "other", label: "Autre", icon: "✨" },
];

const STYLES = [
  "Afrobeat", "Amapiano", "Rap", "Hip-hop", "R&B", 
  "Gospel", "Reggae", "Acoustique", "Pop", "Dancehall", "Drill"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const nextStep = () => setStep(prev => prev + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                <span className="text-4xl">🎵</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Bienvenue sur Melodia AI.
              </h1>
              <p className="text-xl text-muted-foreground">
                Créons ensemble votre première musique.
              </p>
              <div className="pt-8">
                <Button onClick={nextStep} className="h-14 px-12 rounded-full text-lg bg-primary hover:bg-primary/90 text-white">
                  Commencer
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Pourquoi veux-tu créer une musique ?</h2>
                <p className="text-muted-foreground">Une seule sélection</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {GOALS.map((g) => (
                  <Card 
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`p-6 cursor-pointer border-2 transition-all rounded-[20px] shadow-sm hover:shadow-md ${
                      goal === g.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="text-4xl mb-4">{g.icon}</div>
                    <div className="font-medium text-lg">{g.label}</div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end pt-8">
                <Button 
                  onClick={nextStep} 
                  disabled={!goal}
                  className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white"
                >
                  Continuer
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Quels styles préfères-tu ?</h2>
                <p className="text-muted-foreground">Sélections multiples</p>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {STYLES.map((style) => {
                  const isSelected = selectedStyles.includes(style);
                  return (
                    <button
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={`px-6 py-3 rounded-full text-sm font-medium border-2 transition-all flex items-center gap-2
                        ${isSelected 
                          ? "border-primary bg-primary text-white" 
                          : "border-border bg-card text-foreground hover:border-primary/50"
                        }`}
                    >
                      {style}
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-8">
                <Button 
                  onClick={nextStep} 
                  disabled={selectedStyles.length === 0}
                  className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white"
                >
                  Continuer
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="mx-auto w-32 h-32 relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
                />
                <div className="absolute inset-0 flex items-center justify-center text-5xl">
                  ✨
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                Ton studio est prêt.
              </h1>
              <p className="text-xl text-muted-foreground">
                Commence à créer ta première musique.
              </p>
              <div className="pt-8">
                <Button 
                  onClick={() => router.push("/dashboard")}
                  className="h-14 px-12 rounded-full text-lg bg-primary hover:bg-primary/90 text-white"
                >
                  Accéder au studio
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

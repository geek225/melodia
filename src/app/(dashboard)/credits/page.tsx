"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Check, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { buyMelodies } from "./actions";
import { useRouter } from "next/navigation";

export default function CreditsPage() {
  const router = useRouter();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBuy = async (packName: string, melodies: number) => {
    setLoadingPack(packName);
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = await buyMelodies(melodies);
    setLoadingPack(null);

    if (result.success) {
      setSuccessMsg(`✅ Paiement réussi ! Vous avez reçu ${melodies} Mélodies. Nouveau solde : ${result.newBalance} Mélodies.`);
      setTimeout(() => setSuccessMsg(null), 6000);
      router.refresh();
    } else {
      setErrorMsg(`❌ Erreur : ${result.error || "Une erreur est survenue."}`);
      setTimeout(() => setErrorMsg(null), 6000);
    }
  };
  const packs = [
    { name: "Pack Découverte", melodies: 10, price: "500", songs: "1 chanson", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-border/50", recommended: false },
    { name: "Pack Starter", melodies: 30, price: "1 000", songs: "3 chansons", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-border/50", recommended: false },
    { name: "Pack Créateur", melodies: 60, price: "1 800", songs: "6 chansons", color: "text-pink-500", bg: "bg-pink-500/10", border: "border-border/50", recommended: false },
    { name: "Pack Studio", melodies: 120, price: "3 000", songs: "12 chansons", color: "text-primary", bg: "bg-primary/10", border: "border-primary border-2", recommended: true },
    { name: "Pack Producteur", melodies: 250, price: "5 500", songs: "25 chansons", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-border/50", recommended: false },
  ];

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight">Boutique des Mélodies</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Les Mélodies sont utilisées uniquement pour générer des chansons (1 chanson = 10 Mélodies). Toutes les autres fonctionnalités de la plateforme sont gratuites.
        </p>
      </div>
      
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center justify-center gap-2 max-w-2xl mx-auto font-medium shadow-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-400 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 max-w-2xl mx-auto font-medium shadow-sm animate-in fade-in slide-in-from-top-4">
          {errorMsg}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {packs.map((pack) => (
          <Card key={pack.name} className={`${pack.border} shadow-sm rounded-[24px] relative flex flex-col transition-transform hover:scale-105 duration-300`}>
            {pack.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Le plus populaire
              </div>
            )}
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="text-center mb-6 mt-2">
                <div className={`w-12 h-12 rounded-2xl ${pack.bg} ${pack.color} flex items-center justify-center mx-auto mb-4`}>
                  <Music className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">{pack.name}</h3>
                <div className="text-3xl font-black">{pack.melodies} <span className="text-sm text-muted-foreground font-normal">Mélodies</span></div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Check className={`w-4 h-4 ${pack.color}`} />
                  <span className="font-medium">{pack.price} FCFA</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className={`w-4 h-4 ${pack.color}`} />
                  <span>Environ {pack.songs}</span>
                </div>
              </div>

              <Button 
                onClick={() => handleBuy(pack.name, pack.melodies)}
                disabled={loadingPack !== null}
                className={`w-full rounded-xl font-bold ${pack.recommended ? 'bg-primary hover:bg-primary/90 text-white' : 'variant-outline'}`}
                variant={pack.recommended ? 'default' : 'outline'}
              >
                {loadingPack === pack.name ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acheter"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

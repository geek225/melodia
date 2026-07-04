"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Demander la permission pour les notifications navigateur
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;

      // Écouter les mises à jour sur la table 'tracks' pour cet utilisateur
      const channel = supabase
        .channel('realtime_tracks')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tracks',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;

            if (oldStatus === 'processing' && newStatus === 'completed') {
              const trackTitle = payload.new.title;
              const coverUrl = payload.new.cover_url;

              // Afficher la notification native du navigateur
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification("🎵 Ta musique est prête !", { 
                  body: `La génération de "${trackTitle}" est terminée. Clique pour l'écouter.`,
                  icon: coverUrl || "/favicon.ico"
                });
              }
              
              // Rafraîchir les données pour mettre à jour l'UI (comme le menu latéral ou la page en cours)
              router.refresh();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    checkUser();
  }, [supabase, router]);

  return <>{children}</>;
}

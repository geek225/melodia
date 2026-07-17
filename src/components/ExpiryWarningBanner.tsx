"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { AlertTriangle, X, Download } from "lucide-react";

/**
 * Bannière d'avertissement clignotante pour les pistes dont l'URL audio
 * risque d'expirer (pistes pointant encore vers le CDN Suno externe).
 *
 * Elle apparaît automatiquement si l'utilisateur a au moins une piste
 * "completed" dont l'audio_url ne pointe pas vers le stockage Supabase.
 *
 * La bannière disparaît si l'utilisateur la ferme (jusqu'à la prochaine session)
 * ou si toutes ses pistes sont archivées.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHostname = (() => {
  try { return new URL(SUPABASE_URL).hostname; } catch { return ""; }
})();

function isExternalAudioUrl(url: string): boolean {
  if (!url || url.startsWith("task:")) return false;
  if (supabaseHostname && url.includes(supabaseHostname)) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

export default function ExpiryWarningBanner() {
  const [count, setCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const key = "meliodia_expiry_banner_dismissed";
    if (sessionStorage.getItem(key) === "1") {
      setDismissed(true);
      setLoaded(true);
      return;
    }

    const fetchUnarchived = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoaded(true); return; }

      const { data: tracks } = await supabase
        .from("tracks")
        .select("audio_url")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .not("audio_url", "is", null);

      const unarchived = (tracks || []).filter(t => isExternalAudioUrl(t.audio_url));
      setCount(unarchived.length);
      setLoaded(true);
    };

    fetchUnarchived();
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("meliodia_expiry_banner_dismissed", "1");
    setDismissed(true);
  };

  if (!loaded || dismissed || count === 0) return null;

  return (
    <div
      className="relative mb-6 rounded-2xl overflow-hidden border border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.15)]"
      style={{
        background: "linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(239,68,68,0.10) 100%)",
        animation: "pulse-border 2s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.15), 0 0 0 1px rgba(251,191,36,0.3); }
          50% { box-shadow: 0 0 40px rgba(251,191,36,0.35), 0 0 0 2px rgba(251,191,36,0.6); }
        }
        @keyframes blink-icon {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div className="flex items-start gap-4 p-4 md:p-5">
        {/* Icône clignotante */}
        <div
          className="shrink-0 w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center"
          style={{ animation: "blink-icon 1.5s ease-in-out infinite" }}
        >
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-amber-400 text-sm md:text-base">
            ⚠️ {count} musique{count > 1 ? "s" : ""} à risque de disparition !
          </p>
          <p className="text-xs md:text-sm text-amber-200/80 mt-1 leading-relaxed">
            Ces musiques sont encore hébergées temporairement sur les serveurs de génération.{" "}
            <strong className="text-amber-300">Au-delà de 7 jours</strong>, elles peuvent devenir inaccessibles.{" "}
            Téléchargez-les dès maintenant pour les conserver définitivement.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <Link
              href="/music"
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-gray-900 text-xs font-bold rounded-full transition-all hover:scale-105 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              Voir mes musiques et télécharger
            </Link>
            <span className="text-xs text-amber-200/60 italic">
              L&apos;archivage permanent se fait automatiquement pour les nouvelles créations.
            </span>
          </div>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={dismiss}
          className="shrink-0 w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-amber-400/60 hover:text-amber-400 transition-colors"
          aria-label="Fermer la bannière"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

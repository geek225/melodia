"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Music2, TrendingUp, Clock, Star, BarChart3, Mic2 } from "lucide-react";

type Track = {
  id: string;
  title: string;
  style: string;
  created_at: string;
};

const STYLE_ICONS: Record<string, string> = {
  "Afrobeats": "🥁",
  "Amapiano": "🎹",
  "Pop / R&B": "🎤",
  "Rap / Hip-Hop": "🎧",
  "Coupé-Décalé": "👞",
  "Gospel": "🙏",
  "Acoustique": "🎸",
  "Reggae": "🇯🇲",
};

export default function StatsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: tracksData }, { data: profile }] = await Promise.all([
        supabase.from("tracks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("credits").eq("id", user.id).single(),
      ]);

      setTracks(tracksData || []);
      setCredits(profile?.credits || 0);
      setLoading(false);
    };
    fetch();
  }, []);

  // Compute stats
  const totalTracks = tracks.length;
  const stylesUsed = [...new Set(tracks.map((t) => t.style).filter(Boolean))];
  const favoriteStyle =
    stylesUsed.length > 0
      ? stylesUsed.reduce((a, b) =>
          tracks.filter((t) => t.style === a).length >= tracks.filter((t) => t.style === b).length ? a : b
        )
      : null;

  const thisMonth = tracks.filter((t) => {
    const d = new Date(t.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Style repartition
  const styleCounts = stylesUsed.map((style) => ({
    style,
    count: tracks.filter((t) => t.style === style).length,
    pct: totalTracks > 0 ? Math.round((tracks.filter((t) => t.style === style).length / totalTracks) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  const statCards = [
    {
      label: "Total créations",
      value: totalTracks,
      icon: Music2,
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      label: "Ce mois-ci",
      value: thisMonth,
      icon: TrendingUp,
      color: "from-[#FF6B00] to-orange-500",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      label: "Styles explorés",
      value: stylesUsed.length,
      icon: Star,
      color: "from-yellow-400 to-yellow-500",
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    {
      label: "Mélodies restantes",
      value: credits,
      icon: Clock,
      color: "from-green-400 to-green-600",
      bg: "bg-green-50",
      text: "text-green-600",
    },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mes Statistiques</h1>
        <p className="text-gray-500 mt-1">Analyse tes créations et ta progression.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-5 flex flex-col gap-3`}>
                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Style repartition */}
          {totalTracks === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Mic2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">Pas encore de créations</h2>
              <p className="text-gray-400 text-sm">Crée ta première chanson pour voir tes statistiques ici !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Favorite style */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" /> Style favori
                </h2>
                {favoriteStyle ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-4xl">
                      {STYLE_ICONS[favoriteStyle] || "🎵"}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{favoriteStyle}</p>
                      <p className="text-sm text-gray-500">
                        {tracks.filter((t) => t.style === favoriteStyle).length} créations dans ce style
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Aucun style encore</p>
                )}
              </div>

              {/* Style repartition bars */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" /> Répartition des styles
                </h2>
                <div className="space-y-3">
                  {styleCounts.slice(0, 5).map((s) => (
                    <div key={s.style}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 flex items-center gap-1">
                          {STYLE_ICONS[s.style] || "🎵"} {s.style}
                        </span>
                        <span className="text-gray-400">{s.count} ({s.pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-purple-500 to-[#FF6B00] rounded-full transition-all duration-700"
                          style={{ width: `${s.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm md:col-span-2">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" /> Activité récente
                </h2>
                <div className="space-y-3">
                  {tracks.slice(0, 5).map((track) => (
                    <div key={track.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl shrink-0">
                        {STYLE_ICONS[track.style] || "🎵"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{track.title}</p>
                        <p className="text-xs text-gray-400">{track.style}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(track.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

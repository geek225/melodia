"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Play, Heart, Flame, Search, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const STYLE_FILTERS = [
  { id: "all", label: "Tendances", icon: "🔥" },
  { id: "Afrobeats", label: "Afrobeat", icon: "🥁" },
  { id: "Amapiano", label: "Amapiano", icon: "🎹" },
  { id: "Pop / R&B", label: "R&B", icon: "🎤" },
  { id: "Rap / Hip-Hop", label: "Rap / Hip-Hop", icon: "🎧" },
  { id: "Coupé-Décalé", label: "Coupé-Décalé", icon: "👞" },
  { id: "Gospel", label: "Gospel", icon: "🙏" },
  { id: "Acoustique", label: "Acoustique", icon: "🎸" },
  { id: "Reggae", label: "Reggae", icon: "🇯🇲" },
];

type Track = {
  id: string;
  title: string;
  style: string;
  created_at: string;
  profiles?: { full_name: string };
};

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      const supabase = createClient();
      let query = supabase
        .from("tracks")
        .select("*, profiles!inner(full_name)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (activeFilter !== "all") {
        query = query.eq("style", activeFilter);
      }

      if (searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery.trim()}%`);
      }

      const { data } = await query;
      setTracks(data || []);
      setLoading(false);
    };

    fetchTracks();
  }, [activeFilter, searchQuery]);

  const filteredTracks = tracks;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explorer</h1>
        <p className="text-muted-foreground mt-1">
          Découvre les meilleures créations de la communauté Melodia AI.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une chanson, un style..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Style Filters */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 scrollbar-none">
        {STYLE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-1.5 ${
              activeFilter === filter.id
                ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-md shadow-[#FF6B00]/20"
                : "bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:text-purple-600"
            }`}
          >
            <span>{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-bold">
          {isSearching ? (
            <>
              <Search className="text-purple-500 w-5 h-5" />
              Résultats pour &quot;{searchQuery}&quot;
            </>
          ) : (
            <>
              <Flame className="text-[#FF6B00] w-6 h-6" />
              {activeFilter === "all"
                ? "En tendance cette semaine"
                : `Catégorie : ${STYLE_FILTERS.find((f) => f.id === activeFilter)?.label}`}
            </>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-[24px] overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2 bg-white">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🎵</div>
            <p className="font-semibold text-lg text-gray-600">Aucune musique trouvée</p>
            <p className="text-sm mt-1">
              {isSearching
                ? "Essaie un autre mot-clé."
                : "Aucune création dans cette catégorie pour l'instant."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTracks.map((track) => (
              <Card
                key={track.id}
                className="border-border/50 shadow-sm rounded-[24px] overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-square bg-muted relative">
                  <div className="absolute inset-0 bg-linear-to-br from-purple-500/20 to-[#FF6B00]/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl opacity-80">
                      {STYLE_FILTERS.find((f) => f.id === track.style)?.icon || "🎵"}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link href={`/music/${track.id}`}>
                      <button className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                        <Play className="w-8 h-8 ml-1 fill-current" />
                      </button>
                    </Link>
                  </div>
                </div>

                <CardContent className="p-4">
                  <Link href={`/music/${track.id}`} className="hover:underline">
                    <h3 className="font-bold text-lg truncate">{track.title}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.profiles?.full_name || "Utilisateur Anonyme"}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full flex items-center gap-1">
                      {STYLE_FILTERS.find((f) => f.id === track.style)?.icon}
                      {track.style || "Musique"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <Heart className="w-3.5 h-3.5" /> 0
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

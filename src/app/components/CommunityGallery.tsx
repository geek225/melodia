'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Heart, Play, Pause, Music } from 'lucide-react';
import { likePublicTrack } from '../actions/gallery';

interface PublicTrack {
  id: string;
  title: string;
  style: string;
  audio_url: string;
  cover_url: string;
  likes_count: number;
}

export default function CommunityGallery() {
  const [tracks, setTracks] = useState<PublicTrack[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTracks = async () => {
      const { data } = await supabase
        .from('tracks')
        .select('id, title, style, audio_url, cover_url, likes_count')
        .eq('is_public', true)
        .not('audio_url', 'is', null) // Only show tracks that are fully generated
        .order('created_at', { ascending: false })
        .limit(6);
        
      if (data) {
        setTracks(data);
      }
      setLoading(false);
    };

    fetchTracks();
  }, [supabase]);

  const handleLike = async (trackId: string) => {
    // Optimistic UI update
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, likes_count: (t.likes_count || 0) + 1 } : t));
    await likePublicTrack(trackId);
  };

  const togglePlay = (trackId: string) => {
    setPlayingId(prev => prev === trackId ? null : trackId);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Chargement de la galerie...</div>;
  }

  if (tracks.length === 0) {
    return null; // Don't show the section if there are no public tracks yet
  }

  return (
    <section className="py-24 px-6 md:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Galerie de la Communauté</h2>
          <p className="text-xl text-gray-600">Écoutez les meilleures créations générées par nos utilisateurs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tracks.map(track => (
            <div key={track.id} className="bg-white rounded-[32px] p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-shadow border border-gray-100 group">
              <div className="aspect-video rounded-2xl overflow-hidden relative mb-6 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={track.cover_url || "/default-cover.png"} 
                  alt={track.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => togglePlay(track.id)}
                    className="w-16 h-16 bg-[#FF6B00] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    {playingId === track.id ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 leading-tight mb-1 line-clamp-1">{track.title}</h3>
                  <p className="text-[#FF6B00] font-medium text-sm flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" /> {track.style || 'Musique'}
                  </p>
                </div>
                <button 
                  onClick={() => handleLike(track.id)}
                  className="flex flex-col items-center justify-center text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <Heart className="w-6 h-6 hover:fill-red-500/20" />
                  <span className="text-xs font-bold mt-1">{track.likes_count || 0}</span>
                </button>
              </div>

              {playingId === track.id && (
                <audio 
                  src={track.audio_url} 
                  autoPlay 
                  onEnded={() => setPlayingId(null)}
                  className="hidden"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

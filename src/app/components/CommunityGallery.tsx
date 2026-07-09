'use client';

import { useState, useEffect } from 'react';

import { Star, Play, Pause, Music } from 'lucide-react';
import { rateFeaturedTrack, getFeaturedTracks } from '../actions/gallery';

interface PublicTrack {
  id: string;
  title: string;
  style: string;
  audio_url: string;
  cover_url: string;
  rating_sum: number;
  rating_count: number;
}

export default function CommunityGallery() {
  const [tracks, setTracks] = useState<PublicTrack[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchTracks = async () => {
      const data = await getFeaturedTracks();
      setTracks(data as unknown as PublicTrack[]);
      setLoading(false);
    };

    fetchTracks();
  }, []);

  const handleRate = async (trackId: string, rating: number) => {
    // Check if already rated in this browser
    const ratedKey = `rated_${trackId}`;
    if (localStorage.getItem(ratedKey)) {
      return; // Already rated
    }
    
    // Optimistic UI update
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, rating_sum: (t.rating_sum || 0) + rating, rating_count: (t.rating_count || 0) + 1 } : t));
    localStorage.setItem(ratedKey, 'true');
    await rateFeaturedTrack(trackId, rating);
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
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">À la Une 🌟</h2>
          <p className="text-xl text-gray-600">Écoutez les meilleures créations du moment et donnez votre avis.</p>
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
                <div className="flex flex-col items-end justify-center text-gray-400">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(track.id, star)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star 
                          className="w-5 h-5 text-yellow-400 hover:fill-yellow-400" 
                          fill={
                            ((track.rating_count > 0 ? track.rating_sum / track.rating_count : 0) >= star) 
                              ? "currentColor" 
                              : "none"
                          } 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold mt-1 bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">
                    {track.rating_count > 0 
                      ? `${(track.rating_sum / track.rating_count).toFixed(1)}/5 (${track.rating_count} avis)`
                      : 'Nouveau !'
                    }
                  </span>
                </div>
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

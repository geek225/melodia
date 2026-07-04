import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Compass, CreditCard, Music2, ArrowRight } from "lucide-react";

import { createClient } from "@/utils/supabase/server";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: recentTracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(3);

  const hasMusic = recentTracks && recentTracks.length > 0;

  return (
    <div className="space-y-10 pb-24 md:pb-8 relative z-10">
      
      {/* Section 1: Big CTA Banner */}
      <div className="relative rounded-[32px] overflow-hidden group shadow-2xl shadow-purple-500/10 border border-white/5 bg-white">
        {/* Abstract Background for Banner */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-purple-900/50 to-[#FF6B00]/30 z-10 mix-blend-overlay"></div>
          <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[200%] bg-purple-500/20 blur-[80px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-50%] left-[-20%] w-[60%] h-[150%] bg-[#FF6B00]/20 blur-[100px] rounded-full"></div>
        </div>
        
        <div className="relative z-10 p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-semibold text-purple-600 mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Studio IA V2.0 Actif
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Donne vie à tes <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-[#FF6B00]">émotions</span>
            </h1>
            <p className="text-gray-500 max-w-2xl">
              Laisse notre intelligence artificielle composer des morceaux uniques, adaptés à ton histoire et à ton style.
            </p>
            <div className="pt-6">
              <Link href="/create" className="inline-block">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold bg-linear-to-r from-purple-600 to-[#FF6B00] hover:scale-105 transition-transform text-white shadow-sm flex items-center gap-3">
                  <PlusCircle className="w-6 h-6" />
                  Créer une musique
                  <ArrowRight className="w-5 h-5 ml-1 opacity-80" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:block relative w-64 h-64">
            <div className="absolute inset-0 bg-linear-to-tr from-purple-200 to-[#FFD8C0] rounded-full blur-[60px] opacity-40"></div>
            <div className="w-full h-full border border-gray-100 bg-white/50 backdrop-blur-xl rounded-[40px] flex items-center justify-center relative overflow-hidden transform rotate-12 hover:rotate-0 transition-transform duration-700">
               <Music2 className="w-24 h-24 text-gray-400" />
               <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-gray-100/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Recent Creations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Mes dernières créations</h2>
          {hasMusic && (
            <Link href="/music" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Tout voir
            </Link>
          )}
        </div>
        
        {hasMusic ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTracks?.map((track) => (
              <div key={track.id} className="group relative bg-white border border-gray-100 rounded-[24px] overflow-hidden hover:border-purple-200 transition-colors shadow-sm">
                <div className="absolute inset-0 bg-linear-to-br from-purple-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-6 relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-purple-600 transition-transform group-hover:scale-110 shadow-sm border border-gray-100 mb-4">
                    <Music2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <Link href={`/music/${track.id}`} className="hover:underline mt-auto">
                    <h3 className="font-bold text-gray-900 mb-1">{track.title}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs px-2 py-1 rounded-md bg-purple-50 text-purple-600 font-medium">{track.style || 'Musique'}</span>
                    <span className="text-xs text-gray-500">{new Date(track.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative border border-gray-100 bg-white shadow-sm rounded-[32px] py-16 overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center shadow-sm">
                <Music2 className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-gray-900">Le silence est d&apos;or...</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Mais la musique c&apos;est mieux ! Ton studio est vide, commence à créer.
                </p>
              </div>
              <Link href="/create">
                <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800 h-12 px-8 font-bold">
                  Créer ma première musique
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href="/create" className="block">
            <div className="relative bg-white rounded-[24px] border border-gray-100 p-6 group hover:border-purple-200 transition-colors h-full flex items-center shadow-sm">
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-all">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900 transition-colors">Générer IA</div>
                  <div className="text-xs text-gray-500 mt-1">Nouvelle création</div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/explore" className="block">
            <div className="relative bg-white rounded-[24px] border border-gray-100 p-6 group hover:border-blue-200 transition-colors h-full flex items-center shadow-sm">
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-100">
                  <Compass className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900 transition-colors">Explorer</div>
                  <div className="text-xs text-gray-500 mt-1">Écouter la communauté</div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/credits" className="block">
            <div className="relative bg-white rounded-[24px] border border-gray-100 p-6 group hover:border-orange-200 transition-colors h-full flex items-center shadow-sm">
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-orange-100">
                  <CreditCard className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900 transition-colors">Mélodies</div>
                  <div className="text-xs text-gray-500 mt-1">Recharger le solde</div>
                </div>
              </div>
            </div>
          </Link>

        </div>
      </div>
      
    </div>
  );
}

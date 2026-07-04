import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MusicPlayerClient from "@/app/(dashboard)/music/[id]/MusicPlayerClient";

export default async function PublicSharePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: track } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!track) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Public */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tighter">Meliodia</span>
            <span className="text-xl">🎵</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="rounded-full">Se connecter</Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white">
                Créer ma musique
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
             <h1 className="text-4xl md:text-6xl font-black tracking-tight">
               Découvrez cette création sur Meliodia
             </h1>
             <p className="text-xl text-muted-foreground">
               Générée par Intelligence Artificielle à partir d&apos;une simple idée.
             </p>
          </div>
          
          <div className="bg-card/30 p-4 md:p-8 rounded-[40px] border shadow-2xl">
            <MusicPlayerClient track={track} />
          </div>
          
          <div className="text-center pt-8">
            <Link href="/signup">
               <Button size="lg" className="rounded-full h-16 px-10 text-xl font-bold bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white shadow-xl">
                 ✨ Créer ta propre musique gratuitement
               </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

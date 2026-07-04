"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Share2, MoreHorizontal, Trash2, Loader2, Globe } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { togglePublic } from "@/app/actions/gallery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TrackData {
  id: string;
  title: string;
  [key: string]: unknown;
}

export default function TrackCardActions({ track }: { track: TrackData }) {
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPendingPublish, setIsPendingPublish] = useState(false);

  const handleTogglePublic = async () => {
    setIsPendingPublish(true);
    const res = await togglePublic(track.id, !!track.is_public);
    setIsPendingPublish(false);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Es-tu sûr de vouloir supprimer "${track.title}" ?`)) {
      try {
        setIsDeleting(true);
        const { error } = await supabase.from('tracks').delete().eq('id', track.id);
        if (error) throw error;
        router.refresh(); // Refresh the server component to remove the card
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression.");
        setIsDeleting(false);
      }
    }
  };

  const handleDownload = () => {
    // Redirect to the player page to download with ID3 tags
    router.push(`/music/${track.id}`);
  };

  return (
    <div className="flex justify-between items-center pt-4 border-t border-border/50">
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={handleDownload} className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/music/${track.id}`)} className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center justify-center outline-none cursor-pointer">
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-5 h-5" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl">
          <DropdownMenuItem onClick={handleTogglePublic} disabled={isPendingPublish} className="cursor-pointer font-medium mb-1">
            {isPendingPublish ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Globe className={`w-4 h-4 mr-2 ${track.is_public ? 'text-[#FF6B00]' : 'text-gray-400'}`} />}
            {track.is_public ? "Retirer de la Galerie" : "Publier sur l'accueil"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer font-medium">
            <Trash2 className="w-4 h-4 mr-2" /> Supprimer la piste
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

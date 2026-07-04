'use client'

import { Heart } from "lucide-react"
import { useTransition } from "react"
import { toggleFavorite } from "./actions"

export default function FavoriteButton({ trackId, isFavorite }: { trackId: string, isFavorite: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button 
      onClick={() => {
        startTransition(() => {
          toggleFavorite(trackId, isFavorite)
        })
      }}
      disabled={isPending}
      className={`p-2 rounded-full transition-all duration-300 ${isFavorite ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-400 hover:bg-gray-100'}`}
    >
      <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  )
}

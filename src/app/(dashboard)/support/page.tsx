"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Loader2, MessageSquare, Send, ImagePlus, X } from "lucide-react";
import Image from "next/image";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB.");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour envoyer un message.");
        return;
      }

      let image_url = null;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('support_images')
          .upload(filePath, image);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error("Erreur lors de l'envoi de l'image.");
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('support_images')
          .getPublicUrl(filePath);

        image_url = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("support_tickets").insert([
        {
          user_id: user.id,
          subject,
          message,
          image_url,
        }
      ]);

      if (error) throw error;

      toast.success("Votre message a bien été envoyé à notre équipe !");
      setSubject("");
      setMessage("");
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Erreur d'envoi du ticket:", error);
      toast.error("Une erreur est survenue lors de l'envoi de votre message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Support & Signalement</h1>
            <p className="text-gray-500">Un problème ? Une question ? Contactez-nous.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Sujet de votre message</label>
            <Input 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Ma musique ne se lance pas, Problème de crédits..."
              required
              className="bg-gray-50 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Détails</label>
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Expliquez-nous votre problème en détail..."
              required
              className="min-h-37.5 bg-gray-50 rounded-xl resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Capture d&apos;écran (optionnelle)</label>
            <div className="flex items-center gap-4">
              <Input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="support-image-upload"
              />
              <label 
                htmlFor="support-image-upload"
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl cursor-pointer font-medium transition-colors text-sm border border-purple-100"
              >
                <ImagePlus className="w-4 h-4" />
                Ajouter une image
              </label>
              
              {imagePreview && (
                <div className="relative group">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={imagePreview} alt="Aperçu" width={64} height={64} className="object-cover w-full h-full" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !subject.trim() || !message.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 font-bold"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center gap-2">
                Envoyer le message <Send className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

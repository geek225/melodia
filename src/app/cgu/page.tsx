"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      {/* ─── NAVBAR ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" alt="Melodia Logo" width={160} height={52} className="h-14 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors hidden md:block">
            Se connecter
          </Link>
          <Link href="/register" className="flex items-center gap-1.5 h-10 px-5 rounded-full bg-linear-to-r from-[#FF6B00] to-pink-500 text-white text-sm font-bold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-orange-500/20">
            Commencer
          </Link>
        </div>
      </header>

      {/* ─── CONTENT ─── */}
      <main className="pt-24 pb-16 px-6 md:px-12 max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Conditions Générales d&apos;Utilisation (CGU)</h1>
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : 04 Janvier 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptation des conditions</h2>
            <p>
              En accédant et en utilisant la plateforme Melodia, vous acceptez d&apos;être lié par les présentes Conditions Générales d&apos;Utilisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description du service</h2>
            <p>
              Melodia est une plateforme assistée par intelligence artificielle permettant la création de musiques, spécialisée dans les genres urbains, afrobeats et divers autres styles musicaux.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Propriété intellectuelle et Droits</h2>
            <p className="mb-2">
              <strong>Vos Créations :</strong> Sous réserve du respect des présentes conditions, vous conservez la pleine propriété et les droits commerciaux des musiques que vous générez via Melodia. Vous êtes libre de les distribuer, de les vendre et de les diffuser.
            </p>
            <p>
              <strong>Technologie Melodia :</strong> Le logiciel, les algorithmes et l&apos;interface utilisateur restent la propriété exclusive de Melodia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Utilisation acceptable</h2>
            <p className="mb-2">Vous vous engagez à ne pas utiliser le service pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Générer du contenu haineux, diffamatoire ou illégal.</li>
              <li>Tenter de pirater ou de perturber le fonctionnement du site.</li>
              <li>Revendre l&apos;accès à votre compte.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Limitation de responsabilité</h2>
            <p>
              Melodia fournit le service &quot;tel quel&quot;. Nous ne garantissons pas que la génération musicale répondra toujours exactement à vos attentes spécifiques, la créativité de l&apos;IA comportant une part d&apos;aléatoire.
            </p>
          </section>
        </div>

        {/* ─── CTA BOTTOM ─── */}
        <div className="mt-16 pt-12 border-t border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Prêt à créer votre premier hit ?</h2>
          <p className="text-gray-500 mb-8">Lancez-vous dès maintenant avec Melodia.</p>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-[#0B0B0F] text-white font-bold hover:bg-gray-800 transition-colors">
            Commencer maintenant
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}

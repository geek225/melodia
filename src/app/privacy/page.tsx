"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Politique de Confidentialité</h1>
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : 04 Janvier 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Bienvenue sur Melodia. Nous prenons la confidentialité de vos données très au sérieux. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Les données que nous collectons</h2>
            <p className="mb-2">Nous pouvons collecter les types d&apos;informations suivants :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Informations d&apos;identification (nom, email) lors de l&apos;inscription.</li>
              <li>Données de création musicale (fichiers audio, prompts, préférences de style).</li>
              <li>Données d&apos;utilisation (logs, interactions avec l&apos;interface).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Utilisation des données</h2>
            <p className="mb-2">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fournir et améliorer nos services de génération musicale par IA.</li>
              <li>Vous permettre de télécharger et gérer vos créations.</li>
              <li>Communiquer avec vous concernant votre compte ou nos services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Protection de vos créations</h2>
            <p>
              Les musiques que vous générez sur Melodia restent privées par défaut, sauf si vous décidez de les partager dans la section Playlist publique ou sur d&apos;autres plateformes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact</h2>
            <p>
              Pour toute question concernant cette politique, veuillez nous contacter à : contact@melodia-app.com
            </p>
          </section>
        </div>

        {/* ─── CTA BOTTOM ─── */}
        <div className="mt-16 pt-12 border-t border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Prêt à créer votre premier hit ?</h2>
          <p className="text-gray-500 mb-8">Rejoignez des milliers de créateurs sur Melodia.</p>
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

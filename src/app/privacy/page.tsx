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
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : 04 juillet 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p className="mb-2">
              Chez Melodia, nous accordons une grande importance à la confidentialité et à la sécurité des données de nos utilisateurs.
            </p>
            <p>
              La présente Politique de Confidentialité explique quelles informations peuvent être collectées, pourquoi elles sont utilisées et comment elles sont protégées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Données que nous collectons</h2>
            <p className="mb-2">
              Dans le cadre de l&apos;utilisation de Melodia, nous pouvons collecter les informations suivantes :
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-2">
              <li>les informations de compte, comme le nom, l&apos;adresse e-mail et les informations de profil ;</li>
              <li>les données de création musicale, notamment les paroles, descriptions, styles sélectionnés et paramètres de génération ;</li>
              <li>les informations relatives aux crédits, abonnements et transactions ;</li>
              <li>les données techniques et d&apos;utilisation nécessaires au fonctionnement, à la sécurité et à l&apos;amélioration du service.</li>
            </ul>
            <p>
              Melodia ne stocke pas directement les informations bancaires ou les codes secrets des services de paiement lorsque les paiements sont traités par des prestataires de paiement externes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Utilisation des données</h2>
            <p>
              Les données collectées peuvent être utilisées pour fournir les services de génération musicale, gérer les comptes utilisateurs, traiter les achats de crédits ou abonnements, améliorer la plateforme, assurer la sécurité du service, prévenir les abus et communiquer avec les utilisateurs concernant leur compte ou le fonctionnement de Melodia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Données de création musicale</h2>
            <p className="mb-2">
              Les paroles, descriptions et autres informations fournies pour générer une musique sont traitées afin de fournir le service demandé.
            </p>
            <p>
              Certaines données peuvent être transmises aux prestataires technologiques nécessaires à la génération musicale, uniquement dans le cadre du fonctionnement du service et selon les conditions applicables à ces prestataires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Partage des données</h2>
            <p className="mb-2">Melodia ne vend pas les données personnelles de ses utilisateurs.</p>
            <p>
              Certaines informations peuvent être traitées par des prestataires techniques indispensables au fonctionnement du service, notamment pour l&apos;hébergement, l&apos;authentification, la génération musicale, le stockage de fichiers, l&apos;analyse technique ou le traitement des paiements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Sécurité des données</h2>
            <p className="mb-2">
              Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables afin de protéger les données contre l&apos;accès non autorisé, la perte, l&apos;altération ou la divulgation.
            </p>
            <p>
              Aucun système informatique ne pouvant garantir une sécurité absolue, nous améliorons régulièrement nos mécanismes de protection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Conservation des données</h2>
            <p className="mb-2">
              Les données sont conservées pendant la durée nécessaire à la fourniture du service et au respect de nos obligations légales et administratives.
            </p>
            <p>
              L&apos;utilisateur peut demander la suppression de son compte et des données associées, sous réserve des informations devant être conservées pour des raisons légales ou comptables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Vos droits</h2>
            <p className="mb-2">
              Selon la réglementation applicable, l&apos;utilisateur peut demander l&apos;accès, la rectification ou la suppression de ses données personnelles.
            </p>
            <p>
              Il peut également demander des informations sur l&apos;utilisation de ses données en contactant Melodia à l&apos;adresse officielle indiquée sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Cookies et technologies similaires</h2>
            <p className="mb-2">
              Melodia peut utiliser des cookies ou des technologies similaires nécessaires au fonctionnement du site, à la connexion au compte, à la sécurité et à l&apos;analyse de l&apos;utilisation de la plateforme.
            </p>
            <p>
              Lorsque la réglementation applicable l&apos;exige, le consentement de l&apos;utilisateur sera demandé avant l&apos;utilisation de cookies non essentiels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Modification de la politique</h2>
            <p>
              Cette Politique de Confidentialité peut être mise à jour afin de refléter les évolutions de Melodia, de ses fonctionnalités ou des obligations réglementaires applicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact</h2>
            <p>
              Pour toute question concernant la confidentialité ou les données personnelles, vous pouvez contacter Melodia à l&apos;adresse officielle indiquée sur la plateforme.
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

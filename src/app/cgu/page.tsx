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
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : 04 juillet 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptation des conditions</h2>
            <p>
              En accédant à Melodia et en utilisant ses services, vous acceptez les présentes Conditions Générales d&apos;Utilisation. Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description du service</h2>
            <p className="mb-2">
              Melodia est une plateforme de création musicale assistée par intelligence artificielle. Elle permet notamment aux utilisateurs de générer des chansons à partir de paroles, descriptions, styles musicaux et autres paramètres de création.
            </p>
            <p>
              Certaines fonctionnalités peuvent nécessiter l&apos;achat de crédits ou la souscription à une offre payante.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Compte utilisateur</h2>
            <p className="mb-2">
              L&apos;accès à certaines fonctionnalités nécessite la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants de connexion.
            </p>
            <p>
              Toute activité effectuée depuis un compte est considérée comme réalisée par son titulaire, sauf signalement d&apos;un accès non autorisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Crédits et paiements</h2>
            <p className="mb-2">
              Certaines générations musicales nécessitent l&apos;utilisation de crédits Melodia. Le nombre de crédits nécessaires peut varier selon le type de génération ou les fonctionnalités utilisées.
            </p>
            <p className="mb-2">
              Les prix et le nombre de crédits inclus sont affichés avant l&apos;achat. Les crédits sont liés au compte de l&apos;utilisateur et ne peuvent pas être transférés ou revendus.
            </p>
            <p>
              En cas d&apos;échec technique confirmé ayant empêché la génération d&apos;une musique, Melodia peut procéder à la restitution des crédits concernés selon les conditions applicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Créations et droits d&apos;utilisation</h2>
            <p className="mb-2">
              Les droits applicables aux musiques générées dépendent de l&apos;offre utilisée, des conditions affichées sur Melodia et, le cas échéant, des licences et restrictions imposées par les technologies tierces utilisées pour fournir le service.
            </p>
            <p className="mb-2">
              L&apos;utilisateur reste responsable des paroles, textes, fichiers audio, références et autres contenus qu&apos;il fournit à la plateforme. Il garantit disposer des droits nécessaires sur ces contenus.
            </p>
            <p>
              L&apos;utilisateur ne doit pas demander la reproduction non autorisée d&apos;une œuvre protégée ni utiliser Melodia pour porter atteinte aux droits d&apos;un tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Utilisation acceptable</h2>
            <p>
              L&apos;utilisateur s&apos;engage à ne pas utiliser Melodia pour créer ou diffuser des contenus illégaux, haineux, diffamatoires, frauduleux ou portant atteinte aux droits d&apos;autrui. Il est également interdit de tenter de perturber le fonctionnement de la plateforme, de contourner ses systèmes de sécurité ou de revendre l&apos;accès à un compte sans autorisation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Intelligence artificielle et résultats générés</h2>
            <p className="mb-2">
              Les créations produites par intelligence artificielle peuvent varier selon les instructions fournies et comporter une part d&apos;aléatoire.
            </p>
            <p>
              Melodia ne garantit pas qu&apos;une génération correspondra exactement aux attentes de l&apos;utilisateur. Des résultats différents peuvent être produits à partir d&apos;instructions similaires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Disponibilité du service</h2>
            <p>
              Melodia s&apos;efforce d&apos;assurer la disponibilité et le bon fonctionnement de la plateforme. Des interruptions temporaires peuvent néanmoins survenir pour des opérations de maintenance, des mises à jour, des problèmes techniques ou des événements indépendants de notre contrôle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Limitation de responsabilité</h2>
            <p className="mb-2">
              Melodia fournit ses services dans les limites permises par la réglementation applicable. La plateforme ne peut garantir l&apos;absence totale d&apos;interruption, d&apos;erreur ou de résultat musical insatisfaisant.
            </p>
            <p>
              L&apos;utilisateur reste responsable de l&apos;utilisation, de la publication et de la distribution de ses créations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Modification des conditions</h2>
            <p className="mb-2">
              Melodia peut modifier les présentes conditions afin de tenir compte de l&apos;évolution de ses services, de ses technologies ou des obligations réglementaires applicables.
            </p>
            <p>
              Les utilisateurs seront informés des modifications importantes par un moyen approprié.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact</h2>
            <p>
              Pour toute question concernant les présentes Conditions Générales d&apos;Utilisation, vous pouvez nous contacter à l&apos;adresse officielle indiquée sur la plateforme Melodia.
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

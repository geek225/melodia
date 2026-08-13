'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export const VALID_MELODIA_PACKS = [
  { name: "Pack Découverte", melodies: 10, price: 500 },
  { name: "Pack Starter", melodies: 30, price: 1000 },
  { name: "Pack Créateur", melodies: 60, price: 1800 },
  { name: "Pack Studio", melodies: 120, price: 3000 },
  { name: "Pack Producteur", melodies: 250, price: 5500 },
  // Compatibilité rétroactive packs antérieurs
  { name: "Pack Découverte", melodies: 10, price: 1500 },
  { name: "Pack Starter", melodies: 30, price: 3500 },
  { name: "Pack Créateur", melodies: 60, price: 6500 },
  { name: "Pack Studio", melodies: 120, price: 12000 },
  { name: "Pack Producteur", melodies: 250, price: 22000 },
];

export async function buyMelodies(melodies: number, price: number, packName: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return { success: false, error: 'Utilisateur non authentifié' }
    }

    // Validation stricte anti-falsification du prix et du nombre de mélodies
    const matchingPack = VALID_MELODIA_PACKS.find(p => 
      p.name.toLowerCase() === (packName || '').trim().toLowerCase() && 
      p.melodies === Number(melodies) && 
      p.price === Number(price)
    );

    if (!matchingPack) {
      console.warn(`Tentative d'achat avec montant ou pack invalide : user=${user.id}, pack=${packName}, melodies=${melodies}, price=${price}`);
      return { success: false, error: 'Pack ou montant invalide. Veuillez recharger la boutique.' };
    }

    const winipayerApply = process.env.WINIPAYER_MERCHANT_APPLY
    const winipayerToken = process.env.WINIPAYER_MERCHANT_TOKEN
    const winipayerEnv = process.env.WINIPAYER_ENV || 'test'

    if (!winipayerApply || !winipayerToken) {
      console.error('Missing Winipayer credentials')
      return { success: false, error: 'Configuration du serveur de paiement manquante.' }
    }

    // Getting the base URL for callbacks
    const headersList = await headers()
    const origin = process.env.NEXT_PUBLIC_APP_URL || headersList.get('origin') || 'https://melodia-delta.vercel.app'
    
    // Custom data to pass to IPN webhook
    const custom_data = JSON.stringify({
      userId: user.id,
      melodies: matchingPack.melodies,
      packName: matchingPack.name,
      expectedPrice: matchingPack.price
    })

    // Construct FormData for Winipayer
    const formData = new URLSearchParams()
    formData.append('env', winipayerEnv)
    formData.append('amount', matchingPack.price.toString())
    formData.append('description', `Achat de ${matchingPack.name} (${matchingPack.melodies} Mélodies)`)
    formData.append('custom_data', custom_data)
    formData.append('cancel_url', `${origin}/credits?payment=cancelled`)
    formData.append('return_url', `${origin}/credits?payment=success`)
    formData.append('callback_url', `${origin}/api/webhooks/winipayer`)

    const response = await fetch('https://api-v2.winipayer.com/checkout/standard/create', {
      method: 'POST',
      headers: {
        'X-Merchant-Apply': winipayerApply,
        'X-Merchant-Token': winipayerToken,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    })

    const data = await response.json()

    if (data.success === true && data.results?.checkout_process) {
      // Return the redirect URL to the client
      return { success: true, redirect_url: data.results.checkout_process }
    } else {
      console.error('Winipayer Error:', data)
      // Provide fallback message in case of error
      const errorMessage = data.errors?.msg || JSON.stringify(data.errors) || 'Erreur lors de la création du paiement chez Winipayer'
      return { success: false, error: errorMessage }
    }
  } catch (error) {
    console.error('Payment initialization error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function buyMelodies(melodies: number, price: number, packName: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return { success: false, error: 'User not authenticated' }
    }

    const winipayerApply = process.env.WINIPAYER_MERCHANT_APPLY
    const winipayerToken = process.env.WINIPAYER_MERCHANT_TOKEN
    const winipayerEnv = process.env.WINIPAYER_ENV || 'test'

    if (!winipayerApply || !winipayerToken) {
      console.error('Missing Winipayer credentials')
      return { success: false, error: 'Server configuration error' }
    }

    // Getting the base URL for callbacks
    const headersList = await headers()
    const origin = headersList.get('origin') || 'https://melodia-delta.vercel.app' // Fallback to your Vercel domain
    
    // Custom data to pass to IPN webhook
    const custom_data = JSON.stringify({
      userId: user.id,
      melodies,
      packName
    })

    // Construct FormData for Winipayer
    const formData = new URLSearchParams()
    formData.append('env', winipayerEnv)
    formData.append('amount', price.toString())
    formData.append('description', `Achat de ${packName}`)
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

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

    const paytechApiKey = process.env.PAYTECH_API_KEY
    const paytechApiSecret = process.env.PAYTECH_API_SECRET
    const paytechEnv = process.env.PAYTECH_ENV || 'test'

    if (!paytechApiKey || !paytechApiSecret) {
      console.error('Missing PayTech credentials')
      return { success: false, error: 'Server configuration error' }
    }

    // Getting the base URL for callbacks
    const headersList = await headers()
    const origin = headersList.get('origin') || 'https://melodia-delta.vercel.app' // Fallback to your Vercel domain

    const ref_command = `CMD_${Date.now()}_${user.id.substring(0, 5)}`
    
    // Custom data to pass to IPN webhook
    const custom_field = JSON.stringify({
      userId: user.id,
      melodies,
      packName
    })

    const payload = {
      item_name: packName,
      item_price: price,
      command_name: `Achat de ${packName}`,
      ref_command,
      env: paytechEnv,
      currency: 'XOF',
      ipn_url: `${origin}/api/webhooks/paytech`,
      success_url: `${origin}/credits?payment=success`,
      cancel_url: `${origin}/credits?payment=cancelled`,
      custom_field
    }

    const response = await fetch('https://paytech.sn/api/payment/request-payment', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'API_KEY': paytechApiKey,
        'API_SECRET': paytechApiSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.success === 1 || data.success === true) {
      // Return the redirect URL to the client
      return { success: true, redirectUrl: data.redirect_url || data.redirectUrl }
    } else {
      console.error('PayTech Error:', data)
      // Return the exact error to display it in the UI
      const errorMessage = data.message || JSON.stringify(data) || 'Erreur lors de la création du paiement chez PayTech'
      return { success: false, error: errorMessage }
    }

  } catch (err) {
    console.error('Unexpected error in buyMelodies:', err)
    return { success: false, error: 'Unexpected server error' }
  }
}

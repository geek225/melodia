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
    const headersList = headers()
    const origin = headersList.get('origin') || 'https://melodia-delta.vercel.app' // Fallback to your Vercel domain

    const ref_command = `CMD_${Date.now()}_${user.id.substring(0, 5)}`
    
    // Custom data to pass to IPN webhook
    const custom_field = JSON.stringify({
      userId: user.id,
      melodies,
      packName
    })

    const payload = new URLSearchParams()
    payload.append('item_name', packName)
    payload.append('item_price', price.toString())
    payload.append('command_name', `Achat de ${packName}`)
    payload.append('ref_command', ref_command)
    payload.append('env', paytechEnv)
    payload.append('currency', 'XOF')
    payload.append('ipn_url', `${origin}/api/webhooks/paytech`)
    payload.append('success_url', `${origin}/credits?payment=success`)
    payload.append('cancel_url', `${origin}/credits?payment=cancelled`)
    payload.append('custom_field', custom_field)

    const response = await fetch('https://paytech.sn/api/payment/request-payment', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'API_KEY': paytechApiKey,
        'API_SECRET': paytechApiSecret,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString()
    })

    const data = await response.json()

    if (data.success === 1) {
      // Return the redirect URL to the client
      return { success: true, redirectUrl: data.redirect_url }
    } else {
      console.error('PayTech Error:', data)
      return { success: false, error: 'Erreur lors de la création du paiement chez PayTech' }
    }

  } catch (err) {
    console.error('Unexpected error in buyMelodies:', err)
    return { success: false, error: 'Unexpected server error' }
  }
}

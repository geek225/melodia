import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client to bypass RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  return processIPN(request);
}

export async function POST(request: Request) {
  return processIPN(request);
}

async function processIPN(request: Request) {
  try {
    const url = new URL(request.url);
    const cryptoParam = url.searchParams.get('crypto');
    
    // In some cases, if it was a POST, we might need to parse body. 
    // But since they use GET with crypto param, let's focus on that.
    let cryptoValue = cryptoParam;

    if (!cryptoValue && request.method === 'POST') {
      try {
        const rawBody = await request.text();
        const body = JSON.parse(rawBody);
        if (body?.results?.invoice?.crypto) {
          cryptoValue = body.results.invoice.crypto;
        }
      } catch (e) {
        console.error('Failed to parse POST body for crypto:', e);
      }
    }

    if (!cryptoValue) {
      return NextResponse.json({ success: false, message: 'Missing crypto parameter' }, { status: 400 });
    }

    // Call WiniPayer to get the actual invoice details using the crypto string
    const winipayerEnv = process.env.WINIPAYER_ENV || 'test';
    const merchantApply = process.env.WINIPAYER_MERCHANT_APPLY;
    const merchantToken = process.env.WINIPAYER_MERCHANT_TOKEN;

    if (!merchantApply || !merchantToken) {
      console.error('WiniPayer merchant keys missing in server env');
      return NextResponse.json({ success: false, message: 'Server config error' }, { status: 500 });
    }

    const detailResponse = await fetch(`https://api-v2.winipayer.com/checkout/standard/detail/${cryptoValue}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Merchant-Apply': merchantApply,
        'X-Merchant-Token': merchantToken
      },
      body: JSON.stringify({ env: winipayerEnv })
    });

    const detailData = await detailResponse.json();

    if (!detailData.success || !detailData.results || !detailData.results.invoice) {
      console.error('Failed to verify WiniPayer invoice:', detailData);
      return NextResponse.json({ success: false, message: 'Invalid verification' }, { status: 400 });
    }

    const invoice = detailData.results.invoice;
    const state = invoice.state ? invoice.state.toLowerCase() : '';
    
    let customData = invoice.custom_data;
    if (typeof customData === 'string') {
      try {
        customData = JSON.parse(customData);
      } catch (error) {
        console.error('Could not parse custom_data string:', customData, error);
      }
    }

    if (!customData || !customData.userId || !customData.melodies) {
      console.error('Missing userId or melodies in custom_data:', customData);
      return NextResponse.json({ success: false, message: 'Invalid custom_data' }, { status: 400 });
    }

    const userId = customData.userId;
    const melodiesToAdd = parseInt(customData.melodies, 10);

    if (state === 'success' || state === 'test') {
      // 1. Log transaction to prevent double counting
      const { data: existingTx } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('reference', invoice.uuid)
        .single();

      if (existingTx) {
        return NextResponse.json({ success: true, message: 'Transaction already processed' });
      }

      // 2. Insert transaction
      await supabaseAdmin
        .from('transactions')
        .insert([{
          user_id: userId,
          amount: invoice.amount,
          provider: 'winipayer',
          status: 'completed',
          reference: invoice.uuid
        }]);

      // 3. Update user profile credits
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
      }

      const newCredits = (profile?.credits || 0) + melodiesToAdd;

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user credits:', updateError);
        return NextResponse.json({ success: false, message: 'Failed to update credits' }, { status: 500 });
      }

      console.log(`Successfully processed WiniPayer IPN for user ${userId}. Added ${melodiesToAdd} credits.`);
      return NextResponse.json({ success: true, message: 'Credits updated successfully' });
      
    } else {
      console.log(`WiniPayer IPN received with non-success state: ${state}`);
      
      // Log the failed/expired transaction
      await supabaseAdmin
        .from('transactions')
        .insert([{
          user_id: userId,
          amount: invoice.amount,
          provider: 'winipayer',
          status: state === 'expired' ? 'failed' : 'failed', // Default to failed if unknown
          reference: invoice.uuid
        }]);

      return NextResponse.json({ success: true, message: `Logged state: ${state}` });
    }

  } catch (error) {
    console.error('WiniPayer Webhook Processing Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

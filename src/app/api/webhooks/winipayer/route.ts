import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Initialize Supabase Admin Client to bypass RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      console.error('Failed to parse WiniPayer IPN JSON:', rawBody, error);
      return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
    }

    if (!body || !body.success || !body.results || !body.results.invoice) {
      return NextResponse.json({ success: false, message: 'Invalid payload structure' }, { status: 400 });
    }

    const invoice = body.results.invoice;
    const receivedHash = invoice.hash;
    
    // Hash verification
    const winipayerPrivateKey = process.env.WINIPAYER_PRIVATE_KEY;
    if (!winipayerPrivateKey) {
      console.error('WINIPAYER_PRIVATE_KEY is not configured on the server');
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    const dataToHash = `${winipayerPrivateKey}${invoice.uuid}${invoice.crypto}${invoice.amount}${invoice.created_at}`;
    const generatedHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    if (receivedHash !== generatedHash) {
      console.error('WiniPayer IPN Hash Mismatch! Potential fraud attempt.');
      return NextResponse.json({ success: false, message: 'Invalid hash' }, { status: 403 });
    }

    // Valid transaction. Check state.
    const state = invoice.state ? invoice.state.toLowerCase() : '';
    if (state === 'success' || state === 'test') {
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
      const packName = customData.packName || 'Pack Inconnu';

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
          status: 'success',
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
      
      let customData = invoice.custom_data;
      if (typeof customData === 'string') {
        try {
          customData = JSON.parse(customData);
        } catch (e) {
          console.error('Could not parse custom_data string:', customData, e);
        }
      }

      if (customData && customData.userId) {
        // Log the failed/expired transaction so the admin can see it in the dashboard
        const packName = customData.packName || 'Pack Inconnu';
        await supabaseAdmin
          .from('transactions')
          .insert([{
            user_id: customData.userId,
            amount: invoice.amount,
            provider: 'winipayer',
            status: state, // 'failed', 'expired', etc.
            reference: invoice.uuid
          }]);
      }

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

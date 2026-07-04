import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client to bypass RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    let body: any = {};
    const contentType = req.headers.get('content-type') || '';
    
    // PayTech IPN usually sends JSON, but might send form-urlencoded
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        params.forEach((value, key) => {
          body[key] = value;
        });
      }
    }

    const {
      type_event,
      custom_field,
      ref_command,
      item_price
    } = body;

    // Verify security: You should theoretically verify hashes if provided, 
    // but PayTech mostly relies on the fact that only they know your IPN URL or custom fields.
    // For MVP, we check if the event is a successful payment
    if (type_event !== 'sale_complete') {
      return NextResponse.json({ status: 'ignored', reason: 'Not a completed sale' }, { status: 200 });
    }

    if (!custom_field) {
      return NextResponse.json({ error: 'Missing custom_field' }, { status: 400 });
    }

    // Decode custom_field (we will pass user_id and pack details as JSON string)
    let metadata;
    try {
      metadata = JSON.parse(custom_field);
    } catch {
      return NextResponse.json({ error: 'Invalid custom_field JSON' }, { status: 400 });
    }

    const { userId, melodies, packName } = metadata;

    if (!userId || !melodies) {
      return NextResponse.json({ error: 'Invalid metadata payload' }, { status: 400 });
    }

    // 1. Check if transaction already processed (idempotency using ref_command)
    const { data: existingTx } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('reference', ref_command)
      .single();

    if (existingTx) {
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    // 2. Fetch current user credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Add new credits
    const newCredits = (profile.credits || 0) + parseInt(melodies, 10);
    
    // 4. Update profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update credits:', updateError);
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    // 5. Log the transaction
    await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userId,
        amount: parseInt(item_price, 10),
        currency: 'XOF',
        type: 'purchase',
        status: 'completed',
        reference: ref_command,
        description: `Achat ${packName} (${melodies} Mélodies) via PayTech`
      });

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('PayTech Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

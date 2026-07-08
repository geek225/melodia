import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminAuthClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify admin role
    const { data: profile } = await adminAuthClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Fetch Suno API Limit
    const apiKey = process.env.SUNO_API_KEY || "d2bc9f7d7213c3adff53851705b3e6ac";
    let sunoLimitData = null;
    try {
      const res = await fetch("https://api.sunoapi.org/api/v1/get_limit", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        cache: 'no-store'
      });
      if (res.ok) {
        sunoLimitData = await res.json();
      }
    } catch (e) {
      console.error("Error fetching Suno limit:", e);
    }

    // 2. Fetch last 24h stats from Tracks
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString();

    const { data: recentTracks, error: tracksError } = await adminAuthClient
      .from('tracks')
      .select('id, title, style, prompt, status, audio_url, created_at, user_id')
      .gte('created_at', yesterdayIso)
      .order('created_at', { ascending: false });

    if (tracksError) {
      console.error("Error fetching tracks:", tracksError);
    }

    const total24h = recentTracks?.length || 0;
    // We consider it successful if it's explicitly completed OR if it's processing but has a real audio_url
    const successful24h = recentTracks?.filter(t => t.status === 'completed' || (t.status === 'processing' && t.audio_url && !t.audio_url.startsWith('task:'))).length || 0;
    const failed24h = recentTracks?.filter(t => t.status === 'failed').length || 0;
    const pending24h = total24h - successful24h - failed24h;

    // We'll also return the last 20 tracks for the logs table
    const logs = recentTracks?.slice(0, 20) || [];

    return NextResponse.json({
      sunoData: sunoLimitData,
      stats: {
        total24h,
        successful24h,
        failed24h,
        pending24h
      },
      logs
    });
  } catch (error) {
    console.error("Suno API Admin Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

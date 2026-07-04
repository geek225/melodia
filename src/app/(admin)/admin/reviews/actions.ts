"use server";

import { createClient } from "@supabase/supabase-js";

const adminAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAdminReviews() {
  try {
    const { data, error } = await adminAuthClient
      .from('reviews')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error fetching admin reviews:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

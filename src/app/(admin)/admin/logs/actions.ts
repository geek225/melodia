"use server";

import { createClient } from "@supabase/supabase-js";

const adminAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAdminLogs() {
  try {
    const { data, error } = await adminAuthClient
      .from('api_logs')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        return { success: true, data: [] }; // Table doesn't exist
      }
      throw error;
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error fetching admin logs:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

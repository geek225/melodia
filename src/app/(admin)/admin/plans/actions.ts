"use server";

import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth-admin";

const adminAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getAdminPlans() {
  try {
    await requireAdmin();
    const { data, error } = await adminAuthClient
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error fetching admin plans:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

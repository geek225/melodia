"use server";

import { createClient } from "@supabase/supabase-js";

const adminAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export async function getAdminStats() {
  try {
    // 1. Fetch Users
    const { data: users, error: usersError } = await adminAuthClient
      .from('profiles')
      .select('created_at');

    if (usersError) throw usersError;

    // 2. Fetch Payments (if table exists)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payments: any[] = [];
    const { data: payData, error: payError } = await adminAuthClient
      .from('payments')
      .select('created_at, amount');

    if (payError) {
      if (payError.code !== 'PGRST205') {
        throw payError;
      }
      // table doesn't exist, ignore
    } else if (payData) {
      payments = payData;
    }

    // Process data to group by month for the current year (or last 6 months)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    const userStats = Array(6).fill(0).map((_, i) => {
      let m = currentMonth - 5 + i;
      let y = currentYear;
      if (m < 0) {
        m += 12;
        y -= 1;
      }
      return { name: monthNames[m], month: m, year: y, utilisateurs: 0, revenus: 0 };
    });

    if (users) {
      users.forEach(u => {
        const date = new Date(u.created_at);
        const stat = userStats.find(s => s.month === date.getMonth() && s.year === date.getFullYear());
        if (stat) stat.utilisateurs += 1;
      });
    }

    if (payments) {
      payments.forEach(p => {
        const date = new Date(p.created_at);
        const stat = userStats.find(s => s.month === date.getMonth() && s.year === date.getFullYear());
        if (stat) stat.revenus += Number(p.amount || 0);
      });
    }

    return { 
      success: true, 
      data: {
        usersOverTime: userStats.map(s => ({ name: s.name, utilisateurs: s.utilisateurs })),
        revenueOverTime: userStats.map(s => ({ name: s.name, revenus: s.revenus }))
      } 
    };
  } catch (error: unknown) {
    console.error("Error fetching admin stats:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

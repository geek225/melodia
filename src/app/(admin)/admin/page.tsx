import { Card, CardContent } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, Music2, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import AdminStatsClient from './stats/AdminStatsClient';

export const revalidate = 0; // Disable caching to always get fresh data

export default async function AdminOverviewPage() {
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { count: userCount } = await adminClient.from('profiles').select('*', { count: 'exact', head: true });
  const { count: trackCount } = await adminClient.from('tracks').select('*', { count: 'exact', head: true });
  const { count: errCount } = await adminClient.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'failed');
  
  // Calculate revenues
  const { data: txs } = await adminClient.from('transactions').select('amount, created_at, status').eq('status', 'completed');
  let caJour = 0;
  let caMois = 0;
  
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  txs?.forEach((tx: { amount: number; created_at: string; status: string }) => {
    if (tx.created_at >= startOfDay) caJour += tx.amount;
    if (tx.created_at >= startOfMonth) caMois += tx.amount;
  });

  const activeSubs = 0; // We don't have subscriptions, just one-off packs
  const creditsConsumed = (trackCount || 0) * 10;
  
  const kpis = [
    { title: "Utilisateurs inscrits", value: userCount?.toString() || "0", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Abonnements actifs", value: activeSubs?.toString() || "0", icon: CreditCard, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "CA du jour", value: `${caJour} FCFA`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "CA du mois", value: `${caMois} FCFA`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Musiques générées", value: trackCount?.toString() || "0", icon: Music2, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Crédits consommés", value: creditsConsumed.toString(), icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Générations en erreur", value: errCount?.toString() || "0", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vue Globale</h1>
        <p className="text-muted-foreground mt-1">Comment se porte l&apos;entreprise aujourd&apos;hui ?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-border/50 shadow-sm rounded-[24px]">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                <p className="text-3xl font-black">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminStatsClient />
    </div>
  );
}

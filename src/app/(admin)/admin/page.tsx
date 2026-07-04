import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, Music2, Zap, AlertTriangle, TrendingUp } from "lucide-react";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export default async function AdminOverviewPage() {
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { count: userCount } = await adminClient.from('profiles').select('*', { count: 'exact', head: true });
  const { count: trackCount } = await adminClient.from('tracks').select('*', { count: 'exact', head: true });
  const activeSubs = 0;
  
  const kpis = [
    { title: "Utilisateurs inscrits", value: userCount?.toString() || "0", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Abonnements actifs", value: activeSubs?.toString() || "0", icon: CreditCard, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "CA du jour", value: "0", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "CA du mois", value: "0", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Musiques générées", value: trackCount?.toString() || "0", icon: Music2, color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Crédits consommés", value: "0", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Générations en erreur", value: "0", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm rounded-[24px]">
          <CardHeader>
            <CardTitle>Graphique des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border">
              <p className="text-muted-foreground">Graphique des revenus (Placeholder Recharts)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm rounded-[24px]">
          <CardHeader>
            <CardTitle>Graphique des inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border">
              <p className="text-muted-foreground">Graphique des inscriptions (Placeholder Recharts)</p>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

import AdminStatsClient from "./AdminStatsClient";

export default function AdminStatsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <p className="text-muted-foreground mt-1">Analyse détaillée de l&apos;évolution de la plateforme.</p>
      </div>

      <AdminStatsClient />
    </div>
  );
}
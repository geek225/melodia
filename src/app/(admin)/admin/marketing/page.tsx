import AdminMarketingClient from "./AdminMarketingClient";

export default function AdminMarketingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
        <p className="text-muted-foreground mt-1">Gérez vos campagnes d&apos;emailing et promotions.</p>
      </div>

      <AdminMarketingClient />
    </div>
  );
}
import AdminPaymentsClient from "./AdminPaymentsClient";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
        <p className="text-muted-foreground mt-1">Historique des transactions et abonnements.</p>
      </div>

      <AdminPaymentsClient />
    </div>
  );
}
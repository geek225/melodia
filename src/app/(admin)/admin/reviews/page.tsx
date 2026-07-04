import AdminReviewsClient from "./AdminReviewsClient";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Avis Clients</h1>
        <p className="text-muted-foreground mt-1">Gérez et modérez les retours de vos utilisateurs.</p>
      </div>

      <AdminReviewsClient />
    </div>
  );
}
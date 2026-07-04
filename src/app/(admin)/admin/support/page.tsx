import AdminSupportClient from "./AdminSupportClient";

export default function AdminSupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground mt-1">Gérez les demandes d&apos;assistance et répondez aux utilisateurs.</p>
      </div>

      <AdminSupportClient />
    </div>
  );
}
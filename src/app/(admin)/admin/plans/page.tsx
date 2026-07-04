import AdminPlansClient from "./AdminPlansClient";

export default function AdminPlansPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plans & Mélodies</h1>
        <p className="text-muted-foreground mt-1">Gérez les forfaits et les packs de crédits disponibles.</p>
      </div>

      <AdminPlansClient />
    </div>
  );
}

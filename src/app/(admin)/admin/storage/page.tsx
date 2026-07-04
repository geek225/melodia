import AdminStorageClient from "./AdminStorageClient";

export default function AdminStoragePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stockage</h1>
        <p className="text-muted-foreground mt-1">Supervisez l&apos;espace disque utilisé par les fichiers générés.</p>
      </div>

      <AdminStorageClient />
    </div>
  );
}
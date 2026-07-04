import AdminMusicClient from "./AdminMusicClient";

export default function AdminMusicPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Musiques</h1>
        <p className="text-muted-foreground mt-1">Consultez les musiques générées par les utilisateurs.</p>
      </div>

      <AdminMusicClient />
    </div>
  );
}
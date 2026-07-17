import AdminArchivesClient from "./client";

export default function AdminArchivesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Archives</h1>
        <p className="text-muted-foreground mt-1">Consultez, gérez et re-téléchargez les musiques archivées sur Supabase.</p>
      </div>

      <AdminArchivesClient />
    </div>
  );
}

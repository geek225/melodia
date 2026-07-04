import AdminLogsClient from "./AdminLogsClient";

export default function AdminLogsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Journaux (Logs)</h1>
        <p className="text-muted-foreground mt-1">Supervisez l&apos;activité de l&apos;API et détectez les erreurs.</p>
      </div>

      <AdminLogsClient />
    </div>
  );
}
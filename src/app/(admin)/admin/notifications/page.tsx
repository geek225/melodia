import AdminNotificationsClient from "./AdminNotificationsClient";

export default function AdminNotificationsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Notifications In-App</h1>
      </div>
      
      <AdminNotificationsClient />
    </div>
  );
}

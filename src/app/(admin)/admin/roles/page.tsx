import { AdminRolesClient } from './AdminRolesClient'

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Rôles et Équipe</h1>
        <p className="text-muted-foreground">Gérez les administrateurs et éditeurs de la plateforme.</p>
      </div>
      
      <AdminRolesClient />
    </div>
  );
}
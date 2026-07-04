import { AdminUsersClient } from './AdminUsersClient'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-muted-foreground">Gérez les utilisateurs et attribuez des Mélodies (crédits).</p>
      </div>
      
      <AdminUsersClient />
    </div>
  );
}
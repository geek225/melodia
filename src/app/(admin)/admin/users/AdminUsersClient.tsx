'use client'

import { useState, useEffect } from 'react'
import { getUsers, assignCredits, deleteUsers } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Search, Coins, Trash2, AlertTriangle } from 'lucide-react'

export function AdminUsersClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false)
  const [creditAmount, setCreditAmount] = useState(10)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const res = await getUsers()
    if (res.success && res.data) {
      setUsers(res.data)
    }
    setLoading(false)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(u => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, id])
    } else {
      setSelectedUsers(prev => prev.filter(userId => userId !== id))
    }
  }

  const handleAssignCredits = async () => {
    if (selectedUsers.length === 0 || creditAmount <= 0) return

    setIsAssigning(true)
    const res = await assignCredits(selectedUsers, creditAmount)
    setIsAssigning(false)
    
    if (res.success) {
      setIsCreditModalOpen(false)
      setSelectedUsers([])
      fetchUsers() // Refresh list
    } else {
      alert("Erreur: " + res.error)
    }
  }

  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) return

    setIsDeleting(true)
    const res = await deleteUsers(selectedUsers)
    setIsDeleting(false)
    
    if (res.success) {
      setIsDeleteModalOpen(false)
      setSelectedUsers([])
      fetchUsers() // Refresh list
    } else {
      alert("Erreur lors de la suppression: " + res.error)
    }
  }

  const filteredUsers = users.filter(u => 
    (u.email?.toLowerCase().includes(search.toLowerCase())) ||
    (u.full_name?.toLowerCase().includes(search.toLowerCase()))
  )

  const allSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par email ou nom..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {selectedUsers.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer ({selectedUsers.length})
            </Button>
          )}
          
          <Button 
            disabled={selectedUsers.length === 0} 
            onClick={() => setIsCreditModalOpen(true)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Coins className="w-4 h-4 mr-2" />
            Attribuer des crédits ({selectedUsers.length})
          </Button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-12.5 text-center">
                <Checkbox 
                  checked={allSelected} 
                  onCheckedChange={handleSelectAll} 
                />
              </TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Mélodies (Crédits)</TableHead>
              <TableHead className="text-right">Rôle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id} className="hover:bg-gray-50/50">
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(c: boolean) => handleSelectUser(user.id, c)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.full_name || 'Anonyme'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email || '—'}
                  </TableCell>
                  <TableCell className="text-right font-bold text-purple-600">
                    {user.credits || 0}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 font-medium">
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreditModalOpen} onOpenChange={setIsCreditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attribuer des Mélodies</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d&apos;attribuer des crédits à {selectedUsers.length} utilisateur(s).
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <label className="text-sm font-medium">Nombre de Mélodies (crédits) à ajouter</label>
            <div className="flex items-center gap-4">
              <Input 
                type="number" 
                min={1} 
                value={creditAmount} 
                onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)} 
                className="text-lg font-bold"
              />
              <span className="text-purple-600 font-bold">Mélodies</span>
            </div>
            <p className="text-xs text-muted-foreground">Note: 10 mélodies = 1 chanson générée.</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreditModalOpen(false)}>Annuler</Button>
            <Button 
              onClick={handleAssignCredits} 
              disabled={isAssigning || creditAmount <= 0}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isAssigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Coins className="w-4 h-4 mr-2" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Suppression définitive
            </DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de supprimer DÉFINITIVEMENT {selectedUsers.length} utilisateur(s).
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm font-medium text-gray-700">
              Cette action est irréversible. Les comptes, leurs données et leurs abonnements associés seront effacés de la base de données.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
            <Button 
              onClick={handleDeleteUsers} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

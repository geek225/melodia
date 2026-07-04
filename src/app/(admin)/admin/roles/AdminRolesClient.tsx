'use client'

import { useState, useEffect } from 'react'
import { getStaffUsers, searchAllUsers, updateUserRole, inviteUserAndSetRole } from './actions'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Search, ShieldAlert, ShieldCheck, Plus, X, Mail } from 'lucide-react'

export function AdminRolesClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  // Add role modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [newUserPassword, setNewUserPassword] = useState('')
  const [modalMode, setModalMode] = useState<'create' | 'search'>('create')

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    setLoading(true)
    const res = await getStaffUsers()
    if (res.success && res.data) {
      setStaff(res.data)
    }
    setLoading(false)
  }

  const handleSearchUsers = async (q: string) => {
    setUserSearchQuery(q)
    if (q.length < 3) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    const res = await searchAllUsers(q)
    if (res.success && res.data) {
      setSearchResults(res.data)
    }
    setIsSearching(false)
  }

  const handleAssignRole = async (userId: string, role: string | null) => {
    setIsUpdating(true)
    const res = await updateUserRole(userId, role)
    if (res.success) {
      setIsAddModalOpen(false)
      setUserSearchQuery('')
      setSearchResults([])
      fetchStaff()
    } else {
      alert("Erreur: " + res.error)
    }
    setIsUpdating(false)
  }

  const handleInviteNewUser = async (role: string) => {
    const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userSearchQuery);
    if (!isValidEmail) {
      alert("Veuillez entrer une adresse email valide avant de créer le compte.");
      return;
    }
    if (!newUserPassword || newUserPassword.length < 6) {
      alert("Veuillez entrer un mot de passe valide (minimum 6 caractères).");
      return;
    }

    setIsUpdating(true)
    const res = await inviteUserAndSetRole(userSearchQuery, role, newUserPassword)
    if (res.success) {
      alert("L'utilisateur a été créé et ajouté à l'équipe avec succès !");
      setIsAddModalOpen(false)
      setUserSearchQuery('')
      setNewUserPassword('')
      setSearchResults([])
      fetchStaff()
    } else {
      alert("Erreur lors de la création: " + res.error)
    }
    setIsUpdating(false)
  }

  const filteredStaff = staff.filter(u => 
    (u.email?.toLowerCase().includes(search.toLowerCase())) ||
    (u.full_name?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher dans l'équipe..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto bg-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un Admin / Éditeur
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Aucun membre de l&apos;équipe trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map(user => (
                <TableRow key={user.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                      {user.role === 'admin' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                    {user.full_name || 'Anonyme'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email || '—'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md font-medium text-xs ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? 'Administrateur' : 'Éditeur'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAssignRole(user.id, 'user')}
                      disabled={isUpdating}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Révoquer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un membre à l&apos;équipe</DialogTitle>
            <DialogDescription>
              Vous pouvez créer un nouveau compte administrateur/éditeur ou rechercher un compte existant.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-4 border-b pb-2">
            <button 
              className={`text-sm font-medium pb-2 -mb-2.5 border-b-2 ${modalMode === 'create' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
              onClick={() => { setModalMode('create'); setUserSearchQuery(''); setSearchResults([]); setNewUserPassword(''); }}
            >
              Créer un compte
            </button>
            <button 
              className={`text-sm font-medium pb-2 -mb-2.5 border-b-2 ${modalMode === 'search' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
              onClick={() => { setModalMode('search'); setUserSearchQuery(''); setSearchResults([]); setNewUserPassword(''); }}
            >
              Rechercher un existant
            </button>
          </div>

          <div className="py-4">
            {modalMode === 'create' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Adresse Email</label>
                  <Input 
                    type="email"
                    placeholder="Ex: kevin@melodia.ai" 
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">Mot de passe (requis, min. 6 caractères)</label>
                  <Input 
                    type="password" 
                    placeholder="Définir un mot de passe" 
                    value={newUserPassword} 
                    onChange={(e) => setNewUserPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleInviteNewUser('admin')} disabled={isUpdating}>
                    Créer en Admin
                  </Button>
                  {/* Note: le rôle 'editor' n'existe pas dans la base, on le masque pour éviter l'erreur. Si on veut le garder, on l'utilise pour 'super_admin' par ex */}
                  {/* <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleInviteNewUser('editor')} disabled={isUpdating}>
                    Créer en Éditeur
                  </Button> */}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher par email..." 
                    value={userSearchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="border rounded-lg max-h-72 overflow-y-auto bg-gray-50/50">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
                    </div>
                  ) : searchResults.length === 0 && userSearchQuery.length >= 3 ? (
                    <div className="p-6 text-center space-y-3">
                      <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto shadow-sm border">
                        <Mail className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Aucun utilisateur trouvé.</p>
                        <p className="text-xs text-muted-foreground mt-1">Passez en mode &quot;Créer un compte&quot; pour l&apos;ajouter.</p>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="flex flex-col divide-y">
                      {searchResults.map(user => (
                        <div key={user.id} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                          <div className="text-sm">
                            <p className="font-medium">{user.full_name || 'Anonyme'}</p>
                            <p className="text-muted-foreground">{user.email}</p>
                            {user.role && user.role !== 'user' && (
                              <span className="text-xs text-primary font-medium">
                                Rôle actuel: {user.role}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {user.role !== 'admin' && (
                              <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleAssignRole(user.id, 'admin')} disabled={isUpdating}>
                                <ShieldAlert className="w-3 h-3 mr-1" /> Nommer Admin
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Tapez au moins 3 caractères pour rechercher.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

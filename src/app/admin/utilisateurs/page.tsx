'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Search, Shield, User, Users, Lock } from 'lucide-react'
import Modal from '@/components/admin/crud/Modal'
import DeleteConfirmation from '@/components/admin/crud/DeleteConfirmation'
import toast from 'react-hot-toast'

export default function UtilisateursPage() {
  const [selectedRole, setSelectedRole] = useState('all')
  const [search, setSearch] = useState('')
  const [usersState, setUsersState] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'Staff', password: '' })

  const fetchUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const res = await fetch('/api/admin/users')
      const json = await res.json()
      if (res.ok) {
        setUsersState(json.users || [])
      } else {
        toast.error(json.error || 'Erreur lors de la récupération des utilisateurs')
      }
    } catch (err) {
      toast.error('Impossible de contacter le serveur')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAdd = () => {
    setSelectedUser(null)
    setUserForm({ name: '', email: '', role: 'Staff', password: '' })
    setIsAddModalOpen(true)
  }

  useEffect(() => {
    try {
      localStorage.setItem('admin_users', JSON.stringify(usersState))
    } catch (e) {
      // ignore localStorage errors
    }
  }, [usersState])

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setUserForm({ name: user.name || '', email: user.email || '', role: user.role || 'Staff', password: '' })
    setIsEditModalOpen(true)
  }

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault()

    const name = userForm.name.trim()
    const email = userForm.email.trim()
    const password = userForm.password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!name) {
      toast.error('Le nom est requis')
      return
    }

    if (!emailRegex.test(email)) {
      toast.error("Format d'email invalide")
      return
    }

    try {
      if (selectedUser) {
        // Update existing user (password optional)
        const body: any = { name: userForm.name, email: userForm.email, role: userForm.role }
        if (password) body.password = password
        const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Erreur mise à jour')
        toast.success('Utilisateur mis à jour')
        setIsEditModalOpen(false)
      } else {
        // Create new user (password required)
        if (!password) {
          toast.error('Un mot de passe est requis pour créer un utilisateur')
          return
        }
        const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, role: userForm.role, password }) })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Erreur création')
        toast.success('Utilisateur créé')
        setIsAddModalOpen(false)
      }

      // refresh list
      fetchUsers()
      setUserForm({ name: '', email: '', role: 'Staff', password: '' })
      setSelectedUser(null)
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  const filteredUsers = usersState.filter((user) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      !search || user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower)

    const matchesRole =
      selectedRole === 'all' ||
      (selectedRole === 'super-admin' && user.role === 'Super Admin') ||
      (selectedRole === 'manager' && user.role === 'Manager') ||
      (selectedRole === 'staff' && user.role === 'Staff')

    return matchesSearch && matchesRole
  })

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)

  const confirmDelete = async () => {
    if (!userToDelete) return
    try {
      const res = await fetch(`/api/admin/users/${userToDelete}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erreur suppression')
      toast.success('Utilisateur supprimé')
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || 'Erreur suppression')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-rose-50 text-rose-700 ring-rose-200/70'
      case 'Manager': return 'bg-amber-50 text-amber-700 ring-amber-200/70'
      case 'Staff': return 'bg-emerald-50 text-emerald-700 ring-emerald-200/70'
      default: return 'bg-gray-100 text-gray-700 ring-gray-200/70'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin': return <Shield size={16} />
      case 'Manager': return <User size={16} />
      case 'Staff': return <Users size={16} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-amber-200/60 bg-gradient-to-r from-white via-amber-50 to-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Utilisateurs</p>
            <h1 className="text-3xl font-semibold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-sm text-gray-600">Gérez les accès au panel admin.</p>
          </div>
          <button
            onClick={handleAdd}
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800"
          >
            <UserPlus size={16} />
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total utilisateurs</p>
              <p className="text-2xl font-bold mt-2">{usersState.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Super Admins</p>
              <p className="text-2xl font-bold mt-2">{usersState.filter(u => u.role === 'Super Admin').length}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <Shield className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Managers</p>
              <p className="text-2xl font-bold mt-2">{usersState.filter(u => u.role === 'Manager').length}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <User className="text-amber-700" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Staff</p>
              <p className="text-2xl font-bold mt-2">{usersState.filter(u => u.role === 'Staff').length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <div className="text-purple-600">👥</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-amber-200/70 bg-white/90 py-2 pl-11 pr-4 text-sm text-gray-800 placeholder:text-amber-300 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRole('all')}
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedRole === 'all'
                ? 'bg-gray-900 text-white shadow'
                : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedRole('super-admin')}
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedRole === 'super-admin'
                ? 'bg-gray-900 text-white shadow'
                : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'
            }`}
          >
            Super Admins
          </button>
          <button
            onClick={() => setSelectedRole('manager')}
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedRole === 'manager'
                ? 'bg-gray-900 text-white shadow'
                : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'
            }`}
          >
            Managers
          </button>
          <button
            onClick={() => setSelectedRole('staff')}
            type="button"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedRole === 'staff'
                ? 'bg-gray-900 text-white shadow'
                : 'border border-amber-200/70 bg-white text-gray-700 hover:bg-amber-50'
            }`}
          >
            Staff
          </button>
        </div>
      </div>

      {/* Users table */}
      {isLoadingUsers ? (
        <div className="rounded-3xl border border-amber-100 bg-white/90 p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-amber-500" />
          <p className="text-sm text-gray-600">Chargement des utilisateurs...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-3xl border border-amber-100 bg-white/90 p-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Aucun utilisateur trouvé</p>
          <p className="mt-1 text-sm text-gray-600">Essayez de modifier la recherche ou le filtre.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-amber-100 bg-white/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-100">
              <thead className="bg-amber-50/70">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Nom</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Email</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Rôle</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Dernière connexion</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-amber-50/40">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{user.lastLogin || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          type="button"
                          className="rounded-full border border-amber-200/70 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-amber-50 transition"
                        >
                          Éditer
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                        >
                          <Lock size={14} />
                          Réinitialiser MDP
                        </button>
                        <button
                          onClick={() => { setUserToDelete(user.id); setIsDeleteModalOpen(true) }}
                          type="button"
                          className="rounded-full px-4 py-2 text-xs font-semibold text-red-700 hover:text-red-800 transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Modifier ${selectedUser?.name || ''}`} size="md">
          <form id="crud-form" onSubmit={saveUser}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe (laisser vide pour ne pas changer)</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  placeholder="Nouveau mot de passe (optionnel)"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Ajouter un utilisateur" size="md">
          <form id="crud-form" onSubmit={saveUser}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  placeholder="Mot de passe initial"
                  required
                />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-gray-800"
                >
                  Créer
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null) }}
        onConfirm={confirmDelete}
        itemName="cet utilisateur"
        message="Cette suppression est irréversible. Les accès seront supprimés."
      />
      </div>
    </div>
  )
}

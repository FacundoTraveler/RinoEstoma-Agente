'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useRequireRole } from '@/hooks/use-auth'
import { Search, Mail, Phone, Calendar } from 'lucide-react'
import type { User } from '@/lib/types'

export default function UsersManagementPage() {
  const { isLoading: isAuthLoading } = useRequireRole('admin')
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'patient' | 'professional' | 'admin'>('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [filterType])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      let filtered = data.users || []

      if (filterType !== 'all') {
        filtered = filtered.filter((u: User) => u.user_type === filterType)
      }

      setUsers(filtered)
    } catch (error) {
      console.error('[v0] Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadgeColor = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'professional':
        return 'bg-blue-100 text-blue-800'
      case 'patient':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground">
              Administra perfiles y permisos de usuarios
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value as
                    | 'all'
                    | 'patient'
                    | 'professional'
                    | 'admin'
                )
              }
              className="px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="all">Todos los tipos</option>
              <option value="patient">Pacientes</option>
              <option value="professional">Profesionales</option>
              <option value="admin">Administradores</option>
            </select>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No se encontraron usuarios
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {user.full_name || 'Sin nombre'}
                        </h3>
                        <Badge className={getRoleBadgeColor(user.user_type)}>
                          {user.user_type === 'patient'
                            ? 'Paciente'
                            : user.user_type === 'professional'
                              ? 'Profesional'
                              : 'Admin'}
                        </Badge>
                        {user.is_active ? (
                          <Badge variant="default">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                        {user.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {user.phone_number}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString(
                              'es-ES'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver Perfil
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Stats Footer */}
          <Card className="p-6 bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacientes</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.user_type === 'patient').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profesionales</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.user_type === 'professional').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter((u) => u.user_type === 'admin').length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

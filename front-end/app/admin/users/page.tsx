"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Search, Pencil, Trash2, Loader2, Users, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { UserModal } from "@/components/admin/user-modal"
import { UserGroupsLinkModal } from "@/components/admin/user-groups-link-modal"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUsers, type User } from "@/lib/user-context"
import { useUsersGroups } from "@/lib/user-group-context"
import { useGroups } from "@/lib/group-context"
import { useTenants } from "@/lib/tenant-context"
import { useAuth } from "@/lib/auth-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UsersPage() {
  const { users, loading, error, deleteUser, fetchUsers } = useUsers()
  const {
    userGroups,
    fetchUsersGroups,
  } = useUsersGroups()
  const { groups, fetchGroups } = useGroups()
  const { tenants } = useTenants()
  const { user: authUser } = useAuth()

  const isSuperAdmin = authUser?.role === "SUPER_ADMIN"
  const tenantsById = useMemo(() => new Map(tenants.map((t) => [t.id, t.name])), [tenants])
  const [tenantId, setTenantId] = useState<number | undefined>(
    isSuperAdmin ? undefined : authUser?.tenantId ?? undefined
  )
  const requestTenantId = isSuperAdmin ? tenantId : authUser?.tenantId ?? undefined

  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isSuperAdmin && authUser?.tenantId) {
      setTenantId(authUser.tenantId)
    }
  }, [authUser?.tenantId, isSuperAdmin])

  useEffect(() => {
    if (isSuperAdmin && !tenantId && tenants.length > 0) {
      setTenantId(tenants[0].id)
    }
  }, [isSuperAdmin, tenantId, tenants])

  useEffect(() => {
    setSelectedUserId(null)
  }, [tenantId, isSuperAdmin])

  useEffect(() => {
    if (isSuperAdmin && !tenantId) return
    fetchUsers(requestTenantId)
    fetchUsersGroups(requestTenantId)
    fetchGroups(requestTenantId)
  }, [fetchUsers, fetchUsersGroups, fetchGroups, tenantId, isSuperAdmin, requestTenantId])

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      [u.name, u.email, u.username].some((field) =>
        (field ?? "").toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [users, search])

  const renderGroupsCell = (userId: number) => {
    const linked = userGroups
      .filter((ug) => ug.userId === userId)
      .map((ug) => groups.find((g) => g.id === ug.groupId)?.name ?? String(ug.groupId))

    if (linked.length === 0) return <span className="text-muted-foreground">-</span>

    const visible = linked.slice(0, 2)
    const remaining = linked.length - visible.length

    return (
      <div className="flex flex-wrap gap-1">
        {visible.map((name) => (
          <Badge key={name} variant="secondary" className="max-w-[140px] truncate">
            {name}
          </Badge>
        ))}
        {remaining > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Badge variant="outline" className="cursor-pointer">
                +{remaining}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="text-xs text-muted-foreground mb-2">Todos os grupos</div>
              <div className="flex flex-col gap-1">
                {linked.map((name) => (
                  <span key={name} className="text-sm">
                    {name}
                  </span>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    )
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setModalOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedUser) return
    setDeleting(true)
    try {
      await deleteUser(selectedUser.id, tenantId)
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleNewUser = () => {
    setSelectedUser(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie usuários do sistema</p>
        </div>
        <Button onClick={handleNewUser}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {isSuperAdmin && (
        <div className="max-w-xs">
          <Select value={tenantId ? String(tenantId) : ""} onValueChange={(v) => setTenantId(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={String(tenant.id)}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchUsers(requestTenantId)} className="mt-2 bg-transparent">
            Tentar novamente
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Usuários</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && users.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ativo</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Grupos</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="text-muted-foreground">{u.username}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{u.type}</TableCell>
                      <TableCell>{u.isActive ? "Sim" : "Não"}</TableCell>
                      <TableCell>
                        {u.tenantId ? tenantsById.get(u.tenantId) ?? u.tenantId : "-"}
                      </TableCell>
                      <TableCell>{renderGroupsCell(u.id)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUserId(u.id)
                              setLinkModalOpen(true)
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            title="Vincular grupos"
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(u)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(u)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UserModal open={modalOpen} onOpenChange={setModalOpen} user={selectedUser} tenantId={tenantId ?? null} />
      <UserGroupsLinkModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        tenantId={tenantId ?? null}
        defaultUserId={selectedUserId}
        onLinked={(id) => setSelectedUserId(id)}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir o usuário "${selectedUser?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />

    </div>
  )
}

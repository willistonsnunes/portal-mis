"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Search, Pencil, Trash2, Loader2, UsersRound, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { GroupModal } from "@/components/admin/group-modal"
import { WorkspaceImportModal } from "@/components/admin/workspace-import-modal"
import { useGroups, type Group } from "@/lib/group-context"
import { useTenants } from "@/lib/tenant-context"
import { useAuth } from "@/lib/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function GroupsPage() {
  const { groups, loading, error, deleteGroup, fetchGroups } = useGroups()
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
  const [importOpen, setImportOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
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
    if (isSuperAdmin && !tenantId) return
    fetchGroups(requestTenantId)
  }, [fetchGroups, tenantId, isSuperAdmin, requestTenantId])

  const filteredGroups = useMemo(() => {
    return groups.filter((g) =>
      [g.name, g.workspaceId ?? "", g.clientRef?.toString() ?? ""].some((field) =>
        (field ?? "").toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [groups, search])

  const handleEdit = (group: Group) => {
    setSelectedGroup(group)
    setModalOpen(true)
  }

  const handleDelete = (group: Group) => {
    setSelectedGroup(group)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedGroup) return
    setDeleting(true)
    try {
      await deleteGroup(selectedGroup.id, tenantId)
      setDeleteDialogOpen(false)
      setSelectedGroup(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleNew = () => {
    setSelectedGroup(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos</h1>
          <p className="text-muted-foreground">Gerencie grupos de usuários</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)} disabled={isSuperAdmin && !tenantId}>
            <Download className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Grupo
          </Button>
        </div>
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
          <Button variant="outline" size="sm" onClick={() => fetchGroups(requestTenantId)} className="mt-2 bg-transparent">
            Tentar novamente
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Grupos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar grupos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && groups.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Client Ref</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <UsersRound className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhum grupo encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>{g.name}</TableCell>
                      <TableCell className="text-muted-foreground">{g.workspaceId ?? "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{g.clientRef ?? "-"}</TableCell>
                      <TableCell>{g.isActive ? "Sim" : "Não"}</TableCell>
                      <TableCell>
                        {tenantsById.get(g.tenantId) ?? g.tenantId}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {g.createdAt ? new Date(g.createdAt).toLocaleDateString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(g)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(g)}
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

      <GroupModal open={modalOpen} onOpenChange={setModalOpen} group={selectedGroup} tenantId={tenantId ?? null} />
      <WorkspaceImportModal open={importOpen} onOpenChange={setImportOpen} tenantId={tenantId ?? null} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir grupo"
        description={`Tem certeza que deseja excluir o grupo "${selectedGroup?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />
    </div>
  )
}

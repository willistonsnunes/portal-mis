"use client"

import { useMemo, useState } from "react"
import { Plus, Search, Pencil, Trash2, Loader2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { TenantModal } from "@/components/admin/tenant-modal"
import { useTenants, type Tenant } from "@/lib/tenant-context"
import { useAuth } from "@/lib/auth-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function TenantsPage() {
  const { tenants, loading, error, deleteTenant, fetchTenants } = useTenants()
  const { user: authUser } = useAuth()
  const isSuperAdmin = authUser?.role === "SUPER_ADMIN"
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) =>
      [t.name, t.code, t.socialId].some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [tenants, search])

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setModalOpen(true)
  }

  const handleDelete = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedTenant) return
    setDeleting(true)
    try {
      await deleteTenant(selectedTenant.id)
      setDeleteDialogOpen(false)
      setSelectedTenant(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleNew = () => {
    setSelectedTenant(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">Gerencie tenants do sistema</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Tenant
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchTenants} className="mt-2 bg-transparent">
            Tentar novamente
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Tenants</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar tenants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && tenants.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Social ID</TableHead>
                  <TableHead>Modo PBI</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhum tenant encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.name}</TableCell>
                      <TableCell className="text-muted-foreground">{t.code}</TableCell>
                      <TableCell className="text-muted-foreground">{t.socialId}</TableCell>
                      <TableCell>{t.pbiEmbeddedMode ?? "-"}</TableCell>
                      <TableCell>{t.isActive ? "Sim" : "Não"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(t)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isSuperAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(t)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

      <TenantModal open={modalOpen} onOpenChange={setModalOpen} tenant={selectedTenant} />

      {isSuperAdmin && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Excluir tenant"
          description={`Tem certeza que deseja excluir o tenant "${selectedTenant?.name}"? Esta ação não pode ser desfeita.`}
          loading={deleting}
        />
      )}
    </div>
  )
}

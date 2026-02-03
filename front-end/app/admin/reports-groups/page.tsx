"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, Loader2, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { ReportGroupModal } from "@/components/admin/report-group-modal"
import { useReportsGroups, type ReportGroup } from "@/lib/groups-report-context"
import { useGroups } from "@/lib/group-context"
import { useReports } from "@/lib/report-context"
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

export default function ReportsGroupsPage() {
  const { reportGroups, loading, error, fetchReportsGroups, removeReportFromGroup } = useReportsGroups()
  const { groups, fetchGroups } = useGroups()
  const { reports, fetchReports } = useReports()
  const { tenants } = useTenants()
  const { user: authUser } = useAuth()

  const isSuperAdmin = authUser?.role === "SUPER_ADMIN"
  const [tenantId, setTenantId] = useState<number | undefined>(
    isSuperAdmin ? undefined : authUser?.tenantId ?? undefined
  )
  const requestTenantId = isSuperAdmin ? tenantId : authUser?.tenantId ?? undefined

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selected, setSelected] = useState<ReportGroup | null>(null)
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
    fetchReportsGroups(requestTenantId)
    fetchGroups(requestTenantId)
    fetchReports(requestTenantId)
  }, [fetchReportsGroups, fetchGroups, fetchReports, tenantId, isSuperAdmin, requestTenantId])

  const rows = useMemo(() => {
    return reportGroups.map((rg) => {
      const group = groups.find((g) => g.id === rg.groupId)
      const report = reports.find((r) => r.id === rg.reportId)
      return { ...rg, groupName: group?.name ?? rg.groupId, reportName: report?.name ?? rg.reportId }
    })
  }, [reportGroups, groups, reports])

  const handleDelete = (row: ReportGroup) => {
    setSelected(row)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      await removeReportFromGroup(selected.groupId, selected.reportId, tenantId)
      setDeleteDialogOpen(false)
      setSelected(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grupos x Relatórios</h1>
          <p className="text-muted-foreground">Gerencie vínculos entre grupos e relatórios</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Vincular
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
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Vínculos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && reportGroups.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Relatório</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Link2 className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhum vínculo encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={`${row.groupId}-${row.reportId}`}>
                      <TableCell>{row.groupName}</TableCell>
                      <TableCell>{row.reportName}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(row)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ReportGroupModal open={modalOpen} onOpenChange={setModalOpen} tenantId={tenantId ?? null} />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Remover vínculo"
        description="Tem certeza que deseja remover este vínculo?"
        loading={deleting}
      />
    </div>
  )
}

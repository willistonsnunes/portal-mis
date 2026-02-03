"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Search, Pencil, Trash2, Loader2, FileText, Download, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { ReportModal } from "@/components/admin/report-modal"
import { ReportImportModal } from "@/components/admin/report-import-modal"
import { ReportGroupsLinkModal } from "@/components/admin/report-groups-link-modal"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useReports, type Report } from "@/lib/report-context"
import { useReportsGroups } from "@/lib/groups-report-context"
import { useGroups } from "@/lib/group-context"
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

export default function ReportsPage() {
  const { reports, loading, error, deleteReport, fetchReports } = useReports()
  const {
    reportGroups,
    fetchReportsGroups,
  } = useReportsGroups()
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
  const [importOpen, setImportOpen] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null)
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
    setSelectedReportId(null)
  }, [tenantId, isSuperAdmin])

  useEffect(() => {
    if (isSuperAdmin && !tenantId) return
    fetchReports(requestTenantId)
    fetchReportsGroups(requestTenantId)
    fetchGroups(requestTenantId)
  }, [fetchReports, fetchReportsGroups, fetchGroups, tenantId, isSuperAdmin, requestTenantId])

  useEffect(() => {
    if (selectedReportId) return
    if (reports.length === 0) return
    setSelectedReportId(reports[0].id)
  }, [reports, selectedReportId])

  const filteredReports = useMemo(() => {
    return reports.filter((r) =>
      [r.name, r.reportKey, r.workspaceId ?? ""].some((field) =>
        (field ?? "").toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [reports, search])

  const renderGroupsCell = (reportId: number) => {
    const linked = reportGroups
      .filter((rg) => rg.reportId === reportId)
      .map((rg) => groups.find((g) => g.id === rg.groupId)?.name ?? String(rg.groupId))

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

  const handleEdit = (report: Report) => {
    setSelectedReport(report)
    setModalOpen(true)
  }

  const handleDelete = (report: Report) => {
    setSelectedReport(report)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedReport) return
    setDeleting(true)
    try {
      await deleteReport(selectedReport.id, tenantId)
      setDeleteDialogOpen(false)
      setSelectedReport(null)
    } finally {
      setDeleting(false)
    }
  }

  const handleNew = () => {
    setSelectedReport(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Gerencie relatórios</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)} disabled={isSuperAdmin && !tenantId}>
            <Download className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Relatório
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
          <Button variant="outline" size="sm" onClick={() => fetchReports(requestTenantId)} className="mt-2 bg-transparent">
            Tentar novamente
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Relatórios</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar relatórios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && reports.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Chave</TableHead>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Ativo</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Grupos</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhum relatório encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.reportKey}</TableCell>
                      <TableCell className="text-muted-foreground">{r.workspaceId ?? "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{r.reportId ?? "-"}</TableCell>
                      <TableCell>{r.isActive ? "Sim" : "Não"}</TableCell>
                      <TableCell>
                        {tenantsById.get(r.tenantId) ?? r.tenantId}
                      </TableCell>
                      <TableCell>{renderGroupsCell(r.id)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("pt-BR") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedReportId(r.id)
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
                            onClick={() => handleEdit(r)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(r)}
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

      <ReportModal open={modalOpen} onOpenChange={setModalOpen} report={selectedReport} tenantId={tenantId ?? null} />
      <ReportImportModal open={importOpen} onOpenChange={setImportOpen} tenantId={tenantId ?? null} />
      <ReportGroupsLinkModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        tenantId={tenantId ?? null}
        defaultReportId={selectedReportId}
        onLinked={(id) => setSelectedReportId(id)}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir relatório"
        description={`Tem certeza que deseja excluir o relatório "${selectedReport?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />

    </div>
  )
}

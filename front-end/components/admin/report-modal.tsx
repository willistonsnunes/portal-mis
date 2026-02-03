"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReports, type Report } from "@/lib/report-context"
import { useTenants } from "@/lib/tenant-context"
import { useAuth } from "@/lib/auth-context"

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report?: Report | null
  tenantId?: number | null
}

export function ReportModal({ open, onOpenChange, report, tenantId }: ReportModalProps) {
  const { addReport, updateReport } = useReports()
  const { tenants } = useTenants()
  const { user } = useAuth()

  const isSuperAdmin = user?.role === "SUPER_ADMIN"
  const tenantOptions = useMemo(() => tenants, [tenants])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    workspaceId: "",
    reportId: "",
    embedUrl: "",
    reportKey: "",
    tenantId: tenantId ?? user?.tenantId ?? null,
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    if (report) {
      setFormData({
        name: report.name,
        description: report.description ?? "",
        workspaceId: report.workspaceId,
        reportId: report.reportId,
        embedUrl: report.embedUrl,
        reportKey: report.reportKey,
        tenantId: report.tenantId ?? tenantId ?? user?.tenantId ?? null,
        isActive: report.isActive,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        workspaceId: "",
        reportId: "",
        embedUrl: "",
        reportKey: "",
        tenantId: tenantId ?? user?.tenantId ?? null,
        isActive: true,
      })
    }
    setError(null)
  }, [report, open, tenantId, user?.tenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const resolvedTenantId = formData.tenantId ?? tenantId ?? user?.tenantId ?? null
      if (!resolvedTenantId) {
        setError("Tenant é obrigatório")
        setLoading(false)
        return
      }

      const payload = {
        name: formData.name,
        description: formData.description || null,
        workspaceId: formData.workspaceId,
        reportId: formData.reportId,
        embedUrl: formData.embedUrl,
        reportKey: formData.reportKey,
        tenantId: resolvedTenantId,
        isActive: formData.isActive,
      }

      if (report) {
        await updateReport(report.id, payload, resolvedTenantId)
      } else {
        await addReport(payload, resolvedTenantId)
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar relatório")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{report ? "Editar Relatório" : "Novo Relatório"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportKey">Chave</Label>
              <Input
                id="reportKey"
                value={formData.reportKey}
                onChange={(e) => setFormData((prev) => ({ ...prev, reportKey: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceId">Workspace ID</Label>
              <Input
                id="workspaceId"
                value={formData.workspaceId}
                onChange={(e) => setFormData((prev) => ({ ...prev, workspaceId: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportId">Report ID</Label>
              <Input
                id="reportId"
                value={formData.reportId}
                onChange={(e) => setFormData((prev) => ({ ...prev, reportId: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="embedUrl">Embed URL</Label>
            <Input
              id="embedUrl"
              value={formData.embedUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, embedUrl: e.target.value }))}
              required
              disabled={loading}
            />
          </div>

          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="tenantId">Tenant</Label>
              <Select
                value={formData.tenantId ? String(formData.tenantId) : ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, tenantId: Number(value) }))
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenantOptions.map((tenant) => (
                    <SelectItem key={tenant.id} value={String(tenant.id)}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Ativo</p>
              <p className="text-xs text-muted-foreground">Permitir acesso ao relatório</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {report ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

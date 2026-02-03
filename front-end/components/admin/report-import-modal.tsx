"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { usePbi } from "@/lib/pbi-context"
import { useReports } from "@/lib/report-context"
import { useAuth } from "@/lib/auth-context"

interface ReportImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId?: number | null
}

export function ReportImportModal({ open, onOpenChange, tenantId }: ReportImportModalProps) {
  const { reports: pbiReports, loadingReports, fetchReports } = usePbi()
  const { reports, addReport } = useReports()
  const { user } = useAuth()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedTenantId = tenantId ?? user?.tenantId ?? null

  useEffect(() => {
    if (!open) return
    setError(null)
    setSelected(new Set())
    fetchReports()
  }, [open, fetchReports])

  const existingReportIds = useMemo(() => {
    return new Set(reports.map((report) => report.reportId).filter(Boolean) as string[])
  }, [reports])

  const toggleReport = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleImport = async () => {
    if (!resolvedTenantId) {
      setError("Selecione um tenant antes de importar")
      return
    }

    if (selected.size === 0) {
      setError("Selecione ao menos um relatório")
      return
    }

    setLoading(true)
    setError(null)

    try {
      for (const reportId of selected) {
        const report = pbiReports.find((r) => r.id === reportId)
        if (!report) continue
        if (existingReportIds.has(reportId)) continue

        await addReport(
          {
            name: report.name,
            description: null,
            workspaceId: report.workspaceId,
            reportId: report.id,
            embedUrl: report.embedUrl,
            reportKey: report.id,
            tenantId: resolvedTenantId,
            isActive: true,
          },
          resolvedTenantId
        )
      }

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar relatórios")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Relatórios</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {loadingReports ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : pbiReports.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Nenhum relatório encontrado
            </div>
          ) : (
            pbiReports.map((report) => {
              const isAlreadyImported = existingReportIds.has(report.id)
              const isChecked = selected.has(report.id)

              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">{report.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isAlreadyImported && (
                      <span className="text-xs text-muted-foreground">Ja importado</span>
                    )}
                    <Checkbox
                      checked={isChecked}
                      disabled={isAlreadyImported || loading}
                      onCheckedChange={() => toggleReport(report.id)}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleImport} disabled={loading || loadingReports}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importar selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

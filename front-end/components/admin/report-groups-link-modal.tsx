"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReportsGroups } from "@/lib/groups-report-context"
import { useGroups } from "@/lib/group-context"
import { useReports } from "@/lib/report-context"
import { useAuth } from "@/lib/auth-context"

interface ReportGroupsLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId?: number | null
  defaultReportId?: number | null
  onLinked?: (reportId: number) => void
}

export function ReportGroupsLinkModal({
  open,
  onOpenChange,
  tenantId,
  defaultReportId,
  onLinked,
}: ReportGroupsLinkModalProps) {
  const { addReportToGroup, reportGroups } = useReportsGroups()
  const { groups } = useGroups()
  const { reports } = useReports()
  const { user } = useAuth()

  const [reportId, setReportId] = useState<string>(defaultReportId ? String(defaultReportId) : "")
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedTenantId = tenantId ?? user?.tenantId ?? null

  useEffect(() => {
    if (!open) return
    setError(null)
    setSelected(new Set())
    setReportId(defaultReportId ? String(defaultReportId) : "")
  }, [open, defaultReportId])

  const existingGroupIds = useMemo(() => {
    const id = Number(reportId)
    if (!reportId || Number.isNaN(id)) return new Set<number>()
    return new Set(reportGroups.filter((rg) => rg.reportId === id).map((rg) => rg.groupId))
  }, [reportGroups, reportId])

  const toggleGroup = (groupId: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  const handleImport = async () => {
    if (!reportId) {
      setError("Selecione um relatório")
      return
    }

    if (selected.size === 0) {
      setError("Selecione ao menos um grupo")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const numericReportId = Number(reportId)
      for (const groupId of selected) {
        if (existingGroupIds.has(groupId)) continue
        await addReportToGroup(
          { groupId, reportId: numericReportId },
          resolvedTenantId ?? undefined
        )
      }
      onLinked?.(numericReportId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao vincular relatório aos grupos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vincular Relatório a Grupos</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Relatório</Label>
            <Select value={reportId} onValueChange={setReportId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um relatório" />
              </SelectTrigger>
              <SelectContent>
                {reports.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {groups.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Nenhum grupo encontrado
              </div>
            ) : (
              groups.map((group) => {
                const isAlreadyLinked = existingGroupIds.has(group.id)
                const isChecked = selected.has(group.id)

                return (
                  <div
                    key={group.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isAlreadyLinked && (
                        <span className="text-xs text-muted-foreground">Ja vinculado</span>
                      )}
                      <Checkbox
                        checked={isChecked}
                        disabled={isAlreadyLinked || loading}
                        onCheckedChange={() => toggleGroup(group.id)}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleImport} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Vincular selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

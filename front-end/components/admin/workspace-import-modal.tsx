"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { usePbi } from "@/lib/pbi-context"
import { useGroups } from "@/lib/group-context"
import { useAuth } from "@/lib/auth-context"

interface WorkspaceImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId?: number | null
}

export function WorkspaceImportModal({ open, onOpenChange, tenantId }: WorkspaceImportModalProps) {
  const { workspaces, loadingWorkspaces, fetchWorkspaces } = usePbi()
  const { groups, addGroup } = useGroups()
  const { user } = useAuth()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedTenantId = tenantId ?? user?.tenantId ?? null

  useEffect(() => {
    if (!open) return
    setError(null)
    setSelected(new Set())
    fetchWorkspaces()
  }, [open, fetchWorkspaces])

  const existingWorkspaceIds = useMemo(() => {
    return new Set(groups.map((group) => group.workspaceId).filter(Boolean) as string[])
  }, [groups])

  const toggleWorkspace = (id: string) => {
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
      setError("Selecione ao menos um workspace")
      return
    }

    setLoading(true)
    setError(null)

    try {
      for (const workspaceId of selected) {
        const workspace = workspaces.find((w) => w.id === workspaceId)
        if (!workspace) continue
        if (existingWorkspaceIds.has(workspaceId)) continue

        await addGroup(
          {
            name: workspace.name,
            description: null,
            workspaceId: workspace.id,
            clientRef: null,
            tenantId: resolvedTenantId,
            isActive: true,
          },
          resolvedTenantId
        )
      }

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar workspaces")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Workspaces</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {loadingWorkspaces ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Nenhum workspace encontrado
            </div>
          ) : (
            workspaces.map((workspace) => {
              const isAlreadyImported = existingWorkspaceIds.has(workspace.id)
              const isChecked = selected.has(workspace.id)

              return (
                <div
                  key={workspace.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{workspace.name}</p>
                    <p className="text-xs text-muted-foreground">{workspace.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isAlreadyImported && (
                      <span className="text-xs text-muted-foreground">Ja importado</span>
                    )}
                    <Checkbox
                      checked={isChecked}
                      disabled={isAlreadyImported || loading}
                      onCheckedChange={() => toggleWorkspace(workspace.id)}
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
          <Button type="button" onClick={handleImport} disabled={loading || loadingWorkspaces}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importar selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

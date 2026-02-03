"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsersGroups } from "@/lib/user-group-context"
import { useUsers } from "@/lib/user-context"
import { useGroups } from "@/lib/group-context"
import { useAuth } from "@/lib/auth-context"

interface UserGroupsLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId?: number | null
  defaultUserId?: number | null
  onLinked?: (userId: number) => void
}

export function UserGroupsLinkModal({
  open,
  onOpenChange,
  tenantId,
  defaultUserId,
  onLinked,
}: UserGroupsLinkModalProps) {
  const { addUserToGroup, userGroups } = useUsersGroups()
  const { users } = useUsers()
  const { groups } = useGroups()
  const { user } = useAuth()

  const [userId, setUserId] = useState<string>(defaultUserId ? String(defaultUserId) : "")
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedTenantId = tenantId ?? user?.tenantId ?? null

  useEffect(() => {
    if (!open) return
    setError(null)
    setSelected(new Set())
    setUserId(defaultUserId ? String(defaultUserId) : "")
  }, [open, defaultUserId])

  const existingGroupIds = useMemo(() => {
    const id = Number(userId)
    if (!userId || Number.isNaN(id)) return new Set<number>()
    return new Set(userGroups.filter((ug) => ug.userId === id).map((ug) => ug.groupId))
  }, [userGroups, userId])

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
    if (!userId) {
      setError("Selecione um usuário")
      return
    }

    if (selected.size === 0) {
      setError("Selecione ao menos um grupo")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const numericUserId = Number(userId)
      for (const groupId of selected) {
        if (existingGroupIds.has(groupId)) continue
        await addUserToGroup(
          { userId: numericUserId, groupId },
          resolvedTenantId ?? undefined
        )
      }
      onLinked?.(numericUserId)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao vincular usuário aos grupos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vincular Usuário a Grupos</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Usuário</Label>
            <Select value={userId} onValueChange={setUserId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.name} ({u.email})
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

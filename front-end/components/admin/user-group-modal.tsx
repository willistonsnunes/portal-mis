"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsersGroups } from "@/lib/user-group-context"
import { useUsers } from "@/lib/user-context"
import { useGroups } from "@/lib/group-context"
import { useTenants } from "@/lib/tenant-context"
import { useAuth } from "@/lib/auth-context"

interface UserGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId?: number | null
}

export function UserGroupModal({ open, onOpenChange, tenantId }: UserGroupModalProps) {
  const { addUserToGroup } = useUsersGroups()
  const { users } = useUsers()
  const { groups } = useGroups()
  const { tenants } = useTenants()
  const { user } = useAuth()

  const isSuperAdmin = user?.role === "SUPER_ADMIN"

  const [formData, setFormData] = useState({
    userId: "",
    groupId: "",
    tenantId: tenantId ?? user?.tenantId ?? null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tenantOptions = useMemo(() => tenants, [tenants])

  useEffect(() => {
    if (!open) return
    setFormData({
      userId: "",
      groupId: "",
      tenantId: tenantId ?? user?.tenantId ?? null,
    })
    setError(null)
  }, [open, tenantId, user?.tenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.userId || !formData.groupId) {
        setError("Selecione usuário e grupo")
        setLoading(false)
        return
      }

      const resolvedTenantId = formData.tenantId ?? tenantId ?? user?.tenantId ?? null
      await addUserToGroup(
        {
          userId: Number(formData.userId),
          groupId: Number(formData.groupId),
        },
        resolvedTenantId ?? undefined
      )
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao vincular usuário ao grupo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vincular Usuário ao Grupo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          {isSuperAdmin && (
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Select
                value={formData.tenantId ? String(formData.tenantId) : ""}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, tenantId: Number(value) }))}
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

          <div className="space-y-2">
            <Label>Usuário</Label>
            <Select
              value={formData.userId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, userId: value }))}
              disabled={loading}
            >
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

          <div className="space-y-2">
            <Label>Grupo</Label>
            <Select
              value={formData.groupId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, groupId: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vincular
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

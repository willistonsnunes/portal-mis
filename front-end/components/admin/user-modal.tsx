"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useUsers, type User, type UserRole, type UserType } from "@/lib/user-context"
import { useTenants } from "@/lib/tenant-context"
import { useAuth } from "@/lib/auth-context"

interface UserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  tenantId?: number | null
}

export function UserModal({ open, onOpenChange, user, tenantId }: UserModalProps) {
  const { addUser, updateUser } = useUsers()
  const { tenants } = useTenants()
  const { user: authUser } = useAuth()

  const isSuperAdmin = authUser?.role === "SUPER_ADMIN"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "USER" as UserRole,
    type: "INTERNAL" as UserType,
    tenantId: tenantId ?? authUser?.tenantId ?? null,
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tenantOptions = useMemo(() => tenants, [tenants])

  useEffect(() => {
    if (!open) return

    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        username: user.username,
        password: "",
        role: user.role,
        type: user.type,
        tenantId: user.tenantId ?? tenantId ?? authUser?.tenantId ?? null,
        isActive: user.isActive,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "USER",
        type: "INTERNAL",
        tenantId: tenantId ?? authUser?.tenantId ?? null,
        isActive: true,
      })
    }
    setError(null)
  }, [user, open, tenantId, authUser?.tenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const resolvedTenantId = formData.tenantId ?? tenantId ?? authUser?.tenantId ?? null
      if (!resolvedTenantId) {
        setError("Tenant é obrigatório")
        setLoading(false)
        return
      }

      if (user) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          role: formData.role,
          type: formData.type,
          isActive: formData.isActive,
        } as any

        if (formData.password) {
          updateData.password = formData.password
        }

        await updateUser(user.id, updateData, resolvedTenantId)
      } else {
        if (!formData.password) {
          setError("Senha é obrigatória para novos usuários")
          setLoading(false)
          return
        }
        await addUser(
          {
            name: formData.name,
            email: formData.email,
            username: formData.username,
            password: formData.password,
            role: formData.role,
            type: formData.type,
            tenantId: resolvedTenantId,
            isActive: formData.isActive,
          },
          resolvedTenantId
        )
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar usuário")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="nome.usuario"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{user ? "Nova Senha (opcional)" : "Senha"}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder={user ? "Deixe vazio para manter" : "••••••••"}
                required={!user}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Perfil</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value as UserRole }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="USER">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as UserType }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Interno</SelectItem>
                  <SelectItem value="EXTERNAL">Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <p className="text-xs text-muted-foreground">Permitir acesso ao sistema</p>
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
              {user ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useTenants, type Tenant, type PowerBIEmbeddedMode } from "@/lib/tenant-context"

interface TenantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant?: Tenant | null
}

export function TenantModal({ open, onOpenChange, tenant }: TenantModalProps) {
  const { addTenant, updateTenant } = useTenants()
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    socialId: "",
    isActive: true,
    pbiEmbeddedMode: null as PowerBIEmbeddedMode | null,
    azureAdClientId: "",
    azureAdClientSecret: "",
    azureAdTenantId: "",
    pbiClientId: "",
    pbiClientSecret: "",
    pbiTenantId: "",
    pbiUser: "",
    pbiPassword: "",
    pbiSecretValue: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    if (tenant) {
      setFormData({
        name: tenant.name,
        code: tenant.code,
        socialId: tenant.socialId,
        isActive: tenant.isActive,
        pbiEmbeddedMode: tenant.pbiEmbeddedMode ?? null,
        azureAdClientId: tenant.azureAdClientId ?? "",
        azureAdClientSecret: tenant.azureAdClientSecret ?? "",
        azureAdTenantId: tenant.azureAdTenantId ?? "",
        pbiClientId: tenant.pbiClientId ?? "",
        pbiClientSecret: tenant.pbiClientSecret ?? "",
        pbiTenantId: tenant.pbiTenantId ?? "",
        pbiUser: tenant.pbiUser ?? "",
        pbiPassword: tenant.pbiPassword ?? "",
        pbiSecretValue: tenant.pbiSecretValue ?? "",
      })
    } else {
      setFormData({
        name: "",
        code: "",
        socialId: "",
        isActive: true,
        pbiEmbeddedMode: null,
        azureAdClientId: "",
        azureAdClientSecret: "",
        azureAdTenantId: "",
        pbiClientId: "",
        pbiClientSecret: "",
        pbiTenantId: "",
        pbiUser: "",
        pbiPassword: "",
        pbiSecretValue: "",
      })
    }
    setError(null)
  }, [tenant, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        socialId: formData.socialId,
        isActive: formData.isActive,
        pbiEmbeddedMode: formData.pbiEmbeddedMode,
        azureAdClientId: formData.azureAdClientId || null,
        azureAdClientSecret: formData.azureAdClientSecret || null,
        azureAdTenantId: formData.azureAdTenantId || null,
        pbiClientId: formData.pbiClientId || null,
        pbiClientSecret: formData.pbiClientSecret || null,
        pbiTenantId: formData.pbiTenantId || null,
        pbiUser: formData.pbiUser || null,
        pbiPassword: formData.pbiPassword || null,
        pbiSecretValue: formData.pbiSecretValue || null,
      }

      if (tenant) {
        await updateTenant(tenant.id, payload)
      } else {
        await addTenant(payload)
      }
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar tenant")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tenant ? "Editar Tenant" : "Novo Tenant"}</DialogTitle>
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
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="socialId">Social ID</Label>
              <Input
                id="socialId"
                value={formData.socialId}
                onChange={(e) => setFormData((prev) => ({ ...prev, socialId: e.target.value }))}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pbiEmbeddedMode">Modo Power BI</Label>
            <Select
              value={formData.pbiEmbeddedMode ?? ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, pbiEmbeddedMode: value as PowerBIEmbeddedMode }))
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MASTER_USER">Master User</SelectItem>
                <SelectItem value="SERVICE_PRINCIPAL">Service Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="azureAdClientId">Azure Client ID</Label>
              <Input
                id="azureAdClientId"
                value={formData.azureAdClientId}
                onChange={(e) => setFormData((prev) => ({ ...prev, azureAdClientId: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="azureAdTenantId">Azure Tenant ID</Label>
              <Input
                id="azureAdTenantId"
                value={formData.azureAdTenantId}
                onChange={(e) => setFormData((prev) => ({ ...prev, azureAdTenantId: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="azureAdClientSecret">Azure Client Secret</Label>
            <Input
              id="azureAdClientSecret"
              value={formData.azureAdClientSecret}
              onChange={(e) => setFormData((prev) => ({ ...prev, azureAdClientSecret: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pbiClientId">PBI Client ID</Label>
              <Input
                id="pbiClientId"
                value={formData.pbiClientId}
                onChange={(e) => setFormData((prev) => ({ ...prev, pbiClientId: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pbiTenantId">PBI Tenant ID</Label>
              <Input
                id="pbiTenantId"
                value={formData.pbiTenantId}
                onChange={(e) => setFormData((prev) => ({ ...prev, pbiTenantId: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pbiClientSecret">PBI Client Secret</Label>
            <Input
              id="pbiClientSecret"
              value={formData.pbiClientSecret}
              onChange={(e) => setFormData((prev) => ({ ...prev, pbiClientSecret: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pbiUser">PBI Usuário</Label>
              <Input
                id="pbiUser"
                value={formData.pbiUser}
                onChange={(e) => setFormData((prev) => ({ ...prev, pbiUser: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pbiPassword">PBI Senha</Label>
              <Input
                id="pbiPassword"
                type="password"
                value={formData.pbiPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, pbiPassword: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pbiSecretValue">PBI Secret Value</Label>
            <Input
              id="pbiSecretValue"
              value={formData.pbiSecretValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, pbiSecretValue: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Ativo</p>
              <p className="text-xs text-muted-foreground">Permitir acesso ao tenant</p>
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
              {tenant ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

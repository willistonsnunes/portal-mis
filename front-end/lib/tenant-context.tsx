"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { authFetch, apiUrl, ApiError } from "./api"
import { useAuth } from "./auth-context"

/* =====================
 * Tipos
 * ===================== */

export type PowerBIEmbeddedMode = "MASTER_USER" | "SERVICE_PRINCIPAL"

export interface Tenant {
  id: number
  name: string
  code: string
  socialId: string
  isActive: boolean
  azureAdClientId: string | null
  azureAdClientSecret: string | null
  azureAdTenantId: string | null
  pbiEmbeddedMode: PowerBIEmbeddedMode | null
  pbiClientId: string | null
  pbiClientSecret: string | null
  pbiTenantId: string | null
  pbiUser: string | null
  pbiPassword: string | null
  pbiSecretValue: string | null
  planId: number
  createdAt: string
  updatedAt: string
}

export type CreateTenantData = {
  name: string
  code: string
  socialId: string
  planId: number
  isActive?: boolean
  azureAdClientId?: string | null
  azureAdClientSecret?: string | null
  azureAdTenantId?: string | null
  pbiEmbeddedMode?: PowerBIEmbeddedMode | null
  pbiClientId?: string | null
  pbiClientSecret?: string | null
  pbiTenantId?: string | null
  pbiUser?: string | null
  pbiPassword?: string | null
  pbiSecretValue?: string | null
}

export type UpdateTenantData = Partial<Omit<Tenant, "id" | "createdAt" | "updatedAt">>

/* =====================
 * Context Type
 * ===================== */

interface TenantsContextType {
  tenants: Tenant[]
  loading: boolean
  error: string | null
  clearError: () => void
  fetchTenants: () => Promise<void>
  addTenant: (tenant: CreateTenantData) => Promise<Tenant>
  updateTenant: (id: number, tenant: UpdateTenantData) => Promise<Tenant>
  deleteTenant: (id: number) => Promise<void>
  getTenantById: (id: number) => Promise<Tenant | undefined>
}

/* =====================
 * Context
 * ===================== */

const TenantsContext = createContext<TenantsContextType | undefined>(undefined)

/* =====================
 * Provider
 * ===================== */

export function TenantsProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const canViewTenants = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"

  const clearError = useCallback(() => setError(null), [])

  /* =====================
   * GET /tenants
   * ===================== */
  const fetchTenants = useCallback(async () => {
    if (!canViewTenants) {
      setTenants([])
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)

    try {
      const data = await authFetch<Tenant[]>(apiUrl("/tenants"))
      setTenants(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar clientes"
      setError(message)
      console.error("Erro ao buscar clientes:", err)
    } finally {
      setLoading(false)
    }
  }, [canViewTenants])

  /* =====================
   * POST /tenants
   * ===================== */
  const addTenant = useCallback(async (tenantData: CreateTenantData): Promise<Tenant> => {
    setLoading(true)
    setError(null)

    try {
      const newTenant = await authFetch<Tenant>(apiUrl("/tenants"), {
        method: "POST",
        body: JSON.stringify(tenantData),
      })

      setTenants((prev) => [...prev, newTenant])
      return newTenant
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao criar cliente"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * PUT /tenants/:id
   * ===================== */
  const updateTenant = useCallback(async (id: number, tenantData: UpdateTenantData): Promise<Tenant> => {
    setLoading(true)
    setError(null)

    try {
      const updatedTenant = await authFetch<Tenant>(apiUrl(`/tenants/${id}`), {
        method: "PUT",
        body: JSON.stringify(tenantData),
      })

      setTenants((prev) => prev.map((tenant) => (tenant.id === id ? updatedTenant : tenant)))
      return updatedTenant
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao atualizar cliente"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * DELETE /tenants/:id
   * ===================== */
  const deleteTenant = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      await authFetch(apiUrl(`/tenants/${id}`), {
        method: "DELETE",
      })
      setTenants((prev) => prev.filter((tenant) => tenant.id !== id))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao deletar cliente"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * GET /tenants/:id
   * ===================== */
  const getTenantById = useCallback(async (id: number): Promise<Tenant | undefined> => {
    try {
      const tenant = await authFetch<Tenant>(apiUrl(`/tenants/${id}`))
      return tenant
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar cliente"
      setError(message)
      return undefined
    }
  }, [])

  /* =====================
   * Effect inicial
   * ===================== */
  useEffect(() => {
    if (canViewTenants) {
      fetchTenants()
      return
    }
    setTenants([])
    setError(null)
  }, [fetchTenants, canViewTenants])

  return (
    <TenantsContext.Provider
      value={{
        tenants,
        loading,
        error,
        clearError,
        fetchTenants,
        addTenant,
        updateTenant,
        deleteTenant,
        getTenantById,
      }}
    >
      {children}
    </TenantsContext.Provider>
  )
}

/* =====================
 * Hook
 * ===================== */

export function useTenants() {
  const context = useContext(TenantsContext)
  if (context === undefined) {
    throw new Error("useTenants must be used within a TenantsProvider")
  }
  return context
}

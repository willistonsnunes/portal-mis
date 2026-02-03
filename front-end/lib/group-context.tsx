"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { authFetch, apiUrl, ApiError } from "./api"

/* =====================
 * Tipos
 * ===================== */

export interface Group {
  id: number
  name: string
  description: string | null
  workspaceId: string | null
  clientRef: number | null
  tenantId: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}


export type CreateGroupData = {
  name: string
  description?: string | null
  workspaceId?: string | null
  clientRef?: number | null
  tenantId: number
  isActive?: boolean
}

export type UpdateGroupData = Partial<Omit<Group, "id" | "createdAt" | "updatedAt">>

/* =====================
 * Context Type
 * ===================== */

interface GroupsContextType {
  groups: Group[]
  loading: boolean
  error: string | null
  clearError: () => void
  fetchGroups: (tenantId?: number) => Promise<void>
  addGroup: (group: CreateGroupData, tenantId?: number) => Promise<Group>
  updateGroup: (id: number, group: UpdateGroupData, tenantId?: number) => Promise<Group>
  deleteGroup: (id: number, tenantId?: number) => Promise<void>
  getGroupById: (id: number, tenantId?: number) => Promise<Group | undefined>
}

/* =====================
 * Context
 * ===================== */

const GroupsContext = createContext<GroupsContextType | undefined>(undefined)

/* =====================
 * Provider
 * ===================== */

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const withTenant = useCallback((path: string, tenantId?: number) => {
    if (!tenantId) return path
    const separator = path.includes("?") ? "&" : "?"
    return `${path}${separator}tenantId=${tenantId}`
  }, [])

  /* =====================
   * GET /groups
   * ===================== */
  const fetchGroups = useCallback(async (tenantId?: number) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authFetch<Group[]>(apiUrl(withTenant("/groups", tenantId)))
      setGroups(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar grupos"
      setError(message)
      console.error("Erro ao buscar grupos:", err)
    } finally {
      setLoading(false)
    }
  }, [withTenant])

  /* =====================
   * POST /groups
   * ===================== */
  const addGroup = useCallback(async (groupData: CreateGroupData, tenantId?: number): Promise<Group> => {
    setLoading(true)
    setError(null)

    try {
      const resolvedTenantId = tenantId ?? groupData.tenantId
      if (!resolvedTenantId) {
        throw new ApiError("Tenant é obrigatório", 400, "VALIDATION_ERROR")
      }

      const payload = { ...groupData, tenantId: resolvedTenantId }
      const newGroup = await authFetch<Group>(apiUrl("/groups"), {
        method: "POST",
        body: JSON.stringify(payload),
      })

      setGroups((prev) => [...prev, newGroup])
      return newGroup
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao criar grupo"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * PUT /groups/:id
   * ===================== */
  const updateGroup = useCallback(async (id: number, groupData: UpdateGroupData, tenantId?: number): Promise<Group> => {
    setLoading(true)
    setError(null)

    try {
      const updatedGroup = await authFetch<Partial<Group> & { message?: string }>(apiUrl(withTenant(`/groups/${id}`, tenantId)), {
        method: "PUT",
        body: JSON.stringify(groupData),
      })

      if (updatedGroup && typeof updatedGroup.id === "number") {
        setGroups((prev) => prev.map((group) => (group.id === id ? (updatedGroup as Group) : group)))
        return updatedGroup as Group
      }

      const refreshed = await authFetch<Group[]>(apiUrl(withTenant("/groups", tenantId)))
      setGroups(refreshed)
      const fallback = refreshed.find((group) => group.id === id)
      if (fallback) return fallback

      throw new ApiError("Grupo atualizado, mas não foi possível recarregar os dados", 200, "PARTIAL_UPDATE")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao atualizar grupo"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [withTenant])

  /* =====================
   * DELETE /groups/:id
   * ===================== */
  const deleteGroup = useCallback(async (id: number, tenantId?: number) => {
    setLoading(true)
    setError(null)

    try {
      await authFetch(apiUrl(withTenant(`/groups/${id}`, tenantId)), {
        method: "DELETE",
      })
      setGroups((prev) => prev.filter((group) => group.id !== id))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao deletar grupo"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [withTenant])

  /* =====================
   * GET /groups/:id
   * ===================== */
  const getGroupById = useCallback(async (id: number, tenantId?: number): Promise<Group | undefined> => {
    try {
      const group = await authFetch<Group>(apiUrl(withTenant(`/groups/${id}`, tenantId)))
      return group
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar grupo"
      setError(message)
      return undefined
    }
  }, [withTenant])

  return (
    <GroupsContext.Provider
      value={{
        groups,
        loading,
        error,
        clearError,
        fetchGroups,
        addGroup,
        updateGroup,
        deleteGroup,
        getGroupById,
      }}
    >
      {children}
    </GroupsContext.Provider>
  )
}

/* =====================
 * Hook
 * ===================== */

export function useGroups() {
  const context = useContext(GroupsContext)
  if (context === undefined) {
    throw new Error("useGroups must be used within a GroupsProvider")
  }
  return context
}

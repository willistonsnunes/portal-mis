"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { authFetch, apiUrl, ApiError } from "./api"

/* =====================
 * Tipos
 * ===================== */

export interface UserGroup {
  userId: number
  groupId: number
}

export type CreateUserGroupData = {
  userId: number
  groupId: number
}

/* =====================
 * Context Type
 * ===================== */

interface UsersGroupsContextType {
  userGroups: UserGroup[]
  loading: boolean
  error: string | null
  clearError: () => void
  fetchUsersGroups: (tenantId?: number) => Promise<void>
  fetchUserGroup: (userId: number, groupId: number, tenantId?: number) => Promise<UserGroup | null>
  addUserToGroup: (data: CreateUserGroupData, tenantId?: number) => Promise<UserGroup>
  removeUserFromGroup: (userId: number, groupId: number, tenantId?: number) => Promise<void>
  getUserGroups: (userId: number) => UserGroup[]
  getGroupUsers: (groupId: number) => UserGroup[]
}

/* =====================
 * Context
 * ===================== */

const UsersGroupsContext = createContext<UsersGroupsContextType | undefined>(undefined)

/* =====================
 * Provider
 * ===================== */

export function UsersGroupsProvider({ children }: { children: ReactNode }) {
  const [userGroups, setUserGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])
  const withTenant = useCallback((path: string, tenantId?: number) => {
    if (!tenantId) return path
    const separator = path.includes("?") ? "&" : "?"
    return `${path}${separator}tenantId=${tenantId}`
  }, [])

  /* =====================
   * GET /users-groups
   * ===================== */
  const fetchUsersGroups = useCallback(async (tenantId?: number) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authFetch<UserGroup[]>(
        apiUrl(withTenant("/users-groups", tenantId))
      )
      setUserGroups(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar usuarios-grupos"
      setError(message)
      console.error("Erro ao buscar usuarios-grupos:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * GET /users-groups/:userId/:groupId
   * ===================== */
  const fetchUserGroup = useCallback(async (userId: number, groupId: number, tenantId?: number): Promise<UserGroup | null> => {
    setLoading(true)
    setError(null)

    try {
      const data = await authFetch<UserGroup>(
        apiUrl(withTenant(`/users-groups/${userId}/${groupId}`, tenantId))
      )
      return data
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar relacao usuario-grupo"
      setError(message)
      console.error("Erro ao buscar relacao usuario-grupo:", err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * POST /users-groups
   * ===================== */
  const addUserToGroup = useCallback(async (data: CreateUserGroupData, tenantId?: number): Promise<UserGroup> => {
    setLoading(true)
    setError(null)

    try {
      const newUserGroup = await authFetch<UserGroup>(apiUrl("/users-groups"), {
        method: "POST",
        body: JSON.stringify(tenantId ? { ...data, tenantId } : data),
      })

      setUserGroups((prev) => [...prev, newUserGroup])
      return newUserGroup
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao adicionar usuario ao grupo"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * DELETE /users-groups/:userId/:groupId
   * ===================== */
  const removeUserFromGroup = useCallback(async (userId: number, groupId: number, tenantId?: number) => {
    setLoading(true)
    setError(null)

    try {
      await authFetch(apiUrl(withTenant(`/users-groups/${userId}/${groupId}`, tenantId)), {
        method: "DELETE",
      })
      setUserGroups((prev) => prev.filter((ug) => !(ug.userId === userId && ug.groupId === groupId)))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao remover usuario do grupo"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * Helper: Obter grupos de um usuario
   * ===================== */
  const getUserGroups = useCallback(
    (userId: number): UserGroup[] => {
      return userGroups.filter((ug) => ug.userId === userId)
    },
    [userGroups]
  )

  /* =====================
   * Helper: Obter usuarios de um grupo
   * ===================== */
  const getGroupUsers = useCallback(
    (groupId: number): UserGroup[] => {
      return userGroups.filter((ug) => ug.groupId === groupId)
    },
    [userGroups]
  )

  return (
    <UsersGroupsContext.Provider
      value={{
        userGroups,
        loading,
        error,
        clearError,
        fetchUsersGroups,
        fetchUserGroup,
        addUserToGroup,
        removeUserFromGroup,
        getUserGroups,
        getGroupUsers,
      }}
    >
      {children}
    </UsersGroupsContext.Provider>
  )
}

/* =====================
 * Hook
 * ===================== */

export function useUsersGroups() {
  const context = useContext(UsersGroupsContext)
  if (context === undefined) {
    throw new Error("useUsersGroups must be used within a UsersGroupsProvider")
  }
  return context
}


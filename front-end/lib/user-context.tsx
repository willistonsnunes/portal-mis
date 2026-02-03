"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { authFetch, apiUrl, ApiError } from "./api"

/* =====================
 * Tipos
 * ===================== */

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER"
export type UserType = "INTERNAL" | "EXTERNAL"

export interface User {
  id: number
  name: string
  email: string
  username: string
  role: UserRole
  type: UserType
  tenantId: number | null
  azureOid: string | null
  azureUpn: string | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export type CreateUserData = {
  name: string
  email: string
  username: string
  password: string
  role: UserRole
  type: UserType
  tenantId?: number | null
  azureOid?: string | null
  azureUpn?: string | null
  isActive?: boolean
}

export type UpdateUserData = Partial<Omit<User, "id" | "createdAt" | "updatedAt">> & {
  password?: string
}

/* =====================
 * Context Type
 * ===================== */

interface UsersContextType {
  users: User[]
  loading: boolean
  error: string | null
  clearError: () => void
  fetchUsers: (tenantId?: number) => Promise<void>
  addUser: (user: CreateUserData, tenantId?: number) => Promise<User>
  updateUser: (id: number, user: UpdateUserData, tenantId?: number) => Promise<User>
  deleteUser: (id: number, tenantId?: number) => Promise<void>
  getUserById: (id: number, tenantId?: number) => Promise<User | undefined>
}

/* =====================
 * Context
 * ===================== */

const UsersContext = createContext<UsersContextType | undefined>(undefined)

/* =====================
 * Provider
 * ===================== */

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const withTenant = useCallback((path: string, tenantId?: number) => {
    if (!tenantId) return path
    const separator = path.includes("?") ? "&" : "?"
    return `${path}${separator}tenantId=${tenantId}`
  }, [])

  /* =====================
   * GET /users
   * ===================== */
  const fetchUsers = useCallback(async (tenantId?: number) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authFetch<User[]>(apiUrl(withTenant("/users", tenantId)))
      setUsers(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar usuários"
      setError(message)
      console.error("Erro ao buscar usuários:", err)
    } finally {
      setLoading(false)
    }
  }, [withTenant])

  /* =====================
   * POST /users
   * ===================== */
  const addUser = useCallback(async (userData: CreateUserData, tenantId?: number): Promise<User> => {
    setLoading(true)
    setError(null)

    try {
      const payload = tenantId ? { ...userData, tenantId } : userData
      const newUser = await authFetch<User>(apiUrl("/users"), {
        method: "POST",
        body: JSON.stringify(payload),
      })

      setUsers((prev) => [...prev, newUser])
      return newUser
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao criar usuário"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * PUT /users/:id
   * ===================== */
  const updateUser = useCallback(async (id: number, userData: UpdateUserData, tenantId?: number): Promise<User> => {
    setLoading(true)
    setError(null)

    try {
      const payload = tenantId ? { ...userData, tenantId } : userData
      const updatedUser = await authFetch<User>(apiUrl(`/users/${id}`), {
        method: "PUT",
        body: JSON.stringify(payload),
      })

      setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)))
      return updatedUser
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao atualizar usuário"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * DELETE /users/:id
   * ===================== */
  const deleteUser = useCallback(async (id: number, tenantId?: number) => {
    setLoading(true)
    setError(null)

    try {
      const payload = tenantId ? { tenantId } : undefined
      await authFetch(apiUrl(`/users/${id}`), {
        method: "DELETE",
        body: payload ? JSON.stringify(payload) : undefined,
      })
      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao deletar usuário"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * GET /users/:id
   * ===================== */
  const getUserById = useCallback(async (id: number, tenantId?: number): Promise<User | undefined> => {
    try {
      const user = await authFetch<User>(apiUrl(withTenant(`/users/${id}`, tenantId)))
      return user
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar usuário"
      setError(message)
      return undefined
    }
  }, [withTenant])

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
        clearError,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

/* =====================
 * Hook
 * ===================== */

export function useUsers() {
  const context = useContext(UsersContext)
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider")
  }
  return context
}

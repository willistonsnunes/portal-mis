"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { authFetch, ApiError, AuthError } from "./api"

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

/* =====================
 * Context Type
 * ===================== */

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (
    login: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  reloadUser: () => Promise<void>
}

/* =====================
 * Context
 * ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/* =====================
 * Provider
 * ===================== */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  /* =====================
   * Carrega usuário logado
   * ===================== */
  const reloadUser = useCallback(async () => {
    try {
      const data = await authFetch<User>("/auth/me", {
        method: "GET",
        skipAuthRedirect: true,
      })

      setUser(data)
    } catch (error) {
      if (error instanceof AuthError) {
        setUser(null)
      }
    }
  }, [])

  /* =====================
   * Login
   * ===================== */
  const login = useCallback(
    async (login: string, password: string) => {
      try {
        const data = await authFetch<User>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ login, password }),
        })

        setUser(data)
        return { success: true }
      } catch (error) {
        if (error instanceof ApiError) {
          return {
            success: false,
            error: error.message,
          }
        }

        return {
          success: false,
          error: "Erro de conexão com o servidor",
        }
      }
    },
    []
  )

  /* =====================
   * Logout
   * ===================== */
  const logout = useCallback(async () => {
    try {
      await authFetch("/auth/logout", {
        method: "POST",
      })
    } catch {
      // ignora erro
    } finally {
      setUser(null)
      router.push("/")
    }
  }, [router])

  /* =====================
   * Bootstrap da sessão
   * ===================== */
  useEffect(() => {
    const init = async () => {
      await reloadUser()
      setIsLoading(false)
    }

    init()
  }, [reloadUser])

  /* =====================
   * Loading global
   * ===================== */
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* =====================
 * Hook
 * ===================== */

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

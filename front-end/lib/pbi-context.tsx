"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { authFetch, apiUrl, ApiError } from "./api"

export interface PbiReport {
  id: string
  name: string
  embedUrl: string
  workspaceId: string
}

export interface PbiWorkspace {
  id: string
  name: string
  isReadOnly?: boolean
  isOnDedicatedCapacity?: boolean
}

export interface PbiEmbedInfo {
  embedToken: string
  embedUrl: string
  reportId: string
  expiration: string
}

interface PbiContextType {
  reports: PbiReport[]
  workspaces: PbiWorkspace[]
  loadingReports: boolean
  loadingWorkspaces: boolean
  error: string | null
  clearError: () => void
  fetchReports: () => Promise<void>
  fetchWorkspaces: () => Promise<void>
  getEmbedToken: (reportDatabaseId: number) => Promise<PbiEmbedInfo>
}

const PbiContext = createContext<PbiContextType | undefined>(undefined)

export function PbiProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<PbiReport[]>([])
  const [workspaces, setWorkspaces] = useState<PbiWorkspace[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const fetchReports = useCallback(async () => {
    setLoadingReports(true)
    setError(null)

    try {
      const data = await authFetch<PbiReport[]>(apiUrl("/pbi/reports"))
      setReports(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar reports do Power BI"
      setError(message)
      console.error("Erro ao buscar reports do Power BI:", err)
    } finally {
      setLoadingReports(false)
    }
  }, [])

  const fetchWorkspaces = useCallback(async () => {
    setLoadingWorkspaces(true)
    setError(null)

    try {
      const data = await authFetch<PbiWorkspace[]>(apiUrl("/pbi/workspaces"))
      setWorkspaces(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar workspaces do Power BI"
      setError(message)
      console.error("Erro ao buscar workspaces do Power BI:", err)
    } finally {
      setLoadingWorkspaces(false)
    }
  }, [])

  const getEmbedToken = useCallback(async (reportDatabaseId: number) => {
    try {
      return await authFetch<PbiEmbedInfo>(
        apiUrl(`/pbi/reports/${reportDatabaseId}/embed-token`)
      )
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao gerar embed token"
      setError(message)
      throw err
    }
  }, [])

  return (
    <PbiContext.Provider
      value={{
        reports,
        workspaces,
        loadingReports,
        loadingWorkspaces,
        error,
        clearError,
        fetchReports,
        fetchWorkspaces,
        getEmbedToken,
      }}
    >
      {children}
    </PbiContext.Provider>
  )
}

export function usePbi() {
  const context = useContext(PbiContext)
  if (!context) {
    throw new Error("usePbi must be used within a PbiProvider")
  }
  return context
}

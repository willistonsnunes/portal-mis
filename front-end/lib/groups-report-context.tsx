"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { authFetch, apiUrl, ApiError } from "./api"

/* =====================
 * Tipos
 * ===================== */

export interface ReportGroup {
  groupId: number
  reportId: number
}

export type CreateReportGroupData = {
  groupId: number
  reportId: number
}

/* =====================
 * Context Type
 * ===================== */

interface ReportsGroupsContextType {
  reportGroups: ReportGroup[]
  loading: boolean
  error: string | null
  clearError: () => void
  fetchReportsGroups: (tenantId?: number) => Promise<void>
  fetchReportGroup: (groupId: number, reportId: number, tenantId?: number) => Promise<ReportGroup | null>
  addReportToGroup: (data: CreateReportGroupData, tenantId?: number) => Promise<ReportGroup>
  removeReportFromGroup: (groupId: number, reportId: number, tenantId?: number) => Promise<void>
  getGroupReports: (groupId: number) => ReportGroup[]
  getReportGroups: (reportId: number) => ReportGroup[]
}

/* =====================
 * Context
 * ===================== */

const ReportsGroupsContext = createContext<ReportsGroupsContextType | undefined>(undefined)

/* =====================
 * Provider
 * ===================== */

export function ReportsGroupsProvider({ children }: { children: ReactNode }) {
  const [reportGroups, setReportGroups] = useState<ReportGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])
  const withTenant = useCallback((path: string, tenantId?: number) => {
    if (!tenantId) return path
    const separator = path.includes("?") ? "&" : "?"
    return `${path}${separator}tenantId=${tenantId}`
  }, [])

  /* =====================
   * GET /reports-groups
   * ===================== */
  const fetchReportsGroups = useCallback(async (tenantId?: number) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authFetch<ReportGroup[]>(
        apiUrl(withTenant("/reports-groups", tenantId))
      )
      setReportGroups(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar relatorios-grupos"
      setError(message)
      console.error("Erro ao buscar relatorios-grupos:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * GET /reports-groups/:groupId/:reportId
   * ===================== */
  const fetchReportGroup = useCallback(async (groupId: number, reportId: number, tenantId?: number): Promise<ReportGroup | null> => {
    setLoading(true)
    setError(null)

    try {
      const data = await authFetch<ReportGroup>(
        apiUrl(withTenant(`/reports-groups/${groupId}/${reportId}`, tenantId))
      )
      return data
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar relacao relatorio-grupo"
      setError(message)
      console.error("Erro ao buscar relacao relatorio-grupo:", err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * POST /reports-groups
   * ===================== */
  const addReportToGroup = useCallback(async (data: CreateReportGroupData, tenantId?: number): Promise<ReportGroup> => {
    setLoading(true)
    setError(null)

    try {
      const newReportGroup = await authFetch<ReportGroup>(apiUrl("/reports-groups"), {
        method: "POST",
        body: JSON.stringify(tenantId ? { ...data, tenantId } : data),
      })

      setReportGroups((prev) => [...prev, newReportGroup])
      return newReportGroup
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao adicionar relatorio ao grupo"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * DELETE /reports-groups/:groupId/:reportId
   * ===================== */
  const removeReportFromGroup = useCallback(async (groupId: number, reportId: number, tenantId?: number) => {
    setLoading(true)
    setError(null)

    try {
      await authFetch(apiUrl(withTenant(`/reports-groups/${groupId}/${reportId}`, tenantId)), {
        method: "DELETE",
      })
      setReportGroups((prev) => prev.filter((rg) => !(rg.groupId === groupId && rg.reportId === reportId)))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao remover relatorio do grupo"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * Helper: Obter relatorios de um grupo
   * ===================== */
  const getGroupReports = useCallback(
    (groupId: number): ReportGroup[] => {
      return reportGroups.filter((rg) => rg.groupId === groupId)
    },
    [reportGroups]
  )

  /* =====================
   * Helper: Obter grupos de um relatorio
   * ===================== */
  const getReportGroups = useCallback(
    (reportId: number): ReportGroup[] => {
      return reportGroups.filter((rg) => rg.reportId === reportId)
    },
    [reportGroups]
  )

  return (
    <ReportsGroupsContext.Provider
      value={{
        reportGroups,
        loading,
        error,
        clearError,
        fetchReportsGroups,
        fetchReportGroup,
        addReportToGroup,
        removeReportFromGroup,
        getGroupReports,
        getReportGroups,
      }}
    >
      {children}
    </ReportsGroupsContext.Provider>
  )
}

/* =====================
 * Hook
 * ===================== */

export function useReportsGroups() {
  const context = useContext(ReportsGroupsContext)
  if (context === undefined) {
    throw new Error("useReportsGroups must be used within a ReportsGroupsProvider")
  }
  return context
}


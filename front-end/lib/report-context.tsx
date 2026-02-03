"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { authFetch, apiUrl, ApiError } from "./api"

/* =====================
 * Tipos
 * ===================== */

export interface Report {
  id: number
  name: string
  description: string | null
  workspaceId: string
  reportId: string
  embedUrl: string
  reportKey: string
  isActive: boolean
  tenantId: number
  createdAt: string
  updatedAt: string
}

export type CreateReportData = {
  name: string
  description?: string | null
  workspaceId: string
  reportId: string
  embedUrl: string
  reportKey: string
  tenantId: number
  isActive?: boolean
}

export type UpdateReportData = Partial<Omit<Report, "id" | "createdAt" | "updatedAt">>

/* =====================
 * Context Type
 * ===================== */

interface ReportsContextType {
  reports: Report[]
  loading: boolean
  error: string | null
  clearError: () => void
  fetchReports: (tenantId?: number) => Promise<void>
  addReport: (report: CreateReportData, tenantId?: number) => Promise<Report>
  updateReport: (id: number, report: UpdateReportData, tenantId?: number) => Promise<Report>
  deleteReport: (id: number, tenantId?: number) => Promise<void>
  getReportById: (id: number, tenantId?: number) => Promise<Report | undefined>
}

/* =====================
 * Context
 * ===================== */

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

/* =====================
 * Provider
 * ===================== */

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const withTenant = useCallback((path: string, tenantId?: number) => {
    if (!tenantId) return path
    const separator = path.includes("?") ? "&" : "?"
    return `${path}${separator}tenantId=${tenantId}`
  }, [])

  /* =====================
   * GET /reports
   * ===================== */
  const fetchReports = useCallback(async (tenantId?: number) => {
    setLoading(true)
    setError(null)

    try {
      const data = await authFetch<Report[]>(apiUrl(withTenant("/reports", tenantId)))
      setReports(data)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar relatórios"
      setError(message)
      console.error("Erro ao buscar relatórios:", err)
    } finally {
      setLoading(false)
    }
  }, [withTenant])

  /* =====================
   * POST /reports
   * ===================== */
  const addReport = useCallback(async (reportData: CreateReportData, tenantId?: number): Promise<Report> => {
    setLoading(true)
    setError(null)

    try {
      const payload = tenantId ? { ...reportData, tenantId } : reportData
      const newReport = await authFetch<Report>(apiUrl("/reports"), {
        method: "POST",
        body: JSON.stringify(payload),
      })

      setReports((prev) => [...prev, newReport])
      return newReport
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao criar relatório"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * PUT /reports/:id
   * ===================== */
  const updateReport = useCallback(async (id: number, reportData: UpdateReportData, tenantId?: number): Promise<Report> => {
    setLoading(true)
    setError(null)

    try {
      const payload = tenantId ? { ...reportData, tenantId } : reportData
      const updatedReport = await authFetch<Report>(apiUrl(`/reports/${id}`), {
        method: "PUT",
        body: JSON.stringify(payload),
      })

      setReports((prev) => prev.map((report) => (report.id === id ? updatedReport : report)))
      return updatedReport
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao atualizar relatório"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * DELETE /reports/:id
   * ===================== */
  const deleteReport = useCallback(async (id: number, tenantId?: number) => {
    setLoading(true)
    setError(null)

    try {
      const payload = tenantId ? { tenantId } : undefined
      await authFetch(apiUrl(`/reports/${id}`), {
        method: "DELETE",
        body: payload ? JSON.stringify(payload) : undefined,
      })
      setReports((prev) => prev.filter((report) => report.id !== id))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao deletar relatório"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /* =====================
   * GET /reports/:id
   * ===================== */
  const getReportById = useCallback(async (id: number, tenantId?: number): Promise<Report | undefined> => {
    try {
      const report = await authFetch<Report>(apiUrl(withTenant(`/reports/${id}`, tenantId)))
      return report
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao buscar relatório"
      setError(message)
      return undefined
    }
  }, [withTenant])

  return (
    <ReportsContext.Provider
      value={{
        reports,
        loading,
        error,
        clearError,
        fetchReports,
        addReport,
        updateReport,
        deleteReport,
        getReportById,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

/* =====================
 * Hook
 * ===================== */

export function useReports() {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider")
  }
  return context
}

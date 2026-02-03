"use client"

import React from "react"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { authFetch, apiUrl, ApiError } from "./api"

/* =====================
 * Tipos
 * ===================== */

export interface DetailsRequest {
  status_filter?: number
  type_filter?: number
  client_id?: number
  start_date?: string
  end_date?: string
  itsm_name?: string
}

export interface DetailItem {
  [key: string]: any
}

export type EndpointType =
  | "tickets"
  | "changes"
  | "problems"
  | "tasks"
  | "knowledges"
  | "satisfactions"

/* =====================
 * Context Type
 * ===================== */

interface DetailsContextType {
  tickets: DetailItem[]
  changes: DetailItem[]
  problems: DetailItem[]
  tasks: DetailItem[]
  knowledges: DetailItem[]
  satisfactions: DetailItem[]

  loading: Record<EndpointType, boolean>
  error: Record<EndpointType, string | null>

  clearError: (endpoint: EndpointType) => void
  clearAllErrors: () => void

  fetchTickets: (params?: DetailsRequest) => Promise<void>
  fetchChanges: (params?: DetailsRequest) => Promise<void>
  fetchProblems: (params?: DetailsRequest) => Promise<void>
  fetchTasks: (params?: DetailsRequest) => Promise<void>
  fetchKnowledges: (params?: DetailsRequest) => Promise<void>
  fetchSatisfactions: (params?: DetailsRequest) => Promise<void>

  // Legacy support
  fetchDetails: (params?: DetailsRequest) => Promise<void>
  details: DetailItem[]
  loading_legacy: boolean
  error_legacy: string | null
}

/* =====================
 * Context
 * ===================== */

const DetailsContext = createContext<DetailsContextType | undefined>(undefined)

/* =====================
 * Provider
 * ===================== */

export function DetailsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<DetailItem[]>([])
  const [changes, setChanges] = useState<DetailItem[]>([])
  const [problems, setProblems] = useState<DetailItem[]>([])
  const [tasks, setTasks] = useState<DetailItem[]>([])
  const [knowledges, setKnowledges] = useState<DetailItem[]>([])
  const [satisfactions, setSatisfactions] = useState<DetailItem[]>([])

  const [loading, setLoading] = useState<Record<EndpointType, boolean>>({
    tickets: false,
    changes: false,
    problems: false,
    tasks: false,
    knowledges: false,
    satisfactions: false,
  })

  const [error, setError] = useState<Record<EndpointType, string | null>>({
    tickets: null,
    changes: null,
    problems: null,
    tasks: null,
    knowledges: null,
    satisfactions: null,
  })

  // Legacy state
  const [details, setDetails] = useState<DetailItem[]>([])
  const [loadingLegacy, setLoadingLegacy] = useState(false)
  const [errorLegacy, setErrorLegacy] = useState<string | null>(null)

  const clearError = useCallback((endpoint: EndpointType) => {
    setError((prev) => ({ ...prev, [endpoint]: null }))
  }, [])

  const clearAllErrors = useCallback(() => {
    setError({
      tickets: null,
      changes: null,
      problems: null,
      tasks: null,
      knowledges: null,
      satisfactions: null,
    })
  }, [])

  /* =====================
   * Factory para criar funcoes de fetch
   * ===================== */
  const createFetchFunction = useCallback(
    (
      endpoint: EndpointType,
      setter: React.Dispatch<React.SetStateAction<DetailItem[]>>
    ) => {
      return async (params?: DetailsRequest) => {
        setLoading((prev) => ({ ...prev, [endpoint]: true }))
        setError((prev) => ({ ...prev, [endpoint]: null }))

        try {
          const data = await authFetch<DetailItem[]>(
            apiUrl(`/${endpoint}Details`),
            {
              method: "POST",
              body: JSON.stringify(params || {}),
            }
          )
          setter(data)
        } catch (err) {
          const message = err instanceof ApiError 
            ? err.message 
            : "Erro ao buscar dados"
          setError((prev) => ({ ...prev, [endpoint]: message }))
          console.error(`Erro ao buscar ${endpoint}:`, err)
        } finally {
          setLoading((prev) => ({ ...prev, [endpoint]: false }))
        }
      }
    },
    []
  )

  /* =====================
   * Funcoes de fetch especificas
   * ===================== */
  const fetchTickets = useCallback(
    createFetchFunction("tickets", setTickets),
    [createFetchFunction]
  )
  const fetchChanges = useCallback(
    createFetchFunction("changes", setChanges),
    [createFetchFunction]
  )
  const fetchProblems = useCallback(
    createFetchFunction("problems", setProblems),
    [createFetchFunction]
  )
  const fetchTasks = useCallback(
    createFetchFunction("tasks", setTasks),
    [createFetchFunction]
  )
  const fetchKnowledges = useCallback(
    createFetchFunction("knowledges", setKnowledges),
    [createFetchFunction]
  )
  const fetchSatisfactions = useCallback(
    createFetchFunction("satisfactions", setSatisfactions),
    [createFetchFunction]
  )

  /* =====================
   * Legacy fetch function
   * ===================== */
  const fetchDetails = useCallback(async (params?: DetailsRequest) => {
    setLoadingLegacy(true)
    setErrorLegacy(null)

    try {
      const data = await authFetch<DetailItem[]>(apiUrl("/ticketsDetails"), {
        method: "POST",
        body: JSON.stringify(params || {}),
      })
      setDetails(data)
    } catch (err) {
      const message = err instanceof ApiError 
        ? err.message 
        : "Erro ao buscar detalhes"
      setErrorLegacy(message)
      console.error("Erro ao buscar detalhes:", err)
    } finally {
      setLoadingLegacy(false)
    }
  }, [])

  return (
    <DetailsContext.Provider
      value={{
        tickets,
        changes,
        problems,
        tasks,
        knowledges,
        satisfactions,
        loading,
        error,
        clearError,
        clearAllErrors,
        fetchTickets,
        fetchChanges,
        fetchProblems,
        fetchTasks,
        fetchKnowledges,
        fetchSatisfactions,
        fetchDetails,
        details,
        loading_legacy: loadingLegacy,
        error_legacy: errorLegacy,
      }}
    >
      {children}
    </DetailsContext.Provider>
  )
}

/* =====================
 * Hooks
 * ===================== */

export function useDetails() {
  const context = useContext(DetailsContext)
  if (!context) {
    throw new Error("useDetails must be used within a DetailsProvider")
  }
  return context
}

export function useEndpoint(endpoint: EndpointType) {
  const context = useDetails()

  const fetchFn =
    context[
      `fetch${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}` as keyof DetailsContextType
    ] as (params?: DetailsRequest) => Promise<void>

  return {
    data: context[endpoint],
    loading: context.loading[endpoint],
    error: context.error[endpoint],
    clearError: () => context.clearError(endpoint),
    fetch: fetchFn,
  }
}



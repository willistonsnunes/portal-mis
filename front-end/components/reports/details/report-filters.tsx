import { type DetailsRequest } from "@/lib/details-context"
import type { Group } from "@/lib/group-context"

export interface FilterConfig {
  name: string
  label: string
  type: "select" | "date" | "text"
  options?: Array<{ label: string; value: any }>
  placeholder?: string
  width?: string
  paramName: keyof DetailsRequest
}

/* ======================= OPÇÕES COMUNS ======================= */

// Função para gerar opções de cliente dinamicamente a partir dos grupos
export const getClienteOptions = (groups: Group[]) => {
  // Filtra apenas grupos que têm clientRef definido e estão ativos
  const validGroups = groups.filter((group) => group.clientRef != null && group.isActive)
  
  // Remove duplicatas baseado no clientRef
  const uniqueGroups = validGroups.reduce((acc, current) => {
    const exists = acc.find(item => item.clientRef === current.clientRef)
    if (!exists) {
      acc.push(current)
    }
    return acc
  }, [] as Group[])
  
  // Mapeia para o formato esperado { label, value }
  return uniqueGroups.map(group => ({
    label: group.name,
    value: group.clientRef as number,
  }))
}

// Fallback estático (caso não tenha grupos carregados)
export const clienteOptions = [
  { label: "Neoenergia", value: 273 },
  { label: "Lanlink", value: 227 },
]

export const itsmOptions = [
  { label: "GLPi", value: "GLPi" },
  { label: "Assyst", value: "Assyst" },
]

export const statusOptions = [
  { label: "Registrados", value: 1 },
  { label: "Resolvidos", value: 2 },
  { label: "Reabertos", value: 3 },
]

export const statusOptionsKnowledges = [
  { label: "Criados", value: 1 },
  { label: "Publicados", value: 2 },
  { label: "Revisados", value: 3 },
  { label: "Atualizados", value: 4 },
]

export const statusOptionsSatisfactions = [
  { label: "Enviadas", value: 1 },
  { label: "Respondidas", value: 2 },
]


/* ======================= CONFIGURAÇÕES POR RELATÓRIO ======================= */

// TICKETS
export const ticketsFilters: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: statusOptions,
    placeholder: "Status",
    width: "w-32",
    paramName: "status_filter",
  },
  {
    name: "cliente",
    label: "Cliente",
    type: "select",
    options: clienteOptions, // Será substituído dinamicamente no componente
    placeholder: "Cliente",
    width: "w-48",
    paramName: "client_id",
  },
  {
    name: "itsm",
    label: "ITSM",
    type: "select",
    options: itsmOptions,
    placeholder: "ITSM",
    width: "w-32",
    paramName: "itsm_name",
  },
  {
    name: "startDate",
    label: "Data Inicial",
    type: "date",
    width: "w-36",
    paramName: "start_date",
  },
  {
    name: "endDate",
    label: "Data Final",
    type: "date",
    width: "w-36",
    paramName: "end_date",
  },
]

// CHANGES
export const changesFilters: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: statusOptions,
    placeholder: "Status",
    width: "w-32",
    paramName: "status_filter",
  },
  {
    name: "cliente",
    label: "Cliente",
    type: "select",
    options: clienteOptions, // Será substituído dinamicamente no componente
    placeholder: "Cliente",
    width: "w-48",
    paramName: "client_id",
  },
  {
    name: "itsm",
    label: "ITSM",
    type: "select",
    options: itsmOptions,
    placeholder: "ITSM",
    width: "w-32",
    paramName: "itsm_name",
  },
  {
    name: "startDate",
    label: "Data Inicial",
    type: "date",
    width: "w-36",
    paramName: "start_date",
  },
  {
    name: "endDate",
    label: "Data Final",
    type: "date",
    width: "w-36",
    paramName: "end_date",
  },
]

// PROBLEMS
export const problemsFilters: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: statusOptions,
    placeholder: "Status",
    width: "w-32",
    paramName: "status_filter",
  },
  {
    name: "cliente",
    label: "Cliente",
    type: "select",
    options: clienteOptions, // Será substituído dinamicamente no componente
    placeholder: "Cliente",
    width: "w-48",
    paramName: "client_id",
  },
  {
    name: "itsm",
    label: "ITSM",
    type: "select",
    options: itsmOptions,
    placeholder: "ITSM",
    width: "w-32",
    paramName: "itsm_name",
  },
  {
    name: "startDate",
    label: "Data Inicial",
    type: "date",
    width: "w-36",
    paramName: "start_date",
  },
  {
    name: "endDate",
    label: "Data Final",
    type: "date",
    width: "w-36",
    paramName: "end_date",
  },
]

// TASKS
export const tasksFilters: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: statusOptions,
    placeholder: "Status",
    width: "w-32",
    paramName: "status_filter",
  },
  {
    name: "cliente",
    label: "Cliente",
    type: "select",
    options: clienteOptions, // Será substituído dinamicamente no componente
    placeholder: "Cliente",
    width: "w-48",
    paramName: "client_id",
  },
  {
    name: "itsm",
    label: "ITSM",
    type: "select",
    options: itsmOptions,
    placeholder: "ITSM",
    width: "w-32",
    paramName: "itsm_name",
  },
  {
    name: "startDate",
    label: "Data Inicial",
    type: "date",
    width: "w-36",
    paramName: "start_date",
  },
  {
    name: "endDate",
    label: "Data Final",
    type: "date",
    width: "w-36",
    paramName: "end_date",
  },
]

// KNOWLEDGES
export const knowledgesFilters: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: statusOptionsKnowledges,
    placeholder: "Status",
    width: "w-32",
    paramName: "status_filter",
  },
  {
    name: "cliente",
    label: "Cliente",
    type: "select",
    options: clienteOptions, // Será substituído dinamicamente no componente
    placeholder: "Cliente",
    width: "w-48",
    paramName: "client_id",
  },
  {
    name: "itsm",
    label: "ITSM",
    type: "select",
    options: itsmOptions,
    placeholder: "ITSM",
    width: "w-32",
    paramName: "itsm_name",
  },
  {
    name: "startDate",
    label: "Data Inicial",
    type: "date",
    width: "w-36",
    paramName: "start_date",
  },
  {
    name: "endDate",
    label: "Data Final",
    type: "date",
    width: "w-36",
    paramName: "end_date",
  },
]

// SATISFACTIONS
export const satisfactionsFilters: FilterConfig[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: statusOptionsSatisfactions,
    placeholder: "Status",
    width: "w-32",
    paramName: "status_filter",
  },
  {
    name: "cliente",
    label: "Cliente",
    type: "select",
    options: clienteOptions, // Será substituído dinamicamente no componente
    placeholder: "Cliente",
    width: "w-48",
    paramName: "client_id",
  },
  {
    name: "itsm",
    label: "ITSM",
    type: "select",
    options: itsmOptions,
    placeholder: "ITSM",
    width: "w-32",
    paramName: "itsm_name",
  },
  {
    name: "startDate",
    label: "Data Inicial",
    type: "date",
    width: "w-36",
    paramName: "start_date",
  },
  {
    name: "endDate",
    label: "Data Final",
    type: "date",
    width: "w-36",
    paramName: "end_date",
  },
]




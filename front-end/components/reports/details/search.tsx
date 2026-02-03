"use client"
import { useEffect, useMemo, useState } from "react"
import { Search, Download, ChevronDown, X } from "lucide-react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useEndpoint, type EndpointType, type DetailsRequest } from "@/lib/details-context"
import { useGroups } from "@/lib/group-context"
import { useUsersGroups } from "@/lib/user-group-context"
import { useAuth } from "@/lib/auth-context"
import { getClienteOptions } from "@/components/reports/details/report-filters"

/* ======================= TYPES ======================= */
type ColumnFilter =
  | { type: "text"; value: string }
  | { type: "multi"; values: string[] }
  | { type: "date-range"; start?: string; end?: string }

interface FilterConfig {
  name: string
  label: string
  type: "select" | "date" | "text"
  options?: Array<{ label: string; value: any }>
  placeholder?: string
  width?: string
  paramName: keyof DetailsRequest
}

interface SearchPageProps {
  endpoint: EndpointType
  title: string
  filters: FilterConfig[]
  exportFileName?: string
}

/* ======================= UTILS ======================= */
function formatDateBR(value: any) {
  if (!value) return ""
  const date = new Date(value)
  if (isNaN(date.getTime())) return value.toString()
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

/* ======================= COMPONENTE PRINCIPAL ======================= */
export default function GenericSearchPage({
  endpoint,
  title,
  filters,
  exportFileName = "relatorio.xlsx",
}: SearchPageProps) {
  const { data, loading, error, fetch } = useEndpoint(endpoint)
  const { groups, fetchGroups } = useGroups()
  const { userGroups, fetchUsersGroups } = useUsersGroups()
  const { user } = useAuth()

  // Estados dos filtros dinâmicos
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})

  // Estados dos filtros de coluna
  const [draftFilters, setDraftFilters] = useState<Record<string, ColumnFilter>>({})
  const [appliedFilters, setAppliedFilters] = useState<Record<string, ColumnFilter>>({})

  useEffect(() => {
    if (!user?.tenantId) return
    fetchGroups(user.tenantId)
    fetchUsersGroups(user.tenantId)
  }, [fetchGroups, fetchUsersGroups, user?.tenantId])

  const userGroupIds = useMemo(() => {
    if (!user) return new Set<number>()
    return new Set(userGroups.filter((ug) => ug.userId === user.id).map((ug) => ug.groupId))
  }, [user, userGroups])

  const userGroupsWithClientRef = useMemo(() => {
    return groups.filter(
      (group) => group.clientRef != null && userGroupIds.has(group.id)
    )
  }, [groups, userGroupIds])

  filters.forEach((filter) => {
    if (filter.name === "cliente") {
      filter.options = getClienteOptions(userGroupsWithClientRef)
    }
  })
  
  /* ======================= DETECTA TIPO DAS COLUNAS ======================= */
  const columnMeta = useMemo(() => {
    if (!data.length) return {}
    const meta: Record<string, "text" | "date" | "multi"> = {}
    Object.keys(data[0]).forEach((key) => {
      const values = data.map((d) => d[key]).filter(Boolean)
      if (key.toLowerCase().includes("data")) meta[key] = "date"
      else if (new Set(values).size <= 10) meta[key] = "multi"
      else meta[key] = "text"
    })
    return meta
  }, [data])

  /* ======================= APLICA FILTROS DE COLUNA ======================= */
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.entries(appliedFilters).every(([key, filter]) => {
        const cell = row[key]
        if (!cell) return false

        switch (filter.type) {
          case "text":
            return cell.toString().toLowerCase().includes(filter.value.toLowerCase())
          case "multi":
            return filter.values.includes(cell.toString())
          case "date-range": {
            const time = new Date(cell).getTime()
            const start = filter.start ? new Date(filter.start).getTime() : -Infinity
            const end = filter.end ? new Date(filter.end).getTime() : Infinity
            return time >= start && time <= end
          }
          default:
            return true
        }
      })
    )
  }, [data, appliedFilters])

  /* ======================= LIMPAR FILTRO DE COLUNA ======================= */
  const clearFilter = (key: string) => {
    setAppliedFilters((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })
    setDraftFilters((prev) => {
      const copy = { ...prev }
      delete copy[key]
      return copy
    })
  }

  /* ======================= BUSCAR DADOS ======================= */
  const handleSearch = () => {
    const params: DetailsRequest = {}
    
    filters.forEach((filter) => {
      const value = filterValues[filter.name]
      if (value !== undefined && value !== "") {
        if (filter.paramName === "client_id" || filter.paramName === "status_filter" || filter.paramName === "type_filter") {
          params[filter.paramName] = Number(value)
        } else {
          params[filter.paramName] = value
        }
      }
    })

    fetch(params)
  }

  /* ======================= EXPORTAR ======================= */
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, title)
    XLSX.writeFile(wb, exportFileName)
  }

  /* ======================= RENDERIZAR FILTRO ======================= */
  const renderFilter = (filter: FilterConfig) => {
    const commonProps = {
      className: filter.width || "w-36",
    }

    switch (filter.type) {
      case "select":
        return (
          <Select
            key={filter.name}
            onValueChange={(v) =>
              setFilterValues((prev) => ({ ...prev, [filter.name]: v }))
            }
          >
            <SelectTrigger {...commonProps}>
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "date":
        return (
          <Input
            key={filter.name}
            type="date"
            {...commonProps}
            value={filterValues[filter.name] || ""}
            onChange={(e) =>
              setFilterValues((prev) => ({ ...prev, [filter.name]: e.target.value }))
            }
          />
        )

      case "text":
        return (
          <Input
            key={filter.name}
            type="text"
            placeholder={filter.placeholder || filter.label}
            {...commonProps}
            value={filterValues[filter.name] || ""}
            onChange={(e) =>
              setFilterValues((prev) => ({ ...prev, [filter.name]: e.target.value }))
            }
          />
        )

      default:
        return null
    }
  }

  /* ======================= RENDER ======================= */
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {filters.map(renderFilter)}

              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-1" />
                Buscar
              </Button>

              <Button onClick={handleExport} className="bg-green-600 text-white">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Badges mostrando filtros aplicados */}
          {Object.keys(appliedFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(appliedFilters).map(([key, filter]) => {
                let display = ""
                if (filter.type === "text") display = filter.value
                else if (filter.type === "multi") display = filter.values.join(", ")
                else if (filter.type === "date-range") {
                  display = `${filter.start ? formatDateBR(filter.start) : "??/??/????"} - ${
                    filter.end ? formatDateBR(filter.end) : "??/??/????"
                  }`
                }

                return (
                  <div
                    key={key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    <span>
                      {key} = {display}
                    </span>
                    <X
                      className="h-4 w-4 cursor-pointer hover:text-destructive transition-colors"
                      onClick={() => clearFilter(key)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="h-40 flex items-center justify-center">Carregando...</div>
          ) : error ? (
            <div className="h-40 flex items-center justify-center text-destructive">
              Erro: {error}
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {data[0] &&
                      Object.keys(data[0]).map((key) => (
                        <th key={key} className="px-4 py-2">
                          <div className="flex items-center gap-1">
                            {key}
                            <Popover>
                              <PopoverTrigger>
                                <ChevronDown className="h-4 w-4 cursor-pointer" />
                              </PopoverTrigger>
                              <PopoverContent className="w-64 space-y-3">
                                {columnMeta[key] === "text" && (
                                  <Input
                                    placeholder="Digite para filtrar"
                                    value={(draftFilters[key] as any)?.value || ""}
                                    onChange={(e) =>
                                      setDraftFilters((p) => ({
                                        ...p,
                                        [key]: { type: "text", value: e.target.value },
                                      }))
                                    }
                                  />
                                )}

                                {columnMeta[key] === "multi" &&
                                  Array.from(
                                    new Set(data.map((d) => d[key]).filter(Boolean))
                                  ).map((v) => (
                                    <div key={v} className="flex items-center gap-2">
                                      <Checkbox
                                        checked={
                                          (draftFilters[key] as any)?.values?.includes(v)
                                        }
                                        onCheckedChange={(checked) => {
                                          setDraftFilters((p) => {
                                            const values = (p[key] as any)?.values || []
                                            return {
                                              ...p,
                                              [key]: {
                                                type: "multi",
                                                values: checked
                                                  ? [...values, v]
                                                  : values.filter((x: string) => x !== v),
                                              },
                                            }
                                          })
                                        }}
                                      />
                                      {v}
                                    </div>
                                  ))}

                                {columnMeta[key] === "date" && (
                                  <>
                                    <Input
                                      type="date"
                                      placeholder="Data inicial"
                                      value={(draftFilters[key] as any)?.start || ""}
                                      onChange={(e) =>
                                        setDraftFilters((p) => ({
                                          ...p,
                                          [key]: {
                                            type: "date-range",
                                            start: e.target.value,
                                            end: (p[key] as any)?.end,
                                          },
                                        }))
                                      }
                                    />
                                    <Input
                                      type="date"
                                      placeholder="Data final"
                                      value={(draftFilters[key] as any)?.end || ""}
                                      onChange={(e) =>
                                        setDraftFilters((p) => ({
                                          ...p,
                                          [key]: {
                                            type: "date-range",
                                            start: (p[key] as any)?.start,
                                            end: e.target.value,
                                          },
                                        }))
                                      }
                                    />
                                  </>
                                )}

                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() =>
                                    setAppliedFilters((p) => ({
                                      ...p,
                                      [key]: draftFilters[key],
                                    }))
                                  }
                                >
                                  Aplicar
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 200).map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/50">
                      {Object.keys(row).map((k) => (
                        <td key={k} className="px-4 py-2">
                          {columnMeta[k] === "date"
                            ? formatDateBR(row[k])
                            : row[k]?.toString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

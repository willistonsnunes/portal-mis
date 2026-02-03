"use client"
import { useMemo, useState } from "react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { useDetails } from "@/lib/details-context"
import { useGroups } from "@/lib/group-context"

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

const tipoOptions = [
  { label: "Registrados", value: 1 },
  { label: "Resolvidos", value: 2 },
  { label: "Reabertos", value: 3 },
]

const itsmOptions = ["GLPi", "Assyst"]

type ColumnFilter =
  | { type: "text"; value: string }
  | { type: "multi"; values: string[] }
  | { type: "date-range"; start?: string; end?: string }

export default function SearchPageContent() {
  const { details, loading, fetchDetails } = useDetails()
  const { groups } = useGroups()

  const [tipo, setTipo] = useState<number | undefined>()
  const [cliente, setCliente] = useState<number | undefined>()
  const [itsm, setItsm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [draftFilters, setDraftFilters] = useState<Record<string, ColumnFilter>>({})
  const [appliedFilters, setAppliedFilters] = useState<Record<string, ColumnFilter>>({})

  // Gera opções de cliente do banco de dados
  const clienteOptions = useMemo(() => {
    const validGroups = groups.filter(group => group.clientRef != null && group.isActive)

    const uniqueGroups = validGroups.reduce((acc, current) => {
      const exists = acc.find(item => item.clientRef === current.clientRef)
      if (!exists) {
        acc.push(current)
      }
      return acc
    }, [] as typeof groups)

    return uniqueGroups.map(group => ({
      label: group.name,
      value: group.clientRef as number
    }))
  }, [groups])

  const columnMeta = useMemo(() => {
    if (!details.length) return {}
    const meta: Record<string, "text" | "date" | "multi"> = {}
    Object.keys(details[0]).forEach((key) => {
      const values = details.map((d) => d[key]).filter(Boolean)
      if (key.toLowerCase().includes("data")) meta[key] = "date"
      else if (new Set(values).size <= 10) meta[key] = "multi"
      else meta[key] = "text"
    })
    return meta
  }, [details])

  const filteredDetails = useMemo(() => {
    return details.filter((row) =>
      Object.entries(appliedFilters).every(([key, filter]) => {
        const cell = row[key]
        if (!cell) return false

        switch (filter.type) {
          case "text":
            return cell
              .toString()
              .toLowerCase()
              .includes(filter.value.toLowerCase())
          case "multi":
            return filter.values.includes(cell.toString())
          case "date-range": {
            const time = new Date(cell).getTime()
            const start = filter.start
              ? new Date(filter.start).getTime()
              : -Infinity
            const end = filter.end
              ? new Date(filter.end).getTime()
              : Infinity
            return time >= start && time <= end
          }
          default:
            return true
        }
      }),
    )
  }, [details, appliedFilters])

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

  const handleSearch = () => {
    fetchDetails({
      status_filter: tipo || 1,
      client_id: cliente || 0,
      start_date: startDate,
      end_date: endDate,
      itsm_name: itsm,
    })
  }

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredDetails)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Tickets")
    XLSX.writeFile(wb, "tickets.xlsx")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tickets</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select onValueChange={(v) => setTipo(Number(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipoOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value.toString()}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={(v) => setCliente(Number(v))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clienteOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value.toString()}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={setItsm}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="ITSM" />
                </SelectTrigger>
                <SelectContent>
                  {itsmOptions.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                className="w-36"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                className="w-36"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-1" />
                Buscar
              </Button>

              <Button onClick={handleExport} className="bg-green-600 text-white">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {Object.keys(appliedFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(appliedFilters).map(([key, filter]) => {
                let display = ""
                if (filter.type === "text") display = filter.value
                else if (filter.type === "multi") display = filter.values.join(", ")
                else if (filter.type === "date-range") {
                  display = `${
                    filter.start ? formatDateBR(filter.start) : "??/??/????"
                  } - ${
                    filter.end ? formatDateBR(filter.end) : "??/??/????"
                  }`
                }

                return (
                  <div
                    key={key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    <span>{key} = {display}</span>
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
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {details[0] &&
                      Object.keys(details[0]).map((key) => (
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
                                    new Set(details.map((d) => d[key]).filter(Boolean)),
                                  ).map((v) => (
                                    <div key={v} className="flex items-center gap-2">
                                      <Checkbox
                                        checked={(draftFilters[key] as any)?.values?.includes(v)}
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
                  {filteredDetails.slice(0, 200).map((row, i) => (
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

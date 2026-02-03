"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useReports } from "@/lib/report-context"
import { usePbi } from "@/lib/pbi-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PbiEmbedViewerProps {
  groupId: string
  reportId: string
}

export function PbiEmbedViewer({ groupId, reportId }: PbiEmbedViewerProps) {
  const router = useRouter()
  const { reports, getReportById } = useReports()
  const { getEmbedToken } = usePbi()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<any>(null)
  const embedContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar o relatório do banco
        const reportData = await getReportById(Number(reportId))
        
        if (!reportData) {
          setError("Relatório Não encontrado")
          return
        }

        setReport(reportData)

        // Buscar o token de embed
        const embedInfo = await getEmbedToken(reportData.id)

        // Configurar Power BI Embed
        if (embedContainerRef.current && window.powerbi) {
          const embedConfig = {
            type: "report",
            tokenType: 1, // Embed token
            accessToken: embedInfo.embedToken,
            embedUrl: embedInfo.embedUrl,
            id: embedInfo.reportId,
            permissions: 0, // Read-only
            settings: {
              panes: {
                filters: {
                  expanded: false,
                  visible: true,
                },
                pageNavigation: {
                  visible: true,
                },
              },
              background: 0,
            },
          }

          window.powerbi.embed(embedContainerRef.current, embedConfig)
        }
      } catch (err) {
        console.error("Erro ao carregar relatório:", err)
        setError("Erro ao carregar o relatório. Tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [reportId, getReportById, getEmbedToken])

  if (loading) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/reports/panels/${groupId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Carregando relatório...</div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/reports/panels/${groupId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Relatório Não encontrado"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/reports/panels/${groupId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">{report.name}</h1>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div
            ref={embedContainerRef}
            className="w-full"
            style={{ height: "calc(100vh - 220px)", minHeight: "600px" }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

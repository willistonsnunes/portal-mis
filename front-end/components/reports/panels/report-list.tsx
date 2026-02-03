"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useReports } from "@/lib/report-context"
import { useGroups } from "@/lib/group-context"
import { useReportsGroups } from "@/lib/groups-report-context"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, ExternalLink } from "lucide-react"

interface PanelsReportListProps {
  groupId: string
}

export function PanelsReportList({ groupId }: PanelsReportListProps) {
  const { reports, loading: reportsLoading, fetchReports } = useReports()
  const { groups, loading: groupsLoading, fetchGroups } = useGroups()
  const { reportGroups, loading: reportGroupsLoading, fetchReportsGroups } = useReportsGroups()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user?.tenantId) return
    fetchGroups(user.tenantId)
    fetchReports(user.tenantId)
    fetchReportsGroups(user.tenantId)
  }, [fetchGroups, fetchReports, fetchReportsGroups, user?.tenantId])

  const group = useMemo(
    () => groups.find((item) => item.id === Number(groupId)),
    [groups, groupId]
  )

  const groupReportIds = useMemo(() => {
    return new Set(
      reportGroups
        .filter((rg) => rg.groupId === Number(groupId))
        .map((rg) => rg.reportId)
    )
  }, [reportGroups, groupId])

  const groupReports = useMemo(() => {
    const linked = reports.filter((r) => r.isActive && groupReportIds.has(r.id))
    if (linked.length > 0) return linked

    if (group?.workspaceId) {
      return reports.filter(
        (r) => r.isActive && r.workspaceId === group.workspaceId
      )
    }

    return []
  }, [reports, groupReportIds, group?.workspaceId])

  if (reportsLoading || groupsLoading || reportGroupsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando relatórios...</div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/reports/panels")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Grupo não encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/reports/panels")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {group.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Relatórios disponíveis para este grupo
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groupReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {report.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() =>
                  router.push(`/reports/panels/${groupId}/${report.id}`)
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir Relatório
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {groupReports.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Nenhum relatório disponível para este grupo
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

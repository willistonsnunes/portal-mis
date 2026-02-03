"use client"

import { useEffect, useMemo } from "react"
import { useGroups } from "@/lib/group-context"
import { useUsersGroups } from "@/lib/user-group-context"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, Building2 } from "lucide-react"

export function PanelsClientList() {
  const { groups, loading, fetchGroups } = useGroups()
  const { userGroups, fetchUsersGroups, loading: loadingUserGroups } = useUsersGroups()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user?.tenantId) return
    fetchGroups(user.tenantId)
    fetchUsersGroups(user.tenantId)
  }, [fetchGroups, fetchUsersGroups, user?.tenantId])

  const userGroupIds = useMemo(() => {
    if (!user) return new Set<number>()
    return new Set(userGroups.filter((ug) => ug.userId === user.id).map((ug) => ug.groupId))
  }, [user, userGroups])

  const relatedGroups = useMemo(() => {
    return groups.filter((group) => userGroupIds.has(group.id))
  }, [groups, userGroupIds])

  if (loading || loadingUserGroups) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando grupos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painéis Power BI</h1>
        <p className="text-muted-foreground mt-2">
          Selecione um grupo para visualizar seus relatórios
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {relatedGroups.map((group) => (
          <Card
            key={group.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/reports/panels/${group.id}`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {group.name}
              </CardTitle>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {relatedGroups.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Nenhum grupo encontrado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

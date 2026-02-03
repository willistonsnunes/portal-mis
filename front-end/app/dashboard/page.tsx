"use client"

import { useEffect } from "react"
import { Users, UserCheck, UserX, TrendingUp, UsersRound, Building2 } from "lucide-react"
import { StatsCard } from "@/components/admin/stats-card"
import { UsersChart } from "@/components/dashboard/users-chart"
import { RecentActivity } from "@/components/admin/recent-activity"
import { useUsers } from "@/lib/user-context"
import { useGroups } from "@/lib/group-context"
import { useTenants } from "@/lib/tenant-context"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const { users, fetchUsers } = useUsers()
  const { groups, fetchGroups } = useGroups()
  const { tenants, fetchTenants } = useTenants()
  const { user } = useAuth()

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  const isSuperAdmin = user?.role === "SUPER_ADMIN"

  useEffect(() => {
    if (isAdmin) {
      const tenantId = user?.tenantId ?? undefined
      fetchUsers(tenantId)
      if (isSuperAdmin) {
        fetchGroups()
        fetchTenants()
      } else {
        fetchGroups(tenantId)
      }
    }
  }, [fetchUsers, fetchGroups, fetchTenants, isAdmin, isSuperAdmin, user?.tenantId])

  // =========================
  // CONTAGENS BÁSICAS
  // =========================
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.isActive).length
  const inactiveUsers = users.filter((u) => !u.isActive).length
  const totalGroups = groups.length
  const totalTenants = isSuperAdmin ? tenants.length : "-"

  // =========================
  // FUNÇÕES AUXILIARES
  // =========================
  const daysAgo = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date
  }

  // =========================
  // USUÁRIOS POR PERÍODO
  // =========================
  const usersLast30Days = users.filter(
    (u) => new Date(u.createdAt) >= daysAgo(30)
  )

  const usersPrevious30Days = users.filter((u) => {
    const createdAt = new Date(u.createdAt)
    return createdAt >= daysAgo(60) && createdAt < daysAgo(30)
  })

  // =========================
  // TAXA DE CRESCIMENTO
  // =========================
  const growthRate =
    usersPrevious30Days.length === 0
      ? 100
      : ((usersLast30Days.length - usersPrevious30Days.length) /
          usersPrevious30Days.length) *
        100

  // =========================
  // ATIVOS (TREND)
  // =========================
  const activeLast30 = usersLast30Days.filter((u) => u.isActive).length

  const activePrevious30 = usersPrevious30Days.filter((u) => u.isActive).length

  const activeTrend =
    activePrevious30 === 0
      ? 100
      : ((activeLast30 - activePrevious30) / activePrevious30) * 100

  // =========================
  // INATIVOS (TREND)
  // =========================
  const inactiveLast30 = usersLast30Days.filter((u) => !u.isActive).length

  const inactivePrevious30 = usersPrevious30Days.filter((u) => !u.isActive).length

  const inactiveTrend =
    inactivePrevious30 === 0
      ? 0
      : ((inactiveLast30 - inactivePrevious30) / inactivePrevious30) * 100

  // =========================
  // RENDER
  // =========================
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu painel administrativo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total de Usuários"
          value={totalUsers}
          icon={Users}
          trend={{
            value: Math.abs(Number(growthRate.toFixed(1))),
            isPositive: growthRate >= 0,
          }}
          iconClassName="bg-blue-500/10 text-blue-500"
        />

        <StatsCard
          title="Usuários Ativos"
          value={activeUsers}
          icon={UserCheck}
          trend={{
            value: Math.abs(Number(activeTrend.toFixed(1))),
            isPositive: activeTrend >= 0,
          }}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />

        <StatsCard
          title="Usuários Inativos"
          value={inactiveUsers}
          icon={UserX}
          trend={{
            value: Math.abs(Number(inactiveTrend.toFixed(1))),
            isPositive: inactiveTrend <= 0,
          }}
          iconClassName="bg-amber-500/10 text-amber-500"
        />

        <StatsCard
          title="Taxa de Crescimento"
          value={`${growthRate.toFixed(1)}%`}
          icon={TrendingUp}
          description="Últimos 30 dias"
          iconClassName="bg-violet-500/10 text-violet-500"
        />

        <StatsCard
          title="Total de Grupos"
          value={totalGroups}
          icon={UsersRound}
          iconClassName="bg-sky-500/10 text-sky-500"
        />

        <StatsCard
          title="Total de Tenants"
          value={totalTenants}
          icon={Building2}
          description={isSuperAdmin ? undefined : "Apenas super admin"}
          iconClassName="bg-indigo-500/10 text-indigo-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols">
        <UsersChart />
      </div>
    </div>
  )
}

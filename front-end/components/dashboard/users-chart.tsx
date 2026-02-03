"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useUsers } from "@/lib/user-context"

type ChartData = {
  name: string
  users: number
}

export function UsersChart() {
  const { users } = useUsers()

  // =========================
  // AGRUPAR USUÁRIOS POR MÊS
  // =========================
  const groupedByMonth = users.reduce<Record<string, number>>((acc, user) => {
    const date = new Date(user.createdAt)

    const label = date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    })

    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})

  // =========================
  // CONVERTER PARA ARRAY
  // =========================
  const data: ChartData[] = Object.entries(groupedByMonth)
    .map(([name, users]) => ({
      name,
      users,
    }))
    .sort((a, b) => {
      const [mA, yA] = a.name.split(" ")
      const [mB, yB] = b.name.split(" ")

      const dateA = new Date(`${mA} 1, ${yA}`)
      const dateB = new Date(`${mB} 1, ${yB}`)

      return dateA.getTime() - dateB.getTime()
    })

  // =========================
  // RENDER
  // =========================
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Crescimento de Usuários</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />

              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />

              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: number) => [`${value}`, "Usuários"]}
              />

              <Area
                type="monotone"
                dataKey="users"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorUsers)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

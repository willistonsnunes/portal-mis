import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const activities = [
  {
    user: "João Silva",
    action: "criou um novo usuário",
    time: "2 min atrás",
  },
  {
    user: "Maria Santos",
    action: "atualizou configurações",
    time: "15 min atrás",
  },
  {
    user: "Pedro Costa",
    action: "fez login no sistema",
    time: "1 hora atrás",
  },
  {
    user: "Ana Oliveira",
    action: "exportou relatório",
    time: "3 horas atrás",
  },
  {
    user: "Carlos Ferreira",
    action: "atualizou perfil",
    time: "5 horas atrás",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  Menu,
  ChevronDown,
  FileText,
  PieChart,
  List,
  Building2,
  UsersRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/lib/auth-context"

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [adminOpen, setAdminOpen] = useState(true)
  const [reportsOpen, setReportsOpen] = useState(false)

  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  const isSuperAdmin = user?.role === "SUPER_ADMIN"

  const adminMenuItems = [
    {
      title: "Usuários",
      icon: Users,
      href: "/admin/users",
    },
    ...(isAdmin
      ? [
          {
            title: "Tenants",
            icon: Building2,
            href: "/admin/tenants",
          },
        ]
      : []),
    {
      title: "Grupos",
      icon: UsersRound,
      href: "/admin/groups",
    },
    {
      title: "Relatórios",
      icon: List,
      href: "/admin/reports",
    },
  ]

  const reportsMenuItems = [
    {
      title: "Painéis",
      icon: PieChart,
      href: "/reports/panels",
    },
    {
      title: "Chamados",
      icon: FileText,
      href: "/reports/tickets",
    },
    {
      title: "Mudanças",
      icon: FileText,
      href: "/reports/changes",
    },
    {
      title: "Problemas",
      icon: FileText,
      href: "/reports/problems",
    },
    {
      title: "Tarefas",
      icon: FileText,
      href: "/reports/tasks",
    },
    {
      title: "Conhecimentos",
      icon: FileText,
      href: "/reports/knowledges",
    },
    {
      title: "Satisfações",
      icon: FileText,
      href: "/reports/satisfactions",
    },
  ]

  const isAdminActive = adminMenuItems.some((item) => pathname === item.href)
  const isReportsActive = reportsMenuItems.some((item) => pathname === item.href)

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && <span className="text-xl font-bold text-sidebar-foreground">Portal MIS</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {/* Dashboard - visível para todos */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/dashboard"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {collapsed ? (
          <Link
            href="/reports/panels"
            className={cn(
              "flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isReportsActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <FileText className="h-5 w-5 shrink-0" />
          </Link>
        ) : (
          <Collapsible open={reportsOpen} onOpenChange={setReportsOpen}>
            <CollapsibleTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isReportsActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0" />
                  <span>Relatórios</span>
                </div>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 transition-transform duration-200", reportsOpen && "rotate-180")}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 pt-1">
              {reportsMenuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {isAdmin && (
          <>
            {collapsed ? (
              <Link
                href="/admin/users"
                className={cn(
                  "flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isAdminActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Settings className="h-5 w-5 shrink-0" />
              </Link>
            ) : (
              <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isAdminActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 shrink-0" />
                      <span>Administração</span>
                    </div>
                    <ChevronDown
                      className={cn("h-4 w-4 shrink-0 transition-transform duration-200", adminOpen && "rotate-180")}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-1">
                  {adminMenuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-muted-foreground text-center">{!collapsed && "© 2026 Portal MIS"}</p>
      </div>
    </aside>
  )
}

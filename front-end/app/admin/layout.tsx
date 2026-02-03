"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/auth-context"
import { UsersProvider } from "@/lib/user-context"
import { ReportsProvider } from "@/lib/report-context"
import { TenantsProvider } from "@/lib/tenant-context"
import { GroupsProvider } from "@/lib/group-context"
import { UsersGroupsProvider } from "@/lib/user-group-context"
import { ReportsGroupsProvider } from "@/lib/groups-report-context"
import { PbiProvider } from "@/lib/pbi-context"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (!isAdmin) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin) return null

  return (
    <UsersProvider>
      <ReportsProvider>
        <TenantsProvider>
          <GroupsProvider>
            <UsersGroupsProvider>
              <ReportsGroupsProvider>
                <PbiProvider>
                  <div className="flex h-screen overflow-hidden bg-background">
                    <Sidebar />
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <Header />
                      <main className="flex-1 overflow-auto p-6">{children}</main>
                    </div>
                  </div>
                </PbiProvider>
              </ReportsGroupsProvider>
            </UsersGroupsProvider>
          </GroupsProvider>
        </TenantsProvider>
      </ReportsProvider>
    </UsersProvider>
  )
}

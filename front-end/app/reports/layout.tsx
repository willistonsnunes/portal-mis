"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { UsersProvider } from "@/lib/user-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ReportsProvider } from "@/lib/report-context"
import { GroupsProvider } from "@/lib/group-context"
import { UsersGroupsProvider } from "@/lib/user-group-context"
import { ReportsGroupsProvider } from "@/lib/groups-report-context"
import { PbiProvider } from "@/lib/pbi-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    
    <UsersProvider>
      <ReportsProvider>
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
      </ReportsProvider>
    </UsersProvider>
    
  )
}

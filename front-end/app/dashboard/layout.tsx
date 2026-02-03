"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { UsersProvider } from "@/lib/user-context"
import { GroupsProvider } from "@/lib/group-context"
import { TenantsProvider } from "@/lib/tenant-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

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
        <TenantsProvider>
          <GroupsProvider>
            <div className="flex h-screen overflow-hidden bg-background">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6">{children}</main>
              </div>
            </div>
          </GroupsProvider>
        </TenantsProvider>
      </UsersProvider>

  )
}

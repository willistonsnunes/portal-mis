import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { UsersProvider } from "@/lib/user-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Portal MIS",
  description: "Portal de relatórios",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <Script 
          src="https://cdn.jsdelivr.net/npm/powerbi-client@2.23.1/dist/powerbi.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <UsersProvider>{children}</UsersProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

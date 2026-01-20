import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav"
import { ThemeProvider } from "@/components/dashboard/theme-provider"
import { SeasonProvider } from "@/lib/contexts/season-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <SeasonProvider>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Oculto en móvil */}
          <aside className="hidden md:flex">
            <Sidebar />
          </aside>
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-slate-50">
              <div className="flex flex-col min-h-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SeasonProvider>
    </ThemeProvider>
  )
}

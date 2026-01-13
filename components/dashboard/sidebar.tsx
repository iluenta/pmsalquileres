"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Building2, Calendar, Users, CreditCard, Settings, BarChart3, BookOpen, ShoppingCart, CalendarDays, Wrench, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Propiedades",
    href: "/dashboard/properties",
    icon: Building2,
    permission: "properties.view",
  },
  {
    name: "Reservas",
    href: "/dashboard/bookings",
    icon: Calendar,
    permission: "bookings.view",
  },
  {
    name: "Calendario",
    href: "/dashboard/calendar",
    icon: CalendarDays,
    permission: "bookings.view",
  },
  {
    name: "Canales de Venta",
    href: "/dashboard/sales-channels",
    icon: ShoppingCart,
    permission: "config.manage",
  },
  {
    name: "Proveedores de Servicios",
    href: "/dashboard/service-providers",
    icon: Wrench,
    permission: "config.manage",
  },
  {
    name: "Personas",
    href: "/dashboard/persons",
    icon: Users,
    permission: "bookings.view",
  },
  {
    name: "Guías",
    href: "/dashboard/guides",
    icon: BookOpen,
    permission: "guides.view",
  },
  {
    name: "Gastos",
    href: "/dashboard/expenses",
    icon: TrendingDown,
    permission: "payments.view",
  },
  {
    name: "Ingresos",
    href: "/dashboard/incomes",
    icon: TrendingUp,
    permission: "payments.view",
  },
  {
    name: "Cuentas de Tesorería",
    href: "/dashboard/treasury-accounts",
    icon: Wallet,
    permission: "payments.view",
  },
  {
    name: "Reportes",
    href: "/dashboard/reports",
    icon: BarChart3,
    permission: "reports.view",
  },
  {
    name: "Configuración",
    href: "/dashboard/configuration",
    icon: Settings,
    permission: "config.manage",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { hasPermission } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-sidebar-foreground">PMS</span>
          <span className="text-xs text-muted-foreground">Alquileres</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          // Filtrar por permisos
          if (item.permission && !hasPermission(item.permission)) {
            return null
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="text-xs text-muted-foreground text-center">v1.0.0</div>
      </div>
    </div>
  )
}

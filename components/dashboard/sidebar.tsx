"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Building2, Calendar, Search, Users, CreditCard, Settings, BarChart3, BookOpen, ShoppingCart, CalendarDays, Wrench, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import NextImage from "next/image"

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
    name: "Cotizador",
    href: "/dashboard/quoter",
    icon: Search,
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
    <div className="flex h-full w-72 flex-col bg-white border-r border-slate-100">
      {/* Brand Logo - Aligned with Landing Page */}
      <div className="flex h-24 items-center gap-3 px-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-indigo-100">
          <span className="text-white font-black text-xl">P</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tighter text-slate-900">PMS Pro</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto scrollbar-hide">
        {navigation.map((item) => {
          // Filtrar por permisos
          if (item.permission && !hasPermission(item.permission)) {
            return null
          }

          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300",
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600",
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5", isActive ? "text-white" : "text-slate-400")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer / User Area (Placeholders for now) */}
      <div className="p-6 border-t border-slate-50">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
          <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-white overflow-hidden shadow-sm">
            <NextImage src="https://i.pravatar.cc/100?u=admin" alt="avatar" width={36} height={36} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-slate-900 truncate">Admin User</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase truncate">Subscription: Pro</span>
          </div>
        </div>
      </div>
    </div>
  )
}

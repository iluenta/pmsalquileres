"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SheetClose } from "@/components/ui/sheet"
import { LayoutDashboard, Building2, Calendar, Search, Users, Settings, BarChart3, BookOpen, ShoppingCart, CalendarDays, Wrench, Wallet, TrendingUp, TrendingDown } from "lucide-react"

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
  },
  {
    name: "Reservas",
    href: "/dashboard/bookings",
    icon: Calendar,
  },
  {
    name: "Calendario",
    href: "/dashboard/calendar",
    icon: CalendarDays,
  },
  {
    name: "Cotizador",
    href: "/dashboard/quoter",
    icon: Search,
  },
  {
    name: "Canales de Venta",
    href: "/dashboard/sales-channels",
    icon: ShoppingCart,
  },
  {
    name: "Proveedores de Servicios",
    href: "/dashboard/service-providers",
    icon: Wrench,
  },
  {
    name: "Personas",
    href: "/dashboard/persons",
    icon: Users,
  },
  {
    name: "Guías",
    href: "/dashboard/guides",
    icon: BookOpen,
  },
  {
    name: "Gastos",
    href: "/dashboard/expenses",
    icon: TrendingDown,
  },
  {
    name: "Ingresos",
    href: "/dashboard/incomes",
    icon: TrendingUp,
  },
  {
    name: "Cuentas de Tesorería",
    href: "/dashboard/treasury-accounts",
    icon: Wallet,
  },
  {
    name: "Reportes",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    name: "Configuración",
    href: "/dashboard/configuration",
    icon: Settings,
  },
]

export function MobileSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Brand Logo */}
      <div className="flex h-20 items-center gap-3 px-8 border-b border-slate-50">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center rotate-3 shadow-lg shadow-indigo-100">
          <span className="text-white font-black text-lg">P</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tighter text-slate-900">PMS Pro</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto scrollbar-hide">
        {navigation.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <SheetClose key={item.name} asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            </SheetClose>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-50 p-6">
        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">v1.0.0 PMS Pro</div>
      </div>
    </div>
  )
}


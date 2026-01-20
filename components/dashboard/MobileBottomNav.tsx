"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Calendar, Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "Calendario", href: "/dashboard/calendar" },
    { icon: Search, label: "Cotizador", href: "/dashboard/quoter" },
    { icon: Settings, label: "Ajustes", href: "/dashboard/settings" },
]

export function MobileBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-all duration-300",
                                isActive ? "text-indigo-600 scale-110" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-all",
                                isActive ? "bg-indigo-50 shadow-sm" : ""
                            )}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                isActive ? "opacity-100" : "opacity-0"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

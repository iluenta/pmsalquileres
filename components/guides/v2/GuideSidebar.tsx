"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface Tab {
    id: string
    label: string
    icon: LucideIcon
}

interface GuideSidebarProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
    isMobileOpen?: boolean
    onMobileOpenChange?: (open: boolean) => void
}

export function GuideSidebar({ tabs, activeTab, onTabChange, isMobileOpen, onMobileOpenChange }: GuideSidebarProps) {
    const handleTabClick = (tabId: string) => {
        onTabChange(tabId)
        if (onMobileOpenChange) {
            onMobileOpenChange(false) // Cerrar Sheet en móvil al hacer click
        }
    }

    const SidebarContent = () => {
        return (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-900">Navegación</h2>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 min-h-0">
                    <div className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50",
                                        !isActive && "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                                        isActive && "border-l-4"
                                    )}
                                    style={isActive ? {
                                        backgroundColor: 'var(--guide-secondary)',
                                        color: 'var(--guide-primary)',
                                        borderLeftColor: 'var(--guide-primary)',
                                    } : {}}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" style={isActive ? { color: 'var(--guide-primary)' } : { color: '#9ca3af' }} />
                                    <span className="text-left">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </nav>
            </div>
        )
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0 bg-white border-r border-gray-200">
                <div className="sticky top-[150px] h-[calc(100vh-150px)] overflow-y-auto">
                    <SidebarContent />
                </div>
            </aside>

            {/* Mobile Sheet */}
            {onMobileOpenChange !== undefined && (
                <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
                    <SheetContent side="left" className="w-80 p-0">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Menú de navegación</SheetTitle>
                        </SheetHeader>
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            )}
        </>
    )
}


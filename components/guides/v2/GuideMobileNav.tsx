"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface Tab {
    id: string
    label: string
    icon: LucideIcon
}

interface GuideMobileNavProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
}

export function GuideMobileNav({ tabs, activeTab, onTabChange }: GuideMobileNavProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const activeTabRef = useRef<HTMLButtonElement>(null)

    // Auto-centrado de la pestaña activa
    useEffect(() => {
        if (activeTabRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current
            const tab = activeTabRef.current

            const containerWidth = container.offsetWidth
            const tabOffsetLeft = tab.offsetLeft
            const tabWidth = tab.offsetWidth

            const scrollLeft = tabOffsetLeft - containerWidth / 2 + tabWidth / 2

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            })
        }
    }, [activeTab])

    return (
        <div className="md:hidden sticky top-[60px] z-30 bg-white/90 backdrop-blur-md border-b transition-all duration-300">
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto no-scrollbar py-3 px-4 gap-3"
            >
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            ref={isActive ? activeTabRef : null}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300",
                                isActive
                                    ? "bg-[var(--guide-primary)] text-white shadow-md scale-105"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-gray-400")} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

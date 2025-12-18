"use client"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface Tab {
    id: string
    label: string
    icon: LucideIcon
}

interface GuideTabsProps {
    tabs: Tab[]
    activeTab: string
    onTabChange: (tabId: string) => void
}

export function GuideTabs({ tabs, activeTab, onTabChange }: GuideTabsProps) {
    return (
        <div className="w-full overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors focus:outline-none select-none",
                                    activeTab === tab.id
                                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300",
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

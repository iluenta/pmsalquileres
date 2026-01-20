import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-100 transition-all duration-500", className)}>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
            <p className="text-3xl font-black tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors duration-500">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-md inline-flex items-center gap-1 uppercase tracking-wider",
                  trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600",
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}% vs mes anterior
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-indigo-50 p-4 group-hover:bg-indigo-600 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-sm border border-indigo-100/50">
            <Icon className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors duration-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

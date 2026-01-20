"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import type { PropertyOccupancy } from "@/lib/api/dashboard"

interface OccupancyChartProps {
  data: PropertyOccupancy[]
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  return (
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden">
      <CardHeader className="px-8 pt-8">
        <CardTitle className="text-xl font-black tracking-tighter flex items-center gap-3 text-slate-900 uppercase">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Ocupación por Propiedad
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        {data.length === 0 ? (
          <p className="text-center text-slate-400 py-12 font-medium">No hay datos de ocupación disponibles</p>
        ) : (
          <div className="space-y-8">
            {data.map((property, index) => (
              <div key={index} className="space-y-3 group">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{property.property_name}</span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {property.occupancy_rate}% <span className="text-slate-200">|</span> {property.total_bookings} reservas
                  </span>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-indigo-100"
                    style={{ width: `${property.occupancy_rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

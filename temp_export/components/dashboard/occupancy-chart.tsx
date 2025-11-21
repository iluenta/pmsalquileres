"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import type { PropertyOccupancy } from "@/lib/api/dashboard"

interface OccupancyChartProps {
  data: PropertyOccupancy[]
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Ocupación por Propiedad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay datos de ocupación disponibles</p>
        ) : (
          <div className="space-y-4">
            {data.map((property, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{property.property_name}</span>
                  <span className="text-muted-foreground">
                    {property.occupancy_rate}% ({property.total_bookings} reservas)
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
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

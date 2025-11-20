"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { BookingAnalytics } from "@/types/reports"
import { formatCurrency } from "@/lib/utils/reports-calculations"
import { useState } from "react"

interface BookingsTableProps {
  data: BookingAnalytics[]
}

export function BookingsTable({ data }: BookingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof BookingAnalytics | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (field: keyof BookingAnalytics) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const filteredData = data.filter((booking) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      booking.bookingCode.toLowerCase().includes(searchLower) ||
      booking.propertyName.toLowerCase().includes(searchLower) ||
      booking.guestName.toLowerCase().includes(searchLower) ||
      (booking.channelName && booking.channelName.toLowerCase().includes(searchLower))
    )
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
    
    const aStr = String(aValue)
    const bStr = String(bValue)
    
    return sortDirection === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr)
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservas</CardTitle>
        <CardDescription>Lista completa de reservas con análisis</CardDescription>
        <div className="mt-4">
          <Input
            placeholder="Buscar por código, propiedad, huésped o canal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("bookingCode")}
              >
                Código {sortField === "bookingCode" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("propertyName")}
              >
                Propiedad {sortField === "propertyName" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("guestName")}
              >
                Huésped {sortField === "guestName" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("nights")}
              >
                Noches {sortField === "nights" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("revenue")}
              >
                Ingreso {sortField === "revenue" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("channelName")}
              >
                Canal {sortField === "channelName" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("leadTime")}
              >
                Lead Time {sortField === "leadTime" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No hay reservas que mostrar
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((booking) => (
                <TableRow key={booking.bookingId}>
                  <TableCell className="font-medium">{booking.bookingCode}</TableCell>
                  <TableCell>{booking.propertyName}</TableCell>
                  <TableCell>{booking.guestName}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Entrada: {formatDate(booking.checkInDate)}</div>
                      <div>Salida: {formatDate(booking.checkOutDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{booking.nights}</TableCell>
                  <TableCell>{formatCurrency(booking.revenue)}</TableCell>
                  <TableCell>{booking.channelName || "Sin canal"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{booking.status}</Badge>
                  </TableCell>
                  <TableCell>{booking.leadTime} días</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {sortedData.length} de {data.length} reservas
        </div>
      </CardContent>
    </Card>
  )
}


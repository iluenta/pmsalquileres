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
import type { ProfitabilityData } from "@/types/reports"
import { formatCurrency, formatPercentage } from "@/lib/utils/reports-calculations"
import { useState } from "react"

interface ProfitabilityTableProps {
  data: ProfitabilityData[]
  showCard?: boolean
}

export function ProfitabilityTable({ data, showCard = true }: ProfitabilityTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof ProfitabilityData | null>("netProfit")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (field: keyof ProfitabilityData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const filteredData = data.filter((item) =>
    item.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const content = (
    <>
      {!showCard && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Rentabilidad por Propiedad</h3>
          <p className="text-sm text-muted-foreground">Análisis de ROI, cashflow y break-even point</p>
        </div>
      )}
      <div className={showCard ? "mt-4" : "mb-4"}>
        <Input
          placeholder="Buscar por propiedad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("propertyName")}
            >
              Propiedad {sortField === "propertyName" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("revenue")}
            >
              Ingresos {sortField === "revenue" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("expenses")}
            >
              Gastos {sortField === "expenses" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("netProfit")}
            >
              Beneficio Neto {sortField === "netProfit" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("roi")}
            >
              ROI {sortField === "roi" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("cashflow")}
            >
              Cashflow Mensual {sortField === "cashflow" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("occupancyRate")}
            >
              Ocupación {sortField === "occupancyRate" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No hay datos de rentabilidad que mostrar
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item) => (
              <TableRow key={item.propertyId}>
                <TableCell className="font-medium">{item.propertyName}</TableCell>
                <TableCell>{formatCurrency(item.revenue)}</TableCell>
                <TableCell>{formatCurrency(item.expenses)}</TableCell>
                <TableCell>
                  <span className={item.netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(item.netProfit)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={item.roi >= 0 ? "default" : "destructive"}>
                    {formatPercentage(item.roi)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={item.cashflow >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(item.cashflow)}
                  </span>
                </TableCell>
                <TableCell>{formatPercentage(item.occupancyRate)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="mt-4 text-sm text-muted-foreground">
        Mostrando {sortedData.length} de {data.length} propiedades
      </div>
    </>
  )

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rentabilidad por Propiedad</CardTitle>
          <CardDescription>Análisis de ROI, cashflow y break-even point</CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    )
  }

  return <div>{content}</div>
}


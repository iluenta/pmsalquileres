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
import type { ExpenseData, ExpenseByProperty } from "@/types/reports"
import { formatCurrency, formatPercentage } from "@/lib/utils/reports-calculations"
import { useState } from "react"

interface ExpensesTableProps {
  expenses: ExpenseData[]
  expensesByProperty: ExpenseByProperty[]
}

export function ExpensesTable({ expenses, expensesByProperty }: ExpensesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"category" | "property">("category")

  const filteredExpenses = expenses.filter((expense) =>
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredExpensesByProperty = expensesByProperty.filter((item) =>
    item.propertyName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gastos Detallados</CardTitle>
            <CardDescription>Desglose de gastos por categoría y propiedad</CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("category")}
              className={`px-3 py-1 text-sm rounded ${
                view === "category"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Por Categoría
            </button>
            <button
              onClick={() => setView("property")}
              className={`px-3 py-1 text-sm rounded ${
                view === "property"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Por Propiedad
            </button>
          </div>
        </div>
        <div className="mt-4">
          <Input
            placeholder={`Buscar por ${view === "category" ? "categoría" : "propiedad"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {view === "category" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Importe Total</TableHead>
                <TableHead>Número de Gastos</TableHead>
                <TableHead>Porcentaje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No hay gastos que mostrar
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.category}>
                    <TableCell className="font-medium">{expense.category}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{expense.count}</TableCell>
                    <TableCell>{formatPercentage(expense.percentage)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="space-y-4">
            {filteredExpensesByProperty.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No hay gastos por propiedad que mostrar
              </div>
            ) : (
              filteredExpensesByProperty.map((item) => (
                <div key={item.propertyId} className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-medium">{item.propertyName}</h4>
                    <span className="text-sm font-semibold">
                      Total: {formatCurrency(item.totalExpenses)}
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Importe</TableHead>
                        <TableHead>Porcentaje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.categories.map((category) => (
                        <TableRow key={category.category}>
                          <TableCell>{category.category}</TableCell>
                          <TableCell>{formatCurrency(category.amount)}</TableCell>
                          <TableCell>{formatPercentage(category.percentage)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


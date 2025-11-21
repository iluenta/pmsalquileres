"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import type { CreateExpenseItemData } from "@/types/movements"
import type { ServiceProviderServiceWithDetails } from "@/types/service-providers"
import type { ConfigurationValue } from "@/lib/api/configuration"
import { calculateExpenseItemTotal } from "@/lib/api/movements"

interface ExpenseItem extends CreateExpenseItemData {
  id?: string
  tempId?: string // Para items nuevos que aún no tienen ID
}

interface ExpenseItemsManagerProps {
  items: ExpenseItem[]
  providerServices: ServiceProviderServiceWithDetails[]
  taxTypes: ConfigurationValue[]
  onItemsChange: (items: ExpenseItem[]) => void
  errors?: Record<string, string>
}

export function ExpenseItemsManager({
  items,
  providerServices,
  taxTypes,
  onItemsChange,
  errors,
}: ExpenseItemsManagerProps) {
  const [localItems, setLocalItems] = useState<ExpenseItem[]>(items)

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const addItem = () => {
    const newItem: ExpenseItem = {
      service_provider_service_id: null,
      service_name: "",
      amount: 0,
      tax_type_id: null,
      tax_amount: 0,
      total_amount: 0,
      notes: null,
      tempId: `temp-${Date.now()}`,
    }
    const updated = [...localItems, newItem]
    setLocalItems(updated)
    onItemsChange(updated)
  }

  const removeItem = (index: number) => {
    if (localItems.length <= 1) {
      return // No permitir eliminar el último item
    }
    const updated = localItems.filter((_, i) => i !== index)
    setLocalItems(updated)
    onItemsChange(updated)
  }

  const updateItem = (index: number, field: keyof ExpenseItem, value: any) => {
    const updated = [...localItems]
    const item = updated[index]

    if (field === "service_provider_service_id") {
      // Cuando se selecciona un servicio, pre-llenar datos
      const selectedService = providerServices.find((s) => s.id === value)
      if (selectedService) {
        item.service_provider_service_id = value
        item.service_name = selectedService.service_type?.label || ""
        item.amount = selectedService.price_type === "fixed" ? selectedService.price : 0
        item.tax_type_id = selectedService.apply_tax && selectedService.tax_type_id
          ? selectedService.tax_type_id
          : null

        // Calcular impuesto si aplica
        if (selectedService.apply_tax && selectedService.tax_type) {
          const taxPercentage = parseFloat(selectedService.tax_type.description || "0")
          item.tax_amount = (item.amount * taxPercentage) / 100
          item.total_amount = item.amount + item.tax_amount
        } else {
          item.tax_amount = 0
          item.total_amount = item.amount
        }
      } else {
        item.service_provider_service_id = value || null
      }
    } else if (field === "amount") {
      item.amount = parseFloat(value) || 0
      // Recalcular impuesto y total
      if (item.tax_type_id) {
        const taxType = taxTypes.find((t) => t.id === item.tax_type_id)
        if (taxType) {
          const taxPercentage = parseFloat(taxType.description || "0")
          item.tax_amount = (item.amount * taxPercentage) / 100
          item.total_amount = item.amount + item.tax_amount
        }
      } else {
        item.tax_amount = 0
        item.total_amount = item.amount
      }
    } else if (field === "tax_type_id") {
      item.tax_type_id = value || null
      // Recalcular impuesto y total
      if (value) {
        const taxType = taxTypes.find((t) => t.id === value)
        if (taxType) {
          const taxPercentage = parseFloat(taxType.description || "0")
          item.tax_amount = (item.amount * taxPercentage) / 100
          item.total_amount = item.amount + item.tax_amount
        }
      } else {
        item.tax_amount = 0
        item.total_amount = item.amount
      }
    } else if (field === "tax_amount") {
      item.tax_amount = parseFloat(value) || 0
      item.total_amount = item.amount + item.tax_amount
    } else if (field === "total_amount") {
      item.total_amount = parseFloat(value) || 0
      // Si se modifica el total, ajustar el tax_amount
      item.tax_amount = item.total_amount - item.amount
    } else {
      ;(item as any)[field] = value
    }

    updated[index] = item
    setLocalItems(updated)
    onItemsChange(updated)
  }

  const calculateTotal = () => {
    return localItems.reduce((sum, item) => sum + (item.total_amount || 0), 0)
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Servicios del Gasto</h2>
        <Button
          type="button"
          onClick={addItem}
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Servicio
        </Button>
      </div>
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b">
                <th className="text-left py-3 px-4 font-medium">Servicio</th>
                <th className="text-left py-3 px-4 font-medium">Nombre</th>
                <th className="text-left py-3 px-4 font-medium">Importe Base</th>
                <th className="text-left py-3 px-4 font-medium">Tipo Impuesto</th>
                <th className="text-right py-3 px-4 font-medium">Impuesto</th>
                <th className="text-right py-3 px-4 font-medium">Total</th>
                <th className="w-10 py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {localItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No hay servicios añadidos. Haz clic en "Añadir Servicio" para comenzar.
                  </td>
                </tr>
              ) : (
                localItems.map((item, index) => (
                  <tr key={item.id || item.tempId || index} className="border-b last:border-b-0">
                    <td className="py-2 px-4">
                      <div className="relative">
                        <Select
                          value={item.service_provider_service_id || "none"}
                          onValueChange={(value) =>
                            updateItem(
                              index,
                              "service_provider_service_id",
                              value === "none" ? null : value
                            )
                          }
                        >
                          <SelectTrigger className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                            <SelectValue placeholder="Seleccionar servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin servicio específico</SelectItem>
                            {providerServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.service_type?.label || "N/A"} -{" "}
                                {service.price_type === "fixed"
                                  ? `${service.price.toFixed(2)} €`
                                  : `${service.price.toFixed(2)}%`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        value={item.service_name || ""}
                        onChange={(e) =>
                          updateItem(index, "service_name", e.target.value)
                        }
                        placeholder="Nombre del servicio"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.amount || 0}
                        onChange={(e) =>
                          updateItem(index, "amount", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <div className="relative">
                        <Select
                          value={item.tax_type_id || "none"}
                          onValueChange={(value) =>
                            updateItem(
                              index,
                              "tax_type_id",
                              value === "none" ? null : value
                            )
                          }
                        >
                          <SelectTrigger className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                            <SelectValue placeholder="Sin impuesto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin impuesto</SelectItem>
                            {taxTypes.map((tax) => (
                              <SelectItem key={tax.id} value={tax.id}>
                                {tax.label} ({tax.description}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.tax_amount?.toFixed(2) || "0.00"}
                        onChange={(e) =>
                          updateItem(index, "tax_amount", e.target.value)
                        }
                        placeholder="0.00"
                        readOnly
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring text-right"
                      />
                    </td>
                    <td className="py-2 px-4 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.total_amount?.toFixed(2) || "0.00"}
                        onChange={(e) =>
                          updateItem(index, "total_amount", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring text-right font-semibold"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={localItems.length <= 1}
                        className="text-destructive hover:text-destructive/80 focus:outline-none h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar servicio</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Total */}
      {localItems.length > 0 && (
        <div className="flex justify-end items-center space-x-2 mt-4">
          <span className="font-medium">Total del Movimiento:</span>
          <span className="text-xl font-bold">{calculateTotal().toFixed(2)} €</span>
        </div>
      )}
      {errors?.expense_items && (
        <p className="text-sm text-red-500">{errors.expense_items}</p>
      )}
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type {
  Movement,
  CreateMovementData,
  UpdateMovementData,
} from "@/types/movements"
import type { ConfigurationValue } from "@/lib/api/configuration"
import type { BookingWithDetails } from "@/types/bookings"
import type { ServiceProviderWithDetails } from "@/types/service-providers"
import type { TreasuryAccount } from "@/types/treasury-accounts"
import { ServiceProviderSelector } from "./ServiceProviderSelector"
import { ExpenseItemsManager } from "./ExpenseItemsManager"
import type { CreateExpenseItemData } from "@/types/movements"

interface MovementFormProps {
  movement?: Movement
  tenantId: string
  onSave?: () => void
  defaultBookingId?: string // Para pre-llenar desde BookingPaymentsManager
  defaultMovementType?: "income" | "expense" // Para pre-llenar desde BookingPaymentsManager
}

export function MovementForm({
  movement,
  tenantId,
  onSave,
  defaultBookingId,
  defaultMovementType,
}: MovementFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Datos de configuración
  const [movementTypes, setMovementTypes] = useState<ConfigurationValue[]>([])
  const [paymentMethods, setPaymentMethods] = useState<ConfigurationValue[]>([])
  const [movementStatuses, setMovementStatuses] = useState<ConfigurationValue[]>([])
  const [taxTypes, setTaxTypes] = useState<ConfigurationValue[]>([])
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccount[]>([])
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [selectedProvider, setSelectedProvider] = useState<ServiceProviderWithDetails | null>(null)
  const [providerServices, setProviderServices] = useState<any[]>([])
  const [expenseItems, setExpenseItems] = useState<(CreateExpenseItemData & { id?: string; tempId?: string })[]>([])

  const [formData, setFormData] = useState({
    movement_type_id: "",
    booking_id: "",
    service_provider_id: "",
    service_provider_service_id: "",
    treasury_account_id: "",
    payment_method_id: "",
    movement_status_id: "",
    amount: "",
    invoice_number: "",
    reference: "",
    movement_date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (movement) {
      setFormData({
        movement_type_id: movement.movement_type_id,
        booking_id: movement.booking_id || "",
        service_provider_id: movement.service_provider_id || "",
        service_provider_service_id: movement.service_provider_service_id || "",
        treasury_account_id: movement.treasury_account_id,
        payment_method_id: movement.payment_method_id,
        movement_status_id: movement.movement_status_id,
        amount: movement.amount.toString(),
        invoice_number: movement.invoice_number || "",
        reference: movement.reference || "",
        movement_date: movement.movement_date.split("T")[0],
        notes: movement.notes || "",
      })
      
      // Cargar expense items si es un gasto y tiene items
      if ((movement as any).expense_items && (movement as any).expense_items.length > 0) {
        setExpenseItems((movement as any).expense_items.map((item: any) => ({
          id: item.id,
          service_provider_service_id: item.service_provider_service_id,
          service_name: item.service_name,
          amount: item.amount,
          tax_type_id: item.tax_type_id,
          tax_amount: item.tax_amount,
          total_amount: item.total_amount,
          notes: item.notes,
        })))
      }
    }
  }, [movement])

  // Cargar reservas cuando se detecta que es un gasto
  useEffect(() => {
    if (movement && movementTypes.length > 0) {
      const selectedType = movementTypes.find((t) => t.id === movement.movement_type_id)
      const isIncome = selectedType?.value === "income" || selectedType?.label === "Ingreso"
      if (!isIncome && movement.service_provider_id) {
        // Si es un gasto, cargar todas las reservas para el selector opcional
        loadAllBookings()
      }
    }
  }, [movement, movementTypes])

  useEffect(() => {
    // Pre-llenar desde props (desde BookingPaymentsManager) - solo si no hay movement y ya se cargaron los tipos
    if (!movement && movementTypes.length > 0 && (defaultBookingId || defaultMovementType)) {
      const incomeType = movementTypes.find(
        (t) => t.value === "income" || t.label === "Ingreso"
      )
      if (defaultMovementType === "income" && incomeType) {
        setFormData((prev) => ({
          ...prev,
          movement_type_id: incomeType.id,
          booking_id: defaultBookingId || "",
        }))
        if (defaultBookingId) {
          loadUnpaidBookings()
        }
      }
    }
  }, [defaultBookingId, defaultMovementType, movementTypes, movement])

  useEffect(() => {
    if (formData.movement_type_id) {
      const selectedType = movementTypes.find((t) => t.id === formData.movement_type_id)
      const isIncome = selectedType?.value === "income" || selectedType?.label === "Ingreso"

      if (isIncome) {
        // Si es ingreso, limpiar proveedor
        setFormData((prev) => ({
          ...prev,
          service_provider_id: "",
          service_provider_service_id: "",
        }))
        loadUnpaidBookings()
      } else {
        // Si es gasto, cargar todas las reservas (no solo las no pagadas) para el selector opcional
        loadAllBookings()
      }
    }
  }, [formData.movement_type_id])

  useEffect(() => {
    if (formData.service_provider_id) {
      loadProviderServices(formData.service_provider_id)
      loadProvider(formData.service_provider_id)
    } else {
      setProviderServices([])
      setSelectedProvider(null)
    }
  }, [formData.service_provider_id])

  const loadInitialData = async () => {
    setLoadingData(true)
    try {
      const [
        movementTypesRes,
        paymentMethodsRes,
        movementStatusesRes,
        taxTypesRes,
        treasuryAccountsRes,
      ] = await Promise.all([
        fetch("/api/configuration/movement-types"),
        fetch("/api/configuration/payment-methods"),
        fetch("/api/configuration/movement-statuses"),
        fetch("/api/configuration/tax-types"),
        fetch("/api/treasury-accounts"),
      ])

      if (movementTypesRes.ok) {
        setMovementTypes(await movementTypesRes.json())
      }
      if (paymentMethodsRes.ok) {
        setPaymentMethods(await paymentMethodsRes.json())
      }
      if (movementStatusesRes.ok) {
        setMovementStatuses(await movementStatusesRes.json())
      }
      if (taxTypesRes.ok) {
        setTaxTypes(await taxTypesRes.json())
      }
      if (treasuryAccountsRes.ok) {
        const accounts = await treasuryAccountsRes.json()
        setTreasuryAccounts(accounts.filter((a: TreasuryAccount) => a.is_active))
      }
    } catch (error) {
      console.error("Error loading initial data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const loadUnpaidBookings = async () => {
    try {
      const response = await fetch("/api/bookings/unpaid")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error loading unpaid bookings:", error)
    }
  }

  const loadAllBookings = async () => {
    try {
      const response = await fetch("/api/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error loading bookings:", error)
    }
  }

  const loadProvider = async (providerId: string) => {
    try {
      const response = await fetch(`/api/service-providers/${providerId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedProvider(data)
      }
    } catch (error) {
      console.error("Error loading provider:", error)
    }
  }

  const loadProviderServices = async (providerId: string) => {
    try {
      const response = await fetch(`/api/service-providers/${providerId}/services`)
      if (response.ok) {
        const data = await response.json()
        setProviderServices(data.filter((s: any) => s.is_active))
      }
    } catch (error) {
      console.error("Error loading provider services:", error)
    }
  }

  const selectedMovementType = movementTypes.find(
    (t) => t.id === formData.movement_type_id
  )
  const isIncome =
    selectedMovementType?.value === "income" ||
    selectedMovementType?.label === "Ingreso"

  const selectedBooking = bookings.find((b) => b.id === formData.booking_id)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.movement_type_id) {
      newErrors.movement_type_id = "El tipo de movimiento es obligatorio"
    }

    if (isIncome) {
      if (!formData.booking_id) {
        newErrors.booking_id = "Debe seleccionar una reserva para ingresos"
      } else if (selectedBooking) {
        const amount = parseFloat(formData.amount) || 0
        if (amount > selectedBooking.pending_amount) {
          newErrors.amount = `El importe no puede exceder el pendiente (${selectedBooking.pending_amount.toFixed(2)} €)`
        }
      }
    } else {
      if (!formData.service_provider_id) {
        newErrors.service_provider_id = "Debe seleccionar un proveedor para gastos"
      }
      if (expenseItems.length === 0) {
        newErrors.expense_items = "Los gastos deben tener al menos un servicio asociado"
      }
      // Validar cada item
      expenseItems.forEach((item, index) => {
        if (!item.service_name || item.service_name.trim() === "") {
          newErrors[`expense_item_${index}_service_name`] = "El nombre del servicio es obligatorio"
        }
        if (!item.amount || item.amount <= 0) {
          newErrors[`expense_item_${index}_amount`] = "El importe debe ser mayor que 0"
        }
      })
    }

    if (!formData.treasury_account_id) {
      newErrors.treasury_account_id = "La cuenta de tesorería es obligatoria"
    }

    if (!formData.payment_method_id) {
      newErrors.payment_method_id = "El método de pago es obligatorio"
    }

    if (!formData.movement_status_id) {
      newErrors.movement_status_id = "El estado del movimiento es obligatorio"
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "El importe debe ser mayor que 0"
    }
    
    // Para gastos, validar que el amount sea >= suma de items (pero permitir ajustes)
    if (!isIncome && expenseItems.length > 0) {
      const itemsTotal = expenseItems.reduce((sum, item) => sum + (item.total_amount || 0), 0)
      const movementAmount = parseFloat(formData.amount) || 0
      // Permitir que el amount sea mayor o igual a la suma de items (para ajustes)
      // Pero advertir si es menor
      if (movementAmount < itemsTotal) {
        newErrors.amount = `El importe total (${movementAmount.toFixed(2)} €) es menor que la suma de servicios (${itemsTotal.toFixed(2)} €)`
      }
    }

    if (!formData.movement_date) {
      newErrors.movement_date = "La fecha del movimiento es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Para gastos, usar el amount del formulario (que puede haber sido ajustado manualmente)
      // Si no hay expense items, usar el amount del formulario directamente
      let finalAmount = parseFloat(formData.amount)
      // El amount ya se actualiza automáticamente desde ExpenseItemsManager cuando cambian los items
      // pero el usuario puede modificarlo manualmente, así que usamos el valor del formulario
      
      // Preparar expense_items según si es creación o actualización
      const expenseItemsData = !isIncome && expenseItems.length > 0
        ? expenseItems.map(item => {
            // Para updates, incluir id si existe
            if (movement && item.id) {
              return {
                service_provider_service_id: item.service_provider_service_id || null,
                service_name: item.service_name,
                amount: item.amount,
                tax_type_id: item.tax_type_id || null,
                tax_amount: item.tax_amount ?? 0,
                total_amount: item.total_amount ?? 0,
                notes: item.notes || null,
                id: item.id,
              } as CreateExpenseItemData & { id: string }
            }
            // Para creates, no incluir id
            return {
              service_provider_service_id: item.service_provider_service_id || null,
              service_name: item.service_name,
              amount: item.amount,
              tax_type_id: item.tax_type_id || null,
              tax_amount: item.tax_amount ?? 0,
              total_amount: item.total_amount ?? 0,
              notes: item.notes || null,
            } as CreateExpenseItemData
          })
        : undefined
      
      const baseData = {
        movement_type_id: formData.movement_type_id,
        booking_id: isIncome ? formData.booking_id || null : (formData.booking_id || null),
        service_provider_id: !isIncome ? formData.service_provider_id || null : null,
        service_provider_service_id:
          !isIncome && formData.service_provider_service_id
            ? formData.service_provider_service_id
            : null,
        treasury_account_id: formData.treasury_account_id,
        payment_method_id: formData.payment_method_id,
        movement_status_id: formData.movement_status_id,
        amount: finalAmount,
        invoice_number: formData.invoice_number.trim() || null,
        reference: formData.reference.trim() || null,
        movement_date: formData.movement_date,
        notes: formData.notes.trim() || null,
        expense_items: expenseItemsData,
      }
      
      const data: CreateMovementData | UpdateMovementData = movement
        ? { ...baseData } as UpdateMovementData
        : { ...baseData } as CreateMovementData

      const url = movement
        ? `/api/movements/${movement.id}`
        : "/api/movements"
      const method = movement ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error al ${movement ? "actualizar" : "crear"} el movimiento`)
      }

      toast({
        title: movement ? "Movimiento actualizado" : "Movimiento creado",
        description: `El movimiento ha sido ${movement ? "actualizado" : "creado"} correctamente`,
      })

      if (onSave) {
        onSave()
      } else {
        router.push("/dashboard/movements")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el movimiento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    )
  }

  const selectedTreasuryAccount = treasuryAccounts.find(
    (a) => a.id === formData.treasury_account_id
  )
  const selectedPaymentMethod = paymentMethods.find(
    (m) => m.id === formData.payment_method_id
  )
  const selectedStatus = movementStatuses.find(
    (s) => s.id === formData.movement_status_id
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1.5 hover:bg-muted rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {movement ? "Editar Movimiento" : "Nuevo Movimiento"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Registra un nuevo movimiento financiero (ingreso o gasto)
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-0">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Información General */}
            <Card className="p-5 md:p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Información General
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type of Movement */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="movement_type_id" className="text-sm font-medium text-foreground">
                    Tipo de Movimiento <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.movement_type_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, movement_type_id: value })
                    }
                  >
                    <SelectTrigger id="movement_type_id" className="bg-background">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {movementTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.movement_type_id && (
                    <p className="text-sm text-destructive">{errors.movement_type_id}</p>
                  )}
                </div>

                {/* Reserve */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="booking_id" className="text-sm font-medium text-foreground">
                    Reserva {isIncome && <span className="text-destructive">*</span>}
                    {!isIncome && (
                      <span className="text-muted-foreground text-xs ml-1">(Opcional)</span>
                    )}
                  </Label>
                  <Select
                    value={isIncome ? formData.booking_id : (formData.booking_id || "none")}
                    onValueChange={(value) => {
                      if (isIncome) {
                        setFormData({ ...formData, booking_id: value })
                        loadUnpaidBookings()
                      } else {
                        setFormData({ ...formData, booking_id: value === "none" ? "" : value })
                        if (value !== "none") {
                          loadUnpaidBookings()
                        }
                      }
                    }}
                  >
                    <SelectTrigger id="booking_id" className="w-full bg-background">
                      <SelectValue 
                        placeholder={isIncome ? "Seleccionar reserva" : "Sin reserva asociada"} 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {!isIncome && <SelectItem value="none">Sin reserva asociada</SelectItem>}
                      {bookings.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          {booking.booking_code} - {booking.property?.name}
                          {isIncome && booking.person && ` - ${booking.person.first_name} ${booking.person.last_name}`}
                          {isIncome && ` (Pendiente: ${booking.pending_amount.toFixed(2)} €)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.booking_id && (
                    <p className="text-sm text-destructive mt-1">{errors.booking_id}</p>
                  )}
                  {!isIncome && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Opcional: asociar este gasto a una reserva específica
                    </p>
                  )}
                  {isIncome && selectedBooking && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Importe pendiente: {selectedBooking.pending_amount.toFixed(2)} €
                    </p>
                  )}
                </div>

                {/* Service Provider - Only for Gasto */}
                {!isIncome && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="service_provider_id" className="text-sm font-medium text-foreground">
                      Proveedor de Servicios <span className="text-destructive">*</span>
                    </Label>
                    <ServiceProviderSelector
                      value={formData.service_provider_id || undefined}
                      onValueChange={(value) => {
                        setFormData({ ...formData, service_provider_id: value, service_provider_service_id: "" })
                        // Limpiar items al cambiar proveedor y crear uno vacío para empezar
                        setExpenseItems([{
                          service_provider_service_id: null,
                          service_name: "",
                          amount: 0,
                          tax_type_id: null,
                          tax_amount: 0,
                          total_amount: 0,
                          notes: null,
                        }])
                      }}
                      tenantId={tenantId}
                    />
                    {errors.service_provider_id && (
                      <p className="text-sm text-destructive">{errors.service_provider_id}</p>
                    )}
                  </div>
                )}

                {/* Treasury Account */}
                <div className="space-y-2">
                  <Label htmlFor="treasury_account_id" className="text-sm font-medium text-foreground">
                    Cuenta de Tesorería <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.treasury_account_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, treasury_account_id: value })
                    }
                  >
                    <SelectTrigger id="treasury_account_id" className="bg-background">
                      <SelectValue placeholder="Seleccionar cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      {treasuryAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                          {account.account_number && ` - ${account.account_number}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.treasury_account_id && (
                    <p className="text-sm text-destructive">{errors.treasury_account_id}</p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="payment_method_id" className="text-sm font-medium text-foreground">
                    Método de Pago <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.payment_method_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, payment_method_id: value })
                    }
                  >
                    <SelectTrigger id="payment_method_id" className="bg-background">
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.payment_method_id && (
                    <p className="text-sm text-destructive">{errors.payment_method_id}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Section 2: Detalles del Movimiento */}
            <Card className="p-5 md:p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Detalles del Movimiento
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Amount - Only for Ingreso */}
                {isIncome && (
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                      Importe <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        className="bg-background rounded-r-none"
                      />
                      <span className="px-4 py-2 bg-muted border border-l-0 border-input rounded-r-md text-muted-foreground font-medium">
                        €
                      </span>
                    </div>
                    {errors.amount && (
                      <p className="text-sm text-destructive">{errors.amount}</p>
                    )}
                    {selectedBooking && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Máximo permitido: {selectedBooking.pending_amount.toFixed(2)} €
                      </p>
                    )}
                  </div>
                )}

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="movement_date" className="text-sm font-medium text-foreground">
                    Fecha del Movimiento <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="movement_date"
                      type="date"
                      value={formData.movement_date}
                      onChange={(e) =>
                        setFormData({ ...formData, movement_date: e.target.value })
                      }
                      className="bg-background pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {errors.movement_date && (
                    <p className="text-sm text-destructive">{errors.movement_date}</p>
                  )}
                </div>

                {/* Invoice Number */}
                <div className="space-y-2">
                  <Label htmlFor="invoice_number" className="text-sm font-medium text-foreground">
                    Número de Factura/Recibo
                  </Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) =>
                      setFormData({ ...formData, invoice_number: e.target.value })
                    }
                    placeholder="Ej: FACT-2024-001"
                    className="bg-background"
                  />
                </div>

                {/* Reference */}
                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-sm font-medium text-foreground">
                    Referencia
                  </Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData({ ...formData, reference: e.target.value })
                    }
                    placeholder="Referencia adicional del movimiento"
                    className="bg-background"
                  />
                </div>

                {/* Total Amount - Only for Gasto */}
                {!isIncome && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                      Total del Movimiento <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        className="bg-background rounded-r-none font-semibold"
                      />
                      <span className="px-4 py-2 bg-muted border border-l-0 border-input rounded-r-md text-muted-foreground font-medium">
                        €
                      </span>
                    </div>
                    {errors.amount && (
                      <p className="text-sm text-destructive">{errors.amount}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Este importe se calcula automáticamente desde los servicios
                      añadidos, pero puedes ajustarlo manualmente si es necesario.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Section 3: Servicios del Gasto - Only for Gasto */}
            {!isIncome && formData.service_provider_id && (
              <Card className="p-5 md:p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Servicios del Gasto
                </h2>
                <ExpenseItemsManager
                  items={expenseItems}
                  providerServices={providerServices}
                  taxTypes={taxTypes}
                  onItemsChange={(items) => {
                    setExpenseItems(items)
                    // Actualizar amount total
                    const total = items.reduce((sum, item) => sum + (item.total_amount || 0), 0)
                    setFormData((prev) => ({ ...prev, amount: total.toFixed(2) }))
                  }}
                  errors={errors}
                />
              </Card>
            )}
          </div>

          {/* Right Column - Status & Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Section 4: Estado y Notas */}
            <Card className="p-5 md:p-6 border-0 shadow-sm hover:shadow-md transition-shadow sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  4
                </span>
                Estado y Notas
              </h2>

              <div className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="movement_status_id" className="text-sm font-medium text-foreground">
                    Estado del Movimiento <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.movement_status_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, movement_status_id: value })
                    }
                  >
                    <SelectTrigger id="movement_status_id" className="bg-background">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {movementStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.movement_status_id && (
                    <p className="text-sm text-destructive">{errors.movement_status_id}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                    Notas Adicionales
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Añade notas adicionales sobre el movimiento..."
                    className="bg-background resize-none h-40 md:h-56"
                  />
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20 mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Resumen del Movimiento</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="font-semibold text-foreground">
                        {selectedMovementType?.label || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Importe:</span>
                      <span className="font-semibold text-foreground">
                        {formData.amount ? `${parseFloat(formData.amount).toFixed(2)} €` : "0.00 €"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fecha:</span>
                      <span className="font-semibold text-foreground">
                        {formData.movement_date ? new Date(formData.movement_date).toLocaleDateString('es-ES') : "N/A"}
                      </span>
                    </div>
                    {selectedStatus && (
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <span className="font-semibold text-foreground">
                          {selectedStatus.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t border-border mt-8 lg:col-span-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="px-6">
            {loading
              ? movement
                ? "Actualizando..."
                : "Creando..."
              : movement
              ? "Actualizar Movimiento"
              : "Crear Movimiento"}
          </Button>
        </div>
      </form>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccount[]>([])
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [selectedProvider, setSelectedProvider] = useState<ServiceProviderWithDetails | null>(null)
  const [providerServices, setProviderServices] = useState<any[]>([])

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
    }
  }, [movement])

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
        // Si es gasto, limpiar reserva
        setFormData((prev) => ({
          ...prev,
          booking_id: "",
        }))
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
        treasuryAccountsRes,
      ] = await Promise.all([
        fetch("/api/configuration/movement-types"),
        fetch("/api/configuration/payment-methods"),
        fetch("/api/configuration/movement-statuses"),
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
      const data: CreateMovementData | UpdateMovementData = {
        movement_type_id: formData.movement_type_id,
        booking_id: isIncome ? formData.booking_id || null : null,
        service_provider_id: !isIncome ? formData.service_provider_id || null : null,
        service_provider_service_id:
          !isIncome && formData.service_provider_service_id
            ? formData.service_provider_service_id
            : null,
        treasury_account_id: formData.treasury_account_id,
        payment_method_id: formData.payment_method_id,
        movement_status_id: formData.movement_status_id,
        amount: parseFloat(formData.amount),
        invoice_number: formData.invoice_number.trim() || null,
        reference: formData.reference.trim() || null,
        movement_date: formData.movement_date,
        notes: formData.notes.trim() || null,
      }

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="movement_type_id">
          Tipo de Movimiento <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.movement_type_id}
          onValueChange={(value) =>
            setFormData({ ...formData, movement_type_id: value })
          }
        >
          <SelectTrigger id="movement_type_id">
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
          <p className="text-sm text-red-500">{errors.movement_type_id}</p>
        )}
      </div>

      {isIncome ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="booking_id">
              Reserva <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.booking_id}
              onValueChange={(value) => {
                setFormData({ ...formData, booking_id: value })
                loadUnpaidBookings()
              }}
            >
              <SelectTrigger id="booking_id">
                <SelectValue placeholder="Seleccionar reserva" />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>
                    {booking.booking_code} - {booking.property?.name} -{" "}
                    {booking.person
                      ? `${booking.person.first_name} ${booking.person.last_name}`
                      : "Sin huésped"}{" "}
                    (Pendiente: {booking.pending_amount.toFixed(2)} €)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.booking_id && (
              <p className="text-sm text-red-500">{errors.booking_id}</p>
            )}
            {selectedBooking && (
              <p className="text-sm text-muted-foreground">
                Importe pendiente: {selectedBooking.pending_amount.toFixed(2)} €
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="service_provider_id">
              Proveedor de Servicios <span className="text-red-500">*</span>
            </Label>
            <ServiceProviderSelector
              value={formData.service_provider_id}
              onValueChange={(value) =>
                setFormData({ ...formData, service_provider_id: value, service_provider_service_id: "" })
              }
              tenantId={tenantId}
            />
            {errors.service_provider_id && (
              <p className="text-sm text-red-500">{errors.service_provider_id}</p>
            )}
          </div>

          {formData.service_provider_id && providerServices.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="service_provider_service_id">Servicio (Opcional)</Label>
              <Select
                value={formData.service_provider_service_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_provider_service_id: value === "none" ? "" : value })
                }
              >
                <SelectTrigger id="service_provider_service_id">
                  <SelectValue placeholder="Seleccionar servicio (opcional)" />
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
          )}

          <div className="space-y-2">
            <Label htmlFor="booking_id">Reserva (Opcional)</Label>
            <Select
              value={formData.booking_id || "none"}
              onValueChange={(value) =>
                setFormData({ ...formData, booking_id: value === "none" ? "" : value })
              }
            >
              <SelectTrigger id="booking_id">
                <SelectValue placeholder="Seleccionar reserva (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin reserva asociada</SelectItem>
                {bookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>
                    {booking.booking_code} - {booking.property?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Opcional: asociar este gasto a una reserva específica
            </p>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="treasury_account_id">
          Cuenta de Tesorería <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.treasury_account_id}
          onValueChange={(value) =>
            setFormData({ ...formData, treasury_account_id: value })
          }
        >
          <SelectTrigger id="treasury_account_id">
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
          <p className="text-sm text-red-500">{errors.treasury_account_id}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_method_id">
          Método de Pago <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.payment_method_id}
          onValueChange={(value) =>
            setFormData({ ...formData, payment_method_id: value })
          }
        >
          <SelectTrigger id="payment_method_id">
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
          <p className="text-sm text-red-500">{errors.payment_method_id}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="movement_status_id">
          Estado <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.movement_status_id}
          onValueChange={(value) =>
            setFormData({ ...formData, movement_status_id: value })
          }
        >
          <SelectTrigger id="movement_status_id">
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
          <p className="text-sm text-red-500">{errors.movement_status_id}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">
          Importe <span className="text-red-500">*</span>
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount}</p>
        )}
        {isIncome && selectedBooking && (
          <p className="text-xs text-muted-foreground">
            Máximo permitido: {selectedBooking.pending_amount.toFixed(2)} €
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="movement_date">
          Fecha del Movimiento <span className="text-red-500">*</span>
        </Label>
        <Input
          id="movement_date"
          type="date"
          value={formData.movement_date}
          onChange={(e) =>
            setFormData({ ...formData, movement_date: e.target.value })
          }
        />
        {errors.movement_date && (
          <p className="text-sm text-red-500">{errors.movement_date}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="invoice_number">Número de Factura/Recibo</Label>
        <Input
          id="invoice_number"
          value={formData.invoice_number}
          onChange={(e) =>
            setFormData({ ...formData, invoice_number: e.target.value })
          }
          placeholder="Ej: FACT-2024-001"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Referencia</Label>
        <Input
          id="reference"
          value={formData.reference}
          onChange={(e) =>
            setFormData({ ...formData, reference: e.target.value })
          }
          placeholder="Referencia adicional del movimiento"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notas adicionales sobre el movimiento"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? movement
              ? "Actualizando..."
              : "Creando..."
            : movement
            ? "Actualizar"
            : "Crear"}
        </Button>
      </div>
    </form>
  )
}


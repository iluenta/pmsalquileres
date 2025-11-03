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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { PersonSearch } from "./PersonSearch"
import { Loader2, Save } from "lucide-react"
import type { Booking, Person, CreateBookingData, UpdateBookingData } from "@/types/bookings"
import type { Property } from "@/lib/api/properties"
import type { ConfigurationValue } from "@/lib/api/configuration"

interface BookingFormProps {
  booking?: Booking
  properties: Property[]
  bookingStatuses: ConfigurationValue[]
  tenantId: string
  onSave?: (data: CreateBookingData | UpdateBookingData) => Promise<boolean>
}

export function BookingForm({
  booking,
  properties,
  bookingStatuses,
  tenantId,
  onSave,
}: BookingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(
    booking?.person ? {
      id: booking.person.id,
      tenant_id: tenantId,
      first_name: booking.person.first_name,
      last_name: booking.person.last_name,
      email: booking.person.email || null,
      phone: booking.person.phone || null,
      person_category: "guest",
      notes: null,
      created_at: "",
      updated_at: "",
    } : null
  )

  const [formData, setFormData] = useState({
    property_id: booking?.property_id || "",
    check_in_date: booking?.check_in_date || "",
    check_out_date: booking?.check_out_date || "",
    number_of_guests: booking?.number_of_guests || 1,
    total_amount: booking?.total_amount || 0,
    paid_amount: booking?.paid_amount || 0,
    booking_status_id: booking?.booking_status_id || "",
    notes: booking?.notes || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedPerson) {
      newErrors.person = "Debe seleccionar un huésped"
    }

    if (!formData.property_id) {
      newErrors.property_id = "Debe seleccionar una propiedad"
    }

    if (!formData.check_in_date) {
      newErrors.check_in_date = "La fecha de entrada es obligatoria"
    }

    if (!formData.check_out_date) {
      newErrors.check_out_date = "La fecha de salida es obligatoria"
    }

    if (formData.check_in_date && formData.check_out_date) {
      if (new Date(formData.check_out_date) <= new Date(formData.check_in_date)) {
        newErrors.check_out_date = "La fecha de salida debe ser posterior a la fecha de entrada"
      }
    }

    if (formData.number_of_guests < 1) {
      newErrors.number_of_guests = "El número de huéspedes debe ser al menos 1"
    }

    if (formData.total_amount < 0) {
      newErrors.total_amount = "El importe total no puede ser negativo"
    }

    if (formData.paid_amount < 0) {
      newErrors.paid_amount = "El importe pagado no puede ser negativo"
    }

    if (formData.paid_amount > formData.total_amount) {
      newErrors.paid_amount = "El importe pagado no puede ser mayor al total"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateNights = (): number => {
    if (!formData.check_in_date || !formData.check_out_date) return 0
    const checkIn = new Date(formData.check_in_date)
    const checkOut = new Date(formData.check_out_date)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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

    if (!selectedPerson) {
      return
    }

    setLoading(true)

    try {
      const bookingData = {
        ...formData,
        person_id: selectedPerson.id,
        booking_status_id: formData.booking_status_id || null,
        notes: formData.notes || null,
      }

      if (onSave) {
        const success = await onSave(bookingData)
        if (success) {
          toast({
            title: booking ? "Reserva actualizada" : "Reserva creada",
            description: `La reserva se ha ${booking ? "actualizado" : "creado"} correctamente.`,
          })
          router.push("/dashboard/bookings")
          router.refresh()
        }
      } else {
        // Fallback: usar API directamente
        const response = await fetch(booking ? `/api/bookings/${booking.id}` : "/api/bookings", {
          method: booking ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Error al guardar la reserva")
        }

        toast({
          title: booking ? "Reserva actualizada" : "Reserva creada",
          description: `La reserva se ha ${booking ? "actualizado" : "creado"} correctamente.`,
        })
        router.push("/dashboard/bookings")
        router.refresh()
      }
    } catch (error: any) {
      console.error("Error saving booking:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la reserva",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const nights = calculateNights()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos del Huésped</CardTitle>
          <CardDescription>Seleccione o cree un nuevo huésped</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PersonSearch
            tenantId={tenantId}
            value={selectedPerson}
            onSelect={setSelectedPerson}
            required
          />
          {errors.person && (
            <p className="text-sm text-red-500">{errors.person}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Reserva</CardTitle>
          <CardDescription>Información básica de la reserva</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property_id">
              Propiedad <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.property_id}
              onValueChange={(value) =>
                setFormData({ ...formData, property_id: value })
              }
            >
              <SelectTrigger id="property_id">
                <SelectValue placeholder="Seleccione una propiedad" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.property_code} - {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.property_id && (
              <p className="text-sm text-red-500">{errors.property_id}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check_in_date">
                Fecha de Entrada <span className="text-red-500">*</span>
              </Label>
              <Input
                id="check_in_date"
                type="date"
                value={formData.check_in_date}
                onChange={(e) =>
                  setFormData({ ...formData, check_in_date: e.target.value })
                }
              />
              {errors.check_in_date && (
                <p className="text-sm text-red-500">{errors.check_in_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_out_date">
                Fecha de Salida <span className="text-red-500">*</span>
              </Label>
              <Input
                id="check_out_date"
                type="date"
                value={formData.check_out_date}
                onChange={(e) =>
                  setFormData({ ...formData, check_out_date: e.target.value })
                }
              />
              {errors.check_out_date && (
                <p className="text-sm text-red-500">{errors.check_out_date}</p>
              )}
            </div>
          </div>

          {nights > 0 && (
            <p className="text-sm text-gray-600">
              Noches: <span className="font-medium">{nights}</span>
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number_of_guests">
                Número de Huéspedes <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number_of_guests"
                type="number"
                min="1"
                value={formData.number_of_guests}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    number_of_guests: parseInt(e.target.value) || 1,
                  })
                }
              />
              {errors.number_of_guests && (
                <p className="text-sm text-red-500">{errors.number_of_guests}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">
                Importe Total <span className="text-red-500">*</span>
              </Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
              {errors.total_amount && (
                <p className="text-sm text-red-500">{errors.total_amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_amount">Importe Pagado</Label>
              <Input
                id="paid_amount"
                type="number"
                step="0.01"
                min="0"
                max={formData.total_amount}
                value={formData.paid_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paid_amount: parseFloat(e.target.value) || 0,
                  })
                }
              />
              {errors.paid_amount && (
                <p className="text-sm text-red-500">{errors.paid_amount}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_status_id">Estado de la Reserva</Label>
            <Select
              value={formData.booking_status_id || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, booking_status_id: value || null })
              }
            >
              <SelectTrigger id="booking_status_id">
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin estado</SelectItem>
                {bookingStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre la reserva..."
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/bookings")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {booking ? "Actualizar Reserva" : "Crear Reserva"}
        </Button>
      </div>
    </form>
  )
}


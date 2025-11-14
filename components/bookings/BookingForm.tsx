"use client"

import { useState, useEffect, useRef } from "react"
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
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { PersonSearch } from "./PersonSearch"
import { Loader2, Save, CalendarIcon, ChevronLeft } from "lucide-react"
import type { Booking, BookingWithDetails, Person, CreateBookingData, UpdateBookingData } from "@/types/bookings"
import type { Property } from "@/lib/api/properties"
import type { ConfigurationValue } from "@/lib/api/configuration"
import { calculateBookingAmounts, recalculateNetAmount } from "@/lib/utils/booking-calculations"

interface BookingFormProps {
  booking?: Booking | BookingWithDetails
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
      person_type: "", // Se completa desde el API si es necesario
      first_name: booking.person.first_name,
      last_name: booking.person.last_name,
      full_name: null,
      document_type: null,
      document_number: null,
      birth_date: null,
      nationality: null,
      email: booking.person.email || null,
      phone: booking.person.phone || null,
      notes: null,
      is_active: true,
      created_at: "",
      updated_at: "",
    } : null
  )

  const [formData, setFormData] = useState({
    property_id: booking?.property_id || "",
    booking_type_id: booking?.booking_type_id || "",
    channel_id: booking?.channel_id || "",
    channel_booking_number: booking?.channel_booking_number || "",
    check_in_date: booking?.check_in_date || "",
    check_out_date: booking?.check_out_date || "",
    number_of_guests: booking?.number_of_guests || 1,
    total_amount: booking?.total_amount || 0,
    sales_commission_amount: booking?.sales_commission_amount || 0,
    collection_commission_amount: booking?.collection_commission_amount || 0,
    tax_amount: booking?.tax_amount || 0,
    net_amount: booking?.net_amount || 0,
    booking_status_id: booking?.booking_status_id || "",
    notes: booking?.notes || "",
  })
  
  const [bookingTypes, setBookingTypes] = useState<ConfigurationValue[]>([])
  const [allChannels, setAllChannels] = useState<Array<{
    id: string
    name: string
    logo_url: string | null
    sales_commission: number
    collection_commission: number
    apply_tax: boolean
    tax_percentage: number | null
  }>>([])
  const [propertyChannels, setPropertyChannels] = useState<string[]>([])
  
  // Determinar si es período cerrado
  const isClosedPeriod = formData.booking_type_id && bookingTypes.find(bt => bt.id === formData.booking_type_id)?.value === 'closed_period'
  
  // Cargar tipos de reserva
  useEffect(() => {
    const loadBookingTypes = async () => {
      try {
        const response = await fetch(`/api/configuration/booking-types`)
        if (response.ok) {
          const data = await response.json()
          setBookingTypes(data)
        }
      } catch (error) {
        console.error('Error loading booking types:', error)
      }
    }
    loadBookingTypes()
  }, [])

  // Cargar todos los canales
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const response = await fetch(`/api/sales-channels`)
        if (response.ok) {
          const data = await response.json()
          setAllChannels(data.map((c: any) => ({
            id: c.id,
            name: c.person.full_name,
            logo_url: c.logo_url,
            sales_commission: c.sales_commission || 0,
            collection_commission: c.collection_commission || 0,
            apply_tax: c.apply_tax || false,
            tax_percentage: c.apply_tax && c.tax_type?.description 
              ? parseFloat(c.tax_type.description) 
              : null,
          })))
        }
      } catch (error) {
        console.error("Error loading channels:", error)
      }
    }
    loadChannels()
  }, [])
  
  // Cargar canales activos de la propiedad seleccionada
  useEffect(() => {
    const loadPropertyChannels = async () => {
      if (!formData.property_id) {
        setPropertyChannels([])
        return
      }
      
      try {
        const response = await fetch(`/api/properties/${formData.property_id}/sales-channels`)
        if (response.ok) {
          const data = await response.json()
          setPropertyChannels(data.channelIds || [])
        }
      } catch (error) {
        console.error("Error loading property channels:", error)
        setPropertyChannels([])
      }
    }
    loadPropertyChannels()
  }, [formData.property_id])
  
  // Filtrar canales según la propiedad
  // Solo mostrar canales activos de la propiedad seleccionada
  const channels = formData.property_id
    ? allChannels.filter(c => propertyChannels.includes(c.id))
    : []
  
  // Obtener el canal seleccionado con sus datos
  const selectedChannel = channels.find(c => c.id === formData.channel_id)
  
  // Flags para rastrear qué campos fueron modificados manualmente
  const [manuallyModified, setManuallyModified] = useState({
    sales_commission_amount: false,
    collection_commission_amount: false,
    tax_amount: false,
  })
  
  // Guardar valores iniciales de la reserva para comparar cambios (solo una vez)
  const initialValuesRef = useRef({
    totalAmount: booking?.total_amount || 0,
    channelId: booking?.channel_id || "",
    loaded: false,
  })
  
  // Marcar como cargado después del primer render
  useEffect(() => {
    if (booking && !initialValuesRef.current.loaded) {
      initialValuesRef.current = {
        totalAmount: booking.total_amount || 0,
        channelId: booking.channel_id || "",
        loaded: true,
      }
    }
  }, [booking])
  
  // Resetear flags cuando cambia el canal
  useEffect(() => {
    // Solo resetear si realmente cambió el canal (no en la carga inicial)
    if (initialValuesRef.current.loaded && formData.channel_id !== initialValuesRef.current.channelId) {
      setManuallyModified({
        sales_commission_amount: false,
        collection_commission_amount: false,
        tax_amount: false,
      })
    }
  }, [formData.channel_id])
  
  // Calcular comisiones e impuestos SOLO cuando cambia el total_amount o el canal
  // NO recalcular al cargar una reserva existente
  useEffect(() => {
    // Si estamos editando, solo recalcular si cambió el total_amount o el canal desde los valores iniciales
    if (initialValuesRef.current.loaded) {
      const totalChanged = formData.total_amount !== initialValuesRef.current.totalAmount
      const channelChanged = formData.channel_id !== initialValuesRef.current.channelId
      
      // Si no cambió nada, no recalcular (usar valores de la BD)
      if (!totalChanged && !channelChanged) {
        return
      }
    }
    
    // Recalcular solo si hay importe total y canal seleccionado
    if (formData.total_amount > 0 && selectedChannel) {
      const calculated = calculateBookingAmounts({
        totalAmount: formData.total_amount,
        salesCommissionPercentage: selectedChannel.sales_commission,
        collectionCommissionPercentage: selectedChannel.collection_commission,
        taxPercentage: selectedChannel.tax_percentage,
      })
      
      // Solo actualizar campos que no fueron modificados manualmente
      setFormData(prev => ({
        ...prev,
        sales_commission_amount: manuallyModified.sales_commission_amount 
          ? prev.sales_commission_amount 
          : calculated.salesCommissionAmount,
        collection_commission_amount: manuallyModified.collection_commission_amount 
          ? prev.collection_commission_amount 
          : calculated.collectionCommissionAmount,
        tax_amount: manuallyModified.tax_amount 
          ? prev.tax_amount 
          : calculated.taxAmount,
        net_amount: recalculateNetAmount(
          formData.total_amount,
          manuallyModified.sales_commission_amount ? prev.sales_commission_amount : calculated.salesCommissionAmount,
          manuallyModified.collection_commission_amount ? prev.collection_commission_amount : calculated.collectionCommissionAmount,
          manuallyModified.tax_amount ? prev.tax_amount : calculated.taxAmount
        ),
      }))
    } else if (formData.total_amount > 0 && !selectedChannel) {
      // Si no hay canal, poner todo a 0 (excepto si fueron modificados manualmente)
      setFormData(prev => ({
        ...prev,
        sales_commission_amount: manuallyModified.sales_commission_amount 
          ? prev.sales_commission_amount 
          : 0,
        collection_commission_amount: manuallyModified.collection_commission_amount 
          ? prev.collection_commission_amount 
          : 0,
        tax_amount: manuallyModified.tax_amount 
          ? prev.tax_amount 
          : 0,
        net_amount: recalculateNetAmount(
          prev.total_amount,
          manuallyModified.sales_commission_amount ? prev.sales_commission_amount : 0,
          manuallyModified.collection_commission_amount ? prev.collection_commission_amount : 0,
          manuallyModified.tax_amount ? prev.tax_amount : 0
        ),
      }))
    }
  }, [formData.total_amount, formData.channel_id, selectedChannel, manuallyModified])
  
  // Recalcular net_amount cuando se modifican manualmente las comisiones o impuestos
  // (solo si no está en el useEffect anterior para evitar loops)
  useEffect(() => {
    // Solo recalcular si no hay canal o si algún campo fue modificado manualmente
    if (!selectedChannel || manuallyModified.sales_commission_amount || manuallyModified.collection_commission_amount || manuallyModified.tax_amount) {
      const netAmount = recalculateNetAmount(
        formData.total_amount,
        formData.sales_commission_amount,
        formData.collection_commission_amount,
        formData.tax_amount
      )
      setFormData(prev => {
        // Solo actualizar si el valor cambió para evitar loops infinitos
        if (Math.abs(prev.net_amount - netAmount) > 0.01) {
          return { ...prev, net_amount: netAmount }
        }
        return prev
      })
    }
  }, [formData.total_amount, formData.sales_commission_amount, formData.collection_commission_amount, formData.tax_amount, selectedChannel, manuallyModified])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [shouldScrollToError, setShouldScrollToError] = useState(false)
  
  // Hacer scroll al primer error cuando se actualicen los errores después de un submit
  useEffect(() => {
    if (shouldScrollToError && Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField) || 
                             document.querySelector(`[name="${firstErrorField}"]`)
        if (errorElement) {
          setTimeout(() => {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            errorElement.focus()
          }, 100)
        }
      }
      setShouldScrollToError(false)
    }
  }, [errors, shouldScrollToError])

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {}

    if (!formData.property_id) {
      newErrors.property_id = "Debe seleccionar una propiedad"
    }

    if (!formData.booking_type_id) {
      newErrors.booking_type_id = "Debe seleccionar un tipo de reserva"
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
      } else if (formData.property_id) {
        // Determinar el tipo de reserva para pasar a la validación
        // Es importante obtener el valor correcto del tipo de reserva
        let currentBookingType: 'commercial' | 'closed_period' = 'commercial' // Por defecto 'commercial'
        
        if (formData.booking_type_id && bookingTypes.length > 0) {
          // Buscar el tipo de reserva en el array de bookingTypes
          const foundType = bookingTypes.find(bt => bt.id === formData.booking_type_id)
          if (foundType && foundType.value) {
            // Solo usar el valor si es 'commercial' o 'closed_period'
            if (foundType.value === 'commercial' || foundType.value === 'closed_period') {
              currentBookingType = foundType.value as 'commercial' | 'closed_period'
            }
          }
        }
        
        // Verificar disponibilidad solo si las fechas son válidas y hay propiedad seleccionada
        try {
          const response = await fetch('/api/calendar/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              propertyId: formData.property_id,
              checkIn: formData.check_in_date,
              checkOut: formData.check_out_date,
              bookingId: booking?.id,
              bookingType: currentBookingType // Siempre enviar un tipo válido ('commercial' o 'closed_period')
            })
          })

          if (response.ok) {
            const availabilityResult = await response.json()

            if (!availabilityResult.valid) {
              // Mostrar el primer conflicto como error
              if (availabilityResult.conflicts && availabilityResult.conflicts.length > 0) {
                const firstConflict = availabilityResult.conflicts[0]
                if (firstConflict.conflictType === 'closed_period') {
                  newErrors.check_in_date = `Período cerrado: ${firstConflict.message}`
                } else {
                  newErrors.check_in_date = `Conflicto de disponibilidad: ${firstConflict.message}`
                }
              } else if (availabilityResult.message) {
                newErrors.check_in_date = availabilityResult.message
              }
            }
          }
        } catch (error: any) {
          console.error('Error validating availability:', error)
          // No bloquear el formulario si hay error en la validación, solo loguear
        }
      }
    }

    // Validaciones para reservas comerciales
    if (!isClosedPeriod) {
      if (!selectedPerson) {
        newErrors.person = "Debe seleccionar un huésped"
      }

      if (!formData.number_of_guests || formData.number_of_guests < 1) {
        newErrors.number_of_guests = "El número de huéspedes es obligatorio y debe ser al menos 1"
      } else if (formData.property_id) {
        // Validar que no exceda el máximo de huéspedes de la propiedad
        const selectedProperty = properties.find(p => p.id === formData.property_id)
        if (selectedProperty?.max_guests && formData.number_of_guests > selectedProperty.max_guests) {
          newErrors.number_of_guests = `El número de huéspedes no puede ser superior a ${selectedProperty.max_guests} (máximo configurado para esta propiedad)`
        }
      }

      if (!formData.total_amount || formData.total_amount <= 0) {
        newErrors.total_amount = "El importe total es obligatorio y debe ser mayor que 0"
      }

      // Validar que si hay canal, el número de reserva del canal es obligatorio
      if (formData.channel_id && !formData.channel_booking_number?.trim()) {
        newErrors.channel_booking_number = "El número de reserva del canal es obligatorio cuando se selecciona un canal"
      }
    } else {
      // Validaciones para períodos cerrados
      if (formData.total_amount !== 0) {
        newErrors.total_amount = "Los períodos cerrados no pueden tener importe (debe ser 0)"
      }
      if (formData.channel_id) {
        newErrors.channel_id = "Los períodos cerrados no pueden tener canal de venta"
      }
    }

    // El estado de reserva solo es obligatorio para reservas comerciales
    if (!isClosedPeriod && !formData.booking_status_id) {
      newErrors.booking_status_id = "El estado de la reserva es obligatorio"
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

    // Marcar todos los campos como tocados antes de validar
    setTouched({
      person: true,
      property_id: true,
      check_in_date: true,
      check_out_date: true,
      number_of_guests: true,
      total_amount: true,
      channel_booking_number: true,
    })

    setLoading(true)
    const isValid = await validateForm()
    setLoading(false)
    
    if (!isValid) {
      setShouldScrollToError(true)
      // No mostrar toast de validación, los errores ya se muestran debajo de cada campo
      return
    }

    // Para períodos cerrados no se requiere huésped
    if (!isClosedPeriod && !selectedPerson) {
      return
    }

    setLoading(true)

    try {
      const bookingData = {
        ...formData,
        person_id: isClosedPeriod ? null : (selectedPerson?.id || null),
        channel_id: isClosedPeriod ? null : (formData.channel_id || null),
        channel_booking_number: isClosedPeriod ? null : (formData.channel_booking_number || null),
        booking_status_id: isClosedPeriod ? null : (formData.booking_status_id || null),
        booking_type_id: formData.booking_type_id || null,
        // Asegurar que períodos cerrados tengan importes en 0
        total_amount: isClosedPeriod ? 0 : formData.total_amount,
        sales_commission_amount: isClosedPeriod ? 0 : (formData.sales_commission_amount || 0),
        collection_commission_amount: isClosedPeriod ? 0 : (formData.collection_commission_amount || 0),
        tax_amount: isClosedPeriod ? 0 : (formData.tax_amount || 0),
        net_amount: isClosedPeriod ? 0 : (formData.net_amount || 0),
        number_of_guests: isClosedPeriod ? 0 : formData.number_of_guests,
        notes: formData.notes || null,
      }

      if (onSave) {
        try {
          const success = await onSave(bookingData)
          if (success) {
            toast({
              title: booking ? "Reserva actualizada" : "Reserva creada",
              description: `La reserva se ha ${booking ? "actualizado" : "creado"} correctamente.`,
            })
            router.push("/dashboard/bookings")
            router.refresh()
          } else {
            toast({
              title: "Error",
              description: "No se pudo guardar la reserva. Por favor, verifica los datos e intenta nuevamente.",
              variant: "destructive",
            })
          }
        } catch (saveError: any) {
          console.error("Error in onSave:", saveError)
          const errorMsg = saveError?.message || saveError?.error || "Error al guardar la reserva"
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive",
          })
        }
      } else {
        // Fallback: usar API directamente
        const response = await fetch(booking ? `/api/bookings/${booking.id}` : "/api/bookings", {
          method: booking ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          const errorMsg = errorData?.error || "Error al guardar la reserva"
          throw new Error(errorMsg)
        }

        const result = await response.json()
        
        if (result) {
          toast({
            title: booking ? "Reserva actualizada" : "Reserva creada",
            description: `La reserva se ha ${booking ? "actualizado" : "creado"} correctamente.`,
          })
          router.push("/dashboard/bookings")
          router.refresh()
        } else {
          throw new Error("No se recibió respuesta del servidor")
        }
      }
    } catch (error: any) {
      console.error("Error saving booking:", error)
      
      // Extraer mensaje de error de forma más robusta
      let errorMessage = "Ocurrió un error al guardar la reserva. Por favor, verifica los datos e intenta nuevamente."
      
      // Si el error viene de la respuesta del servidor
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.error) {
        errorMessage = typeof error.error === 'string' ? error.error : error.error.message || errorMessage
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.details) {
        errorMessage = error.details
      } else if (error?.hint) {
        errorMessage = error.hint
      }
      
      // Siempre mostrar toast con mensaje válido
      if (errorMessage && errorMessage.trim()) {
        toast({
          title: "Error al guardar la reserva",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const nights = calculateNights()
  const selectedProperty = properties.find(p => p.id === formData.property_id)
  const selectedBookingType = bookingTypes.find(bt => bt.id === formData.booking_type_id)
  const selectedBookingStatus = bookingStatuses.find(bs => bs.id === formData.booking_status_id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/bookings")}
            className="p-1.5 hover:bg-muted rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {booking ? `Editar Reserva ${booking.booking_code}` : "Nueva Reserva"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {booking ? "Modifica los datos de la reserva" : "Crea una nueva reserva para una propiedad"}
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
                {/* Property */}
                <div className="space-y-2">
                  <Label htmlFor="property_id" className="text-sm font-medium text-foreground">
                    Propiedad <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.property_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, property_id: value, channel_id: "", channel_booking_number: "" })
                    }}
                  >
                    <SelectTrigger id="property_id" className="bg-background">
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
                    <p className="text-sm text-destructive">{errors.property_id}</p>
                  )}
                </div>

                {/* Reservation Type */}
                <div className="space-y-2">
                  <Label htmlFor="booking_type_id" className="text-sm font-medium text-foreground">
                    Tipo de Reserva <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.booking_type_id}
                    onValueChange={(value) => {
                      const newType = bookingTypes.find(bt => bt.id === value)
                      const isNewClosedPeriod = newType?.value === 'closed_period'
                      
                      setFormData({ 
                        ...formData, 
                        booking_type_id: value,
                        // Limpiar campos si cambia a período cerrado
                        ...(isNewClosedPeriod ? {
                          channel_id: "",
                          channel_booking_number: "",
                          total_amount: 0,
                          sales_commission_amount: 0,
                          collection_commission_amount: 0,
                          tax_amount: 0,
                          net_amount: 0,
                          number_of_guests: 0,
                        } : {})
                      })
                      if (isNewClosedPeriod) {
                        setSelectedPerson(null)
                      }
                    }}
                  >
                    <SelectTrigger id="booking_type_id" className="bg-background">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookingTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.booking_type_id && (
                    <p className="text-sm text-destructive">{errors.booking_type_id}</p>
                  )}
                </div>

                {/* Check-in Date */}
                <div className="space-y-2">
                  <Label htmlFor="check_in_date" className="text-sm font-medium text-foreground">
                    Fecha de Entrada <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="check_in_date"
                    type="date"
                    value={formData.check_in_date}
                    onChange={(e) =>
                      setFormData({ ...formData, check_in_date: e.target.value })
                    }
                    className="bg-background"
                  />
                  {errors.check_in_date && (
                    <p className="text-sm text-destructive">{errors.check_in_date}</p>
                  )}
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <Label htmlFor="check_out_date" className="text-sm font-medium text-foreground">
                    Fecha de Salida <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="check_out_date"
                    type="date"
                    value={formData.check_out_date}
                    onChange={(e) =>
                      setFormData({ ...formData, check_out_date: e.target.value })
                    }
                    className="bg-background"
                  />
                  {errors.check_out_date && (
                    <p className="text-sm text-destructive">{errors.check_out_date}</p>
                  )}
                </div>

                {/* Number of Nights */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-foreground">Número de Noches</Label>
                  <Input
                    type="text"
                    value={nights > 0 ? `${nights} ${nights === 1 ? 'noche' : 'noches'}` : '-'}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </Card>

            {/* Section 2: Datos del Huésped - Only for Commercial */}
            {!isClosedPeriod && (
              <Card className="p-5 md:p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Datos del Huésped
                </h2>

                <div className="space-y-4">
                  <PersonSearch
                    tenantId={tenantId}
                    value={selectedPerson}
                    onSelect={setSelectedPerson}
                    required
                  />
                  {errors.person && (
                    <p className="text-sm text-destructive">{errors.person}</p>
                  )}
                </div>
              </Card>
            )}

            {/* Section 3: Canal de Venta - Only for Commercial */}
            {!isClosedPeriod && (
              <Card className="p-5 md:p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Canal de Venta
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="channel_id" className="text-sm font-medium text-foreground">
                      Canal de Venta
                    </Label>
                    <Select
                      value={formData.channel_id || "none"}
                      onValueChange={(value) =>
                        setFormData({ 
                          ...formData, 
                          channel_id: value === "none" ? "" : value,
                          channel_booking_number: value === "none" ? "" : formData.channel_booking_number
                        })
                      }
                      disabled={!formData.property_id}
                    >
                      <SelectTrigger id="channel_id" className="bg-background">
                        <SelectValue 
                          placeholder={
                            !formData.property_id 
                              ? "Seleccione primero una propiedad" 
                              : channels.length === 0 
                                ? "No hay canales activos para esta propiedad"
                                : "Seleccione un canal (opcional)"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin canal</SelectItem>
                        {channels.length === 0 && formData.property_id ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No hay canales activos para esta propiedad. 
                            Configúralos en la edición de la propiedad.
                          </div>
                        ) : (
                          channels.map((channel) => (
                            <SelectItem key={channel.id} value={channel.id}>
                              <div className="flex items-center gap-2">
                                {channel.logo_url && (
                                  <img
                                    src={channel.logo_url}
                                    alt={channel.name}
                                    className="h-4 w-4 object-contain"
                                  />
                                )}
                                <span>{channel.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {formData.property_id && propertyChannels.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Esta propiedad no tiene canales de venta activos. 
                        Configúralos en la edición de la propiedad.
                      </p>
                    )}
                  </div>

                  {formData.channel_id ? (
                    <div className="space-y-2">
                      <Label htmlFor="channel_booking_number" className="text-sm font-medium text-foreground">
                        Número de Reserva del Canal <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="channel_booking_number"
                        type="text"
                        placeholder="Ej: 12345678"
                        value={formData.channel_booking_number}
                        onChange={(e) => {
                          const newValue = e.target.value
                          setFormData({ ...formData, channel_booking_number: newValue })
                          if (newValue.trim() && errors.channel_booking_number) {
                            setErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.channel_booking_number
                              return newErrors
                            })
                          }
                        }}
                        onBlur={() => {
                          setTouched(prev => ({ ...prev, channel_booking_number: true }))
                          if (formData.channel_id && !formData.channel_booking_number?.trim()) {
                            setErrors(prev => ({
                              ...prev,
                              channel_booking_number: "El número de reserva del canal es obligatorio cuando se selecciona un canal"
                            }))
                          } else if (formData.channel_booking_number?.trim()) {
                            setErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.channel_booking_number
                              return newErrors
                            })
                          }
                        }}
                        className={`bg-background ${errors.channel_booking_number && touched.channel_booking_number ? "border-destructive" : ""}`}
                      />
                      {errors.channel_booking_number && touched.channel_booking_number && (
                        <p className="text-sm text-destructive">{errors.channel_booking_number}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Número que identifica esta reserva en el canal de venta seleccionado
                      </p>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </Card>
            )}

            {/* Section 4: Importes y Comisiones - Only for Commercial */}
            {!isClosedPeriod && (
              <Card className="p-5 md:p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    4
                  </span>
                  Importes y Comisiones
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Number of Guests */}
                  <div className="space-y-2">
                    <Label htmlFor="number_of_guests" className="text-sm font-medium text-foreground">
                      Número de Huéspedes <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="number_of_guests"
                      type="number"
                      min="1"
                      max={formData.property_id ? (() => {
                        const selectedProperty = properties.find(p => p.id === formData.property_id)
                        return selectedProperty?.max_guests || undefined
                      })() : undefined}
                      value={formData.number_of_guests}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 1
                        setFormData({
                          ...formData,
                          number_of_guests: newValue,
                        })
                        if (formData.property_id) {
                          const selectedProperty = properties.find(p => p.id === formData.property_id)
                          if (selectedProperty?.max_guests && newValue > selectedProperty.max_guests) {
                            setErrors(prev => ({
                              ...prev,
                              number_of_guests: `El número de huéspedes no puede ser superior a ${selectedProperty.max_guests} (máximo configurado para esta propiedad)`
                            }))
                          } else if (errors.number_of_guests && newValue <= (selectedProperty?.max_guests || Infinity)) {
                            setErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.number_of_guests
                              return newErrors
                            })
                          }
                        }
                      }}
                      onBlur={() => {
                        if (formData.property_id) {
                          const selectedProperty = properties.find(p => p.id === formData.property_id)
                          if (selectedProperty?.max_guests && formData.number_of_guests > selectedProperty.max_guests) {
                            setErrors(prev => ({
                              ...prev,
                              number_of_guests: `El número de huéspedes no puede ser superior a ${selectedProperty.max_guests} (máximo configurado para esta propiedad)`
                            }))
                          }
                        }
                      }}
                      className={`bg-background ${errors.number_of_guests ? "border-destructive" : ""}`}
                    />
                    {errors.number_of_guests && (
                      <p className="text-sm text-destructive">{errors.number_of_guests}</p>
                    )}
                    {formData.property_id && (() => {
                      const selectedProperty = properties.find(p => p.id === formData.property_id)
                      return selectedProperty?.max_guests ? (
                        <p className="text-xs text-muted-foreground">
                          Máximo {selectedProperty.max_guests} huéspedes
                        </p>
                      ) : null
                    })()}
                  </div>

                  {/* Total Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="total_amount" className="text-sm font-medium text-foreground">
                      Importe Total <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center">
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
                        className="bg-background rounded-r-none"
                      />
                      <span className="px-4 py-2 bg-muted border border-l-0 border-input rounded-r-md text-muted-foreground font-medium">
                        €
                      </span>
                    </div>
                    {errors.total_amount && (
                      <p className="text-sm text-destructive">{errors.total_amount}</p>
                    )}
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Desglose de Comisiones e Impuestos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Comisión de Venta (€)</p>
                      <div className="flex items-center gap-2">
                        <Input
                          id="sales_commission_amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.sales_commission_amount}
                          onChange={(e) => {
                            setManuallyModified(prev => ({ ...prev, sales_commission_amount: true }))
                            setFormData({
                              ...formData,
                              sales_commission_amount: parseFloat(e.target.value) || 0,
                            })
                          }}
                          className="bg-background"
                        />
                      </div>
                      {selectedChannel && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedChannel.sales_commission}% del total
                        </p>
                      )}
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Comisión de Cobro (€)</p>
                      <Input
                        id="collection_commission_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.collection_commission_amount}
                        onChange={(e) => {
                          setManuallyModified(prev => ({ ...prev, collection_commission_amount: true }))
                          setFormData({
                            ...formData,
                            collection_commission_amount: parseFloat(e.target.value) || 0,
                          })
                        }}
                        className="bg-background"
                      />
                      {selectedChannel && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedChannel.collection_commission}% del total
                        </p>
                      )}
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Impuesto (€)</p>
                      <Input
                        id="tax_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.tax_amount}
                        onChange={(e) => {
                          setManuallyModified(prev => ({ ...prev, tax_amount: true }))
                          setFormData({
                            ...formData,
                            tax_amount: parseFloat(e.target.value) || 0,
                          })
                        }}
                        className="bg-background"
                      />
                      {selectedChannel && selectedChannel.apply_tax && selectedChannel.tax_percentage && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedChannel.tax_percentage}% del total
                        </p>
                      )}
                      {(!selectedChannel || !selectedChannel.apply_tax) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Sin impuesto aplicado
                        </p>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                      <p className="text-xs text-foreground mb-1">Importe Neto (€)</p>
                      <Input
                        id="net_amount"
                        type="number"
                        step="0.01"
                        value={formData.net_amount}
                        disabled
                        className="bg-background font-semibold"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Total - Comisiones - Impuesto
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Status & Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Section 5: Estado y Notas */}
            <Card className="p-5 md:p-6 border-0 shadow-sm hover:shadow-md transition-shadow sticky top-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  5
                </span>
                Estado y Notas
              </h2>

              <div className="space-y-4">
                {/* Status - Only for Commercial */}
                {!isClosedPeriod && (
                  <div className="space-y-2">
                    <Label htmlFor="booking_status_id" className="text-sm font-medium text-foreground">
                      Estado de la Reserva <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.booking_status_id || undefined}
                      onValueChange={(value) =>
                        setFormData({ ...formData, booking_status_id: value })
                      }
                    >
                      <SelectTrigger id="booking_status_id" className={`bg-background ${errors.booking_status_id ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {bookingStatuses.length > 0 ? (
                          bookingStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.label}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No hay estados disponibles
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.booking_status_id && (
                      <p className="text-sm text-destructive">{errors.booking_status_id}</p>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                    Notas Adicionales
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Añade notas adicionales sobre la reserva..."
                    rows={4}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="bg-background resize-none h-40 md:h-56"
                  />
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20 mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Resumen de Reserva</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {booking && (
                      <div className="flex justify-between">
                        <span>ID Reserva:</span>
                        <span className="font-semibold text-foreground">{booking.booking_code}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Noches:</span>
                      <span className="font-semibold text-foreground">{nights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Importe:</span>
                      <span className="font-semibold text-foreground">
                        {formData.total_amount ? `${formData.total_amount.toFixed(2)} €` : "0.00 €"}
                      </span>
                    </div>
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
            onClick={() => router.push("/dashboard/bookings")}
            disabled={loading}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="px-6">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {booking ? "Actualizar Reserva" : "Crear Reserva"}
          </Button>
        </div>
      </form>
    </div>
  )
}


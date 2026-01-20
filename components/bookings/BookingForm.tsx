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
import { calculateStayPrice, PricingPeriod } from "@/lib/utils/pricing-engine"

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

  // Función helper para obtener el valor por defecto de booking status
  const getDefaultBookingStatusId = (): string => {
    if (!booking && bookingStatuses && bookingStatuses.length > 0) {
      // Buscar el valor por defecto
      const defaultStatus = bookingStatuses.find((status: ConfigurationValue) => {
        // Verificar que la propiedad is_default existe y es true
        return status && 'is_default' in status && status.is_default === true
      })
      return defaultStatus?.id || ""
    }
    return ""
  }

  const initialBookingStatusId = booking?.booking_status_id || getDefaultBookingStatusId()

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
    booking_status_id: initialBookingStatusId,
    notes: booking?.notes || "",
    check_in_url: booking?.check_in_url || "",
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
  const [pricingPeriods, setPricingPeriods] = useState<PricingPeriod[]>([])
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false)

  const selectedProperty = properties.find(p => p.id === formData.property_id)
  const selectedBookingType = bookingTypes.find(bt => bt.id === formData.booking_type_id)
  const selectedBookingStatus = bookingStatuses.find(bs => bs.id === formData.booking_status_id)

  const calculateNights = (): number => {
    if (!formData.check_in_date || !formData.check_out_date) return 0
    const checkIn = new Date(formData.check_in_date)
    const checkOut = new Date(formData.check_out_date)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const nights = calculateNights()

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

          // Aplicar valor por defecto si no hay booking y no hay tipo seleccionado
          if (!booking && !formData.booking_type_id && data.length > 0) {
            const defaultType = data.find((type: ConfigurationValue) => type.is_default === true)
            if (defaultType) {
              setFormData(prev => ({ ...prev, booking_type_id: defaultType.id }))
            }
          }
        }
      } catch (error) {
        console.error('Error loading booking types:', error)
      }
    }
    loadBookingTypes()
  }, [booking])

  // Aplicar valor por defecto de booking status cuando se cargan los estados
  // Este useEffect es necesario por si bookingStatuses se carga después del montaje inicial
  useEffect(() => {
    if (!booking && bookingStatuses.length > 0 && !formData.booking_status_id) {
      const defaultStatus = bookingStatuses.find((status: ConfigurationValue) => {
        return status && 'is_default' in status && status.is_default === true
      })
      if (defaultStatus) {
        setFormData(prev => {
          // Solo actualizar si realmente no hay valor
          if (!prev.booking_status_id) {
            return { ...prev, booking_status_id: defaultStatus.id }
          }
          return prev
        })
      }
    }
  }, [bookingStatuses, booking, formData.booking_status_id])

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

  // Cargar canales activos y precios de la propiedad seleccionada
  useEffect(() => {
    const loadPropertyDetails = async () => {
      if (!formData.property_id) {
        setPropertyChannels([])
        setPricingPeriods([])
        return
      }

      try {
        const [channelsRes, pricingRes] = await Promise.all([
          fetch(`/api/properties/${formData.property_id}/sales-channels`),
          fetch(`/api/properties/${formData.property_id}/pricing`)
        ])

        if (channelsRes.ok) {
          const channelsData = await channelsRes.json()
          setPropertyChannels(channelsData.channelIds || [])
        }

        if (pricingRes.ok) {
          const pricingData = await pricingRes.json()
          setPricingPeriods(pricingData || [])
        }
      } catch (error) {
        console.error("Error loading property details:", error)
        setPropertyChannels([])
        setPricingPeriods([])
      }
    }
    loadPropertyDetails()
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

  // Recalcular precio sugerido automáticamente
  useEffect(() => {
    // Solo si es una reserva comercial y tenemos los datos necesarios
    if (!isClosedPeriod && formData.property_id && formData.check_in_date && formData.check_out_date && pricingPeriods.length > 0) {
      // Evitar sobreescribir si el usuario ha modificado el total manualmente y no es la carga inicial o cambio de fechas crítico
      // Por ahora, para simplificar, calculamos y si es distinto sugerimos o actualizamos si es nuevo

      const checkIn = new Date(formData.check_in_date)
      const checkOut = new Date(formData.check_out_date)
      const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

      if (nights > 0) {
        const result = calculateStayPrice({
          checkIn,
          checkOut,
          numberOfGuests: formData.number_of_guests,
          baseGuests: selectedProperty?.max_guests || 4,
          pricingPeriods
        })

        if (result.isValid) {
          // Si el total_amount es 0 o si acabamos de cambiar fechas/propiedad (y no era una carga de edición)
          const isNewBooking = !booking
          if (isNewBooking && (formData.total_amount === 0 || initialValuesRef.current.totalAmount === 0)) {
            setFormData(prev => ({ ...prev, total_amount: result.totalPrice }))
          }
        }
      }
    }
  }, [formData.property_id, formData.check_in_date, formData.check_out_date, formData.number_of_guests, pricingPeriods, isClosedPeriod, selectedProperty, booking])

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

    if (!formData.booking_type_id || formData.booking_type_id.trim() === "") {
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Marcar todos los campos como tocados antes de validar
    setTouched({
      person: true,
      property_id: true,
      booking_type_id: true, // Añadir booking_type_id a los campos tocados
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
      // Validar booking_type_id antes de construir bookingData
      if (!formData.booking_type_id || formData.booking_type_id.trim() === "") {
        toast({
          title: "Error de validación",
          description: "Debe seleccionar un tipo de reserva",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const bookingData = {
        ...formData,
        person_id: isClosedPeriod ? null : (selectedPerson?.id || null),
        channel_id: isClosedPeriod ? null : (formData.channel_id || null),
        channel_booking_number: isClosedPeriod ? null : (formData.channel_booking_number || null),
        booking_status_id: isClosedPeriod ? null : (formData.booking_status_id || null),
        booking_type_id: formData.booking_type_id.trim(), // Ya validado arriba, solo hacer trim
        // Asegurar que períodos cerrados tengan importes en 0
        total_amount: isClosedPeriod ? 0 : formData.total_amount,
        sales_commission_amount: isClosedPeriod ? 0 : (formData.sales_commission_amount || 0),
        collection_commission_amount: isClosedPeriod ? 0 : (formData.collection_commission_amount || 0),
        tax_amount: isClosedPeriod ? 0 : (formData.tax_amount || 0),
        net_amount: isClosedPeriod ? 0 : (formData.net_amount || 0),
        number_of_guests: isClosedPeriod ? 0 : formData.number_of_guests,
        notes: formData.notes || null,
        check_in_url: isClosedPeriod ? null : (formData.check_in_url || null),
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


  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header (Fixed) */}
      <header className="flex-none p-6 md:px-10 md:py-8 bg-white/80 backdrop-blur-md border-b border-slate-100 z-20">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/bookings")}
            className="h-10 w-10 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
              {booking ? `Editar Reserva ${booking.booking_code}` : "Nueva Reserva"}
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
              {booking ? "Modifica los datos de la reserva" : "Crea una nueva reserva para una propiedad"}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        {/* Body (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 pb-32">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section 1: Información General */}
              <Card className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
                    <span className="text-teal-700 font-black text-lg">1</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tighter">Información General</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalles básicos de la estancia</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property */}
                  <div className="space-y-2">
                    <Label htmlFor="property_id" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Propiedad <span className="text-indigo-500">*</span>
                    </Label>
                    <Select
                      value={formData.property_id}
                      onValueChange={(value) => {
                        setFormData({ ...formData, property_id: value, channel_id: "", channel_booking_number: "" })
                      }}
                    >
                      <SelectTrigger id="property_id" className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 shadow-none">
                        <SelectValue placeholder="Seleccione una propiedad" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white">
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id} className="font-medium">
                            {property.name} <span className="text-[10px] text-slate-400 ml-1">({property.property_code})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.property_id && (
                      <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.property_id}</p>
                    )}
                  </div>

                  {/* Reservation Type */}
                  <div className="space-y-2">
                    <Label htmlFor="booking_type_id" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Tipo de Reserva <span className="text-indigo-600">*</span>
                    </Label>
                    <Select
                      value={formData.booking_type_id || undefined}
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
                      <SelectTrigger id="booking_type_id" className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 shadow-none">
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white">
                        {bookingTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id} className="font-medium">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.booking_type_id && (
                      <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.booking_type_id}</p>
                    )}
                  </div>

                  {/* Check-in Date */}
                  <div className="space-y-2">
                    <Label htmlFor="check_in_date" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Fecha de Entrada <span className="text-indigo-600">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="check_in_date"
                        type="date"
                        value={formData.check_in_date}
                        onChange={(e) =>
                          setFormData({ ...formData, check_in_date: e.target.value })
                        }
                        className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 shadow-none pl-10"
                      />
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    {errors.check_in_date && (
                      <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.check_in_date}</p>
                    )}
                  </div>

                  {/* Check-out Date */}
                  <div className="space-y-2">
                    <Label htmlFor="check_out_date" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Fecha de Salida <span className="text-indigo-600">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="check_out_date"
                        type="date"
                        value={formData.check_out_date}
                        onChange={(e) =>
                          setFormData({ ...formData, check_out_date: e.target.value })
                        }
                        className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 shadow-none pl-10"
                      />
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    {errors.check_out_date && (
                      <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.check_out_date}</p>
                    )}
                  </div>

                  {/* Number of Nights */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Número de Noches</Label>
                    <div className="h-11 bg-slate-100/50 border border-slate-100 rounded-xl font-black text-slate-900 flex items-center px-4">
                      {nights > 0 ? `${nights} ${nights === 1 ? 'noche' : 'noches'}` : '-'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Section 2: Datos del Huésped - Only for Commercial */}
              {!isClosedPeriod && (
                <Card className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
                      <span className="text-teal-700 font-black text-lg">2</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tighter">Datos del Huésped</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información del titular</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <PersonSearch
                      tenantId={tenantId}
                      value={selectedPerson}
                      onSelect={setSelectedPerson}
                      required
                    />
                    {errors.person && (
                      <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.person}</p>
                    )}
                  </div>
                </Card>
              )}

              {/* Section 3: Canal de Venta - Only for Commercial */}
              {!isClosedPeriod && (
                <Card className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
                      <span className="text-teal-700 font-black text-lg">3</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tighter">Canal de Venta</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Origen de la reserva</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="channel_id" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
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
                        <SelectTrigger id="channel_id" className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 shadow-none">
                          <SelectValue
                            placeholder={
                              !formData.property_id
                                ? "Seleccione primero una propiedad"
                                : channels.length === 0
                                  ? "No hay canales activos"
                                  : "Seleccione un canal (opcional)"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white">
                          <SelectItem value="none" className="font-bold">Sin canal</SelectItem>
                          {channels.length === 0 && formData.property_id ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No hay canales activos para esta propiedad.
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
                                  <span className="font-medium">{channel.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.channel_id ? (
                      <div className="space-y-2">
                        <Label htmlFor="channel_booking_number" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Nº Reserva Canal <span className="text-indigo-600">*</span>
                        </Label>
                        <Input
                          id="channel_booking_number"
                          type="text"
                          placeholder="Ej: 12345678"
                          value={formData.channel_booking_number}
                          onChange={(e) => {
                            const newValue = e.target.value
                            setFormData({ ...formData, channel_booking_number: newValue })
                          }}
                          className={`h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 shadow-none ${errors.channel_booking_number && touched.channel_booking_number ? "border-red-500 bg-red-50" : ""}`}
                        />
                        {errors.channel_booking_number && touched.channel_booking_number && (
                          <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.channel_booking_number}</p>
                        )}
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </Card>
              )}

              {/* Section 4: Importes y Comisiones - Only for Commercial */}
              {!isClosedPeriod && (
                <Card className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
                      <span className="text-teal-700 font-black text-lg">4</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tighter">Importes y Comisiones</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Desglose económico de la reserva</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Huéspedes */}
                    <div className="space-y-2">
                      <Label htmlFor="number_of_guests" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Huéspedes <span className="text-indigo-600">*</span>
                      </Label>
                      <Input
                        id="number_of_guests"
                        type="number"
                        min="1"
                        value={formData.number_of_guests}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 1
                          setFormData({
                            ...formData,
                            number_of_guests: newValue,
                          })
                        }}
                        className={`h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 shadow-none ${errors.number_of_guests ? "border-red-500 bg-red-50" : ""}`}
                      />
                      {errors.number_of_guests && (
                        <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.number_of_guests}</p>
                      )}
                    </div>

                    {/* Total Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="total_amount" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Importe Total (€) <span className="text-indigo-600">*</span>
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
                        className={`h-11 bg-indigo-50/30 border-indigo-100 rounded-xl font-black text-teal-700 focus:ring-indigo-500 shadow-none text-lg ${errors.total_amount ? "border-red-500 bg-red-50" : ""}`}
                      />
                      {errors.total_amount && (
                        <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.total_amount}</p>
                      )}
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Desglose de Comisiones e Impuestos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Comisión Venta (€)</p>
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
                          className="h-10 bg-white border-slate-200 rounded-lg font-bold shadow-none"
                        />
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Comisión Cobro (€)</p>
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
                          className="h-10 bg-white border-slate-200 rounded-lg font-bold shadow-none"
                        />
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Impuestos (€)</p>
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
                          className="h-10 bg-white border-slate-200 rounded-lg font-bold shadow-none"
                        />
                      </div>
                      <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-teal-100 ring-4 ring-teal-50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-teal-100 mb-1">Importe Neto (€)</p>
                        <div className="text-2xl font-black text-white tracking-tighter">
                          {formData.net_amount.toFixed(2)} €
                        </div>
                        <p className="text-[9px] font-bold text-teal-100/70 uppercase tracking-widest mt-1">
                          Total - Comisiones - Impuestos
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Status & Summary */}
            <div className="lg:col-span-1 space-y-8">
              {/* Section 5: Estado y Notas */}
              <Card className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
                    <span className="text-teal-700 font-black text-lg">5</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tighter">Estado y Notas</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seguimiento y control</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Status - Only for Commercial */}
                  {!isClosedPeriod && (
                    <div className="space-y-2">
                      <Label htmlFor="booking_status_id" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Estado <span className="text-indigo-600">*</span>
                      </Label>
                      <Select
                        value={formData.booking_status_id || undefined}
                        onValueChange={(value) =>
                          setFormData({ ...formData, booking_status_id: value })
                        }
                      >
                        <SelectTrigger id="booking_status_id" className={`h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 shadow-none ${errors.booking_status_id ? "border-red-500 bg-red-50" : ""}`}>
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white">
                          {bookingStatuses.length > 0 ? (
                            bookingStatuses.map((status) => (
                              <SelectItem key={status.id} value={status.id} className="font-medium">
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
                        <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.booking_status_id}</p>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Notas Adicionales
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Notas sobre la reserva..."
                      rows={4}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="bg-slate-50 border-slate-100 rounded-xl font-medium focus:ring-indigo-500 shadow-none resize-none h-32"
                    />
                  </div>

                  {/* Check-in URL */}
                  {!isClosedPeriod && (
                    <div className="space-y-2">
                      <Label htmlFor="check_in_url" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Check-in Online URL
                      </Label>
                      <Input
                        id="check_in_url"
                        type="url"
                        placeholder="https://..."
                        value={formData.check_in_url}
                        onChange={(e) =>
                          setFormData({ ...formData, check_in_url: e.target.value })
                        }
                        className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 shadow-none"
                      />
                    </div>
                  )}

                  {/* Summary Card */}
                  <div className="bg-amber-50/50 p-6 rounded-[1.5rem] border border-amber-100/50 mt-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4">Resumen</h3>
                    <div className="space-y-3">
                      {booking && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-400">ID Reserva:</span>
                          <span className="font-black text-slate-900 tracking-tight">{booking.booking_code}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-400">Noches:</span>
                        <span className="font-black text-slate-900 tracking-tight">{nights}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-400">Importe:</span>
                        <span className="font-black text-teal-700 text-lg tracking-tighter">
                          {formData.total_amount ? `${formData.total_amount.toFixed(2)} €` : "0.00 €"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer (Fixed) */}
        <footer className="flex-none p-6 md:px-10 md:py-8 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-end gap-3 z-20">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/dashboard/bookings")}
            disabled={loading}
            className="h-12 px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest text-slate-500 hover:text-slate-900 transition-all"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-teal-800 text-white rounded-2xl h-12 px-8 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-teal-100 transition-all active:scale-95 flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {booking ? "Actualizar Reserva" : "Crear Reserva"}
          </Button>
        </footer>
      </form>
    </div>
  )
}


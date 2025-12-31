// Tipos para el sistema de reservas

export interface Booking {
  id: string
  tenant_id: string
  booking_code: string
  property_id: string
  person_id: string | null // Puede ser null para períodos cerrados
  channel_id: string | null // Canal de venta
  channel_booking_number: string | null // Número de reserva en el canal de venta
  check_in_date: string
  check_out_date: string
  number_of_guests: number
  total_amount: number
  sales_commission_amount: number // Importe de comisión de venta (calculado, modificable)
  collection_commission_amount: number // Importe de comisión de cobro (calculado, modificable)
  tax_amount: number // Importe de impuesto (calculado, modificable)
  net_amount: number // Importe neto (calculado automáticamente, no modificable)
  paid_amount: number // Calculado dinámicamente desde movements
  pending_amount: number // Calculado dinámicamente: (net_amount o total_amount) - paid_amount
  booking_status_id: string | null
  booking_type_id: string | null // Tipo de reserva: comercial o período cerrado
  notes: string | null
  check_in_url: string | null
  created_at: string
  updated_at: string
  created_by: string | null

  // Relaciones (opcionales, cargadas cuando se solicita)
  property?: {
    id: string
    name: string
    property_code: string
  }
  person?: {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
  }
  channel?: {
    id: string
    person: {
      full_name: string
      email: string | null
      phone: string | null
    }
    logo_url: string | null
    sales_commission: number
    collection_commission: number
    apply_tax: boolean
    tax_type?: {
      id: string
      label: string
      description: string | null // Porcentaje del impuesto
    } | null
  } | null
  booking_status?: {
    id: string
    label: string
    color: string | null
    icon: string | null
  }
  booking_type?: {
    id: string
    label: string
    color: string | null
    icon: string | null
  }
}

export interface PersonContactInfo {
  id: string
  tenant_id: string
  person_id: string
  contact_type: string // 'email', 'phone', etc.
  contact_value: string
  contact_name: string | null // Nombre de la persona de contacto
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Person {
  id: string
  tenant_id: string
  person_type: string // Viene de configuration_values donde configuration_type = 'person_type'
  first_name: string | null
  last_name: string | null
  full_name: string | null // Solo para personas jurídicas, no usar para huéspedes
  document_type: string | null
  document_number: string | null
  birth_date: string | null // Date como string ISO
  nationality: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Contactos cargados opcionalmente
  contacts?: PersonContactInfo[]
  // Email y phone calculados desde contacts (helper)
  email?: string | null
  phone?: string | null
}

export interface BookingWithDetails extends Omit<Booking, 'property' | 'person' | 'channel' | 'booking_status' | 'booking_type'> {
  property: {
    id: string
    name: string
    property_code: string
  }
  person: {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
  } | null // Puede ser null para períodos cerrados
  check_in_url: string | null
  channel: {
    id: string
    person: {
      full_name: string
      email: string | null
      phone: string | null
    }
    logo_url: string | null
    sales_commission: number
    collection_commission: number
    apply_tax: boolean
    tax_type?: {
      id: string
      label: string
      description: string | null // Porcentaje del impuesto
    } | null
  } | null
  booking_status: {
    id: string
    label: string
    color: string | null
    icon: string | null
  } | null
  booking_type: {
    id: string
    label: string
    color: string | null
    icon: string | null
    value: string | null
  } | null
}

// Tipos para operaciones CRUD
export interface CreateBookingData {
  property_id: string
  person_id: string | null
  channel_id?: string | null
  channel_booking_number?: string | null
  check_in_date: string
  check_out_date: string
  number_of_guests: number
  total_amount: number
  sales_commission_amount?: number
  collection_commission_amount?: number
  tax_amount?: number
  net_amount?: number
  paid_amount?: number
  booking_status_id?: string | null
  booking_type_id?: string | null
  notes?: string | null
}

export interface UpdateBookingData {
  property_id?: string
  person_id?: string | null
  channel_id?: string | null
  channel_booking_number?: string | null
  check_in_date?: string
  check_out_date?: string
  number_of_guests?: number
  total_amount?: number
  sales_commission_amount?: number
  collection_commission_amount?: number
  tax_amount?: number
  net_amount?: number
  paid_amount?: number
  booking_status_id?: string | null
  booking_type_id?: string | null
  notes?: string | null
  check_in_url?: string | null
}

export interface CreatePersonData {
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  notes?: string | null
}

export interface UpdatePersonData {
  first_name?: string
  last_name?: string
  email?: string | null
  phone?: string | null
  notes?: string | null
}

export interface CreatePersonContactInfoData {
  person_id: string
  contact_type: string
  contact_value: string
  is_primary?: boolean
}


// Tipos para el sistema de reservas

export interface Booking {
  id: string
  tenant_id: string
  booking_code: string
  property_id: string
  person_id: string
  check_in_date: string
  check_out_date: string
  number_of_guests: number
  total_amount: number
  paid_amount: number
  booking_status_id: string | null
  notes: string | null
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
  booking_status?: {
    id: string
    label: string
    color: string | null
    icon: string | null
  }
}

export interface Person {
  id: string
  tenant_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  person_category: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BookingWithDetails extends Booking {
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
  }
  booking_status: {
    id: string
    label: string
    color: string | null
    icon: string | null
  } | null
}

// Tipos para operaciones CRUD
export interface CreateBookingData {
  property_id: string
  person_id: string
  check_in_date: string
  check_out_date: string
  number_of_guests: number
  total_amount: number
  paid_amount?: number
  booking_status_id?: string | null
  notes?: string | null
}

export interface UpdateBookingData {
  property_id?: string
  person_id?: string
  check_in_date?: string
  check_out_date?: string
  number_of_guests?: number
  total_amount?: number
  paid_amount?: number
  booking_status_id?: string | null
  notes?: string | null
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


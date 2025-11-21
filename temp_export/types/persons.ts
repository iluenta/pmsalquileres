// Tipos para el sistema de gestión de personas

import type { ConfigurationValue } from "@/lib/api/configuration"

export interface Person {
  id: string
  tenant_id: string
  person_type: string // ID de configuration_value donde configuration_type = 'person_type'
  first_name: string | null
  last_name: string | null
  full_name: string | null // Para personas jurídicas
  document_type: string | null
  document_number: string | null
  birth_date: string | null // Date como string ISO
  nationality: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
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

export interface PersonFiscalAddress {
  id: string
  tenant_id: string
  person_id: string
  street: string | null
  number: string | null
  floor: string | null
  door: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country: string | null
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PersonWithDetails extends Person {
  person_type_value?: ConfigurationValue
  contacts?: PersonContactInfo[]
  addresses?: PersonFiscalAddress[]
  // Helpers calculados
  email?: string | null
  phone?: string | null
}

// Tipos para operaciones CRUD
export interface CreatePersonData {
  person_type?: string // ID de configuration_value (opcional, se usa "guest" por defecto)
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  document_type?: string | null
  document_number?: string | null
  birth_date?: string | null
  nationality?: string | null
  notes?: string | null
  is_active?: boolean
  email?: string | null // Para crear contactos automáticamente
  phone?: string | null // Para crear contactos automáticamente
}

export interface UpdatePersonData {
  person_type?: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  document_type?: string | null
  document_number?: string | null
  birth_date?: string | null
  nationality?: string | null
  notes?: string | null
  is_active?: boolean
}

export interface CreatePersonContactData {
  contact_type: string
  contact_value: string
  contact_name?: string | null
  is_primary?: boolean
  is_active?: boolean
}

export interface UpdatePersonContactData {
  contact_type?: string
  contact_value?: string
  contact_name?: string | null
  is_primary?: boolean
  is_active?: boolean
}

export interface CreatePersonAddressData {
  street?: string | null
  number?: string | null
  floor?: string | null
  door?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country?: string | null
  is_primary?: boolean
  is_active?: boolean
}

export interface UpdatePersonAddressData {
  street?: string | null
  number?: string | null
  floor?: string | null
  door?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country?: string | null
  is_primary?: boolean
  is_active?: boolean
}


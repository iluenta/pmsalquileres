// Tipos para el sistema de proveedores de servicios

import type { ConfigurationValue } from "@/lib/api/configuration"

export interface ServiceProvider {
  id: string
  tenant_id: string
  person_id: string
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  
  // Relaciones (opcionales, cargadas cuando se solicita)
  person?: {
    id: string
    tenant_id: string
    person_type: string
    full_name: string | null
    document_type: string | null
    document_number: string | null
    notes: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    contacts?: Array<{
      id: string
      contact_type: string
      contact_value: string
      is_primary: boolean
    }>
  }
}

export interface ServiceProviderWithDetails extends ServiceProvider {
  person: {
    id: string
    tenant_id: string
    person_type: string
    full_name: string
    document_type: string | null
    document_number: string | null
    notes: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    email: string | null
    phone: string | null
  }
  services?: ServiceProviderService[]
}

export interface ServiceProviderService {
  id: string
  service_provider_id: string
  service_type_id: string
  price_type: 'fixed' | 'percentage' // 'fixed' = precio fijo, 'percentage' = porcentaje sobre total reserva
  price: number // Precio fijo en euros o porcentaje (0-100)
  apply_tax: boolean
  tax_type_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  
  // Relaciones (opcionales)
  service_type?: ConfigurationValue
  tax_type?: ConfigurationValue
}

export interface ServiceProviderServiceWithDetails extends Omit<ServiceProviderService, 'service_type' | 'tax_type'> {
  service_type: ConfigurationValue
  tax_type?: ConfigurationValue | null
}

// Tipos para operaciones CRUD
export interface CreateServiceProviderData {
  full_name: string // Nombre del proveedor (persona jurídica)
  document_type?: string | null
  document_number?: string | null
  email?: string | null
  phone?: string | null
  logo_url?: string | null
  notes?: string | null
  is_active?: boolean
}

export interface UpdateServiceProviderData {
  full_name?: string
  document_type?: string | null
  document_number?: string | null
  email?: string | null
  phone?: string | null
  logo_url?: string | null
  notes?: string | null
  is_active?: boolean
}

export interface CreateServiceProviderServiceData {
  service_type_id: string
  price_type: 'fixed' | 'percentage'
  price: number
  apply_tax?: boolean
  tax_type_id?: string | null
  is_active?: boolean
}

export interface UpdateServiceProviderServiceData {
  price_type?: 'fixed' | 'percentage'
  price?: number
  apply_tax?: boolean
  tax_type_id?: string | null
  is_active?: boolean
}


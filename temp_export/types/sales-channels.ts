// Tipos para el sistema de canales de venta

export interface SalesChannel {
  id: string
  tenant_id: string
  person_id: string
  logo_url: string | null
  sales_commission: number // Porcentaje (0-100)
  collection_commission: number // Porcentaje (0-100)
  apply_tax: boolean // Indica si se aplica IVA sobre las comisiones
  tax_type_id: string | null // Referencia al tipo de impuesto (configuration_value)
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

export interface SalesChannelWithDetails extends SalesChannel {
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
  tax_type?: {
    id: string
    label: string
    description: string | null // Porcentaje del impuesto
  } | null
}

// Tipos para operaciones CRUD
export interface CreateSalesChannelData {
  full_name: string // Nombre del canal (persona jurídica)
  document_type?: string | null
  document_number?: string | null
  email?: string | null
  phone?: string | null
  logo_url?: string | null
  sales_commission: number
  collection_commission: number
  apply_tax?: boolean
  tax_type_id?: string | null
  notes?: string | null
  is_active?: boolean
}

export interface UpdateSalesChannelData {
  full_name?: string
  document_type?: string | null
  document_number?: string | null
  email?: string | null
  phone?: string | null
  logo_url?: string | null
  sales_commission?: number
  collection_commission?: number
  apply_tax?: boolean
  tax_type_id?: string | null
  notes?: string | null
  is_active?: boolean
}


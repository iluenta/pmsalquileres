// Tipos para el sistema de highlights de propiedades

export interface PropertyHighlight {
  id: string
  property_id: string
  tenant_id: string
  title: string
  description: string
  icon: string // Nombre de icono de lucide-react
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreatePropertyHighlightData {
  property_id: string
  tenant_id: string
  title: string
  description: string
  icon: string
  sort_order?: number
}

export interface UpdatePropertyHighlightData {
  title?: string
  description?: string
  icon?: string
  sort_order?: number
}



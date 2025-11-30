// Tipos para el sistema de galería de imágenes de propiedades

export interface PropertyImage {
  id: string
  property_id: string
  tenant_id: string
  image_url: string
  title: string
  is_cover: boolean
  sort_order: number
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface CreatePropertyImageData {
  property_id: string
  tenant_id: string
  image_url: string
  title: string
  is_cover?: boolean
  sort_order?: number
}

export interface UpdatePropertyImageData {
  title?: string
  is_cover?: boolean
  sort_order?: number
}


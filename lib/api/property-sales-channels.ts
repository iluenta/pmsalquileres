// Servicio para gestionar la relación entre propiedades y canales de venta

import { getSupabaseServerClient } from '@/lib/supabase/server'

export interface PropertySalesChannel {
  id: string
  tenant_id: string
  property_id: string
  sales_channel_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Obtener canales activos de una propiedad
export async function getPropertySalesChannels(
  propertyId: string,
  tenantId: string
): Promise<string[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('property_sales_channels')
      .select('sales_channel_id')
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
    
    if (error) {
      console.error('Error fetching property sales channels:', error)
      return []
    }
    
    return (data || []).map((item: any) => item.sales_channel_id)
  } catch (error) {
    console.error('Error in getPropertySalesChannels:', error)
    return []
  }
}

// Establecer canales activos para una propiedad
export async function setPropertySalesChannels(
  propertyId: string,
  channelIds: string[],
  tenantId: string
): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return false
    
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    
    // Primero, desactivar todos los canales existentes para esta propiedad
    await supabase
      .from('property_sales_channels')
      .update({ is_active: false })
      .eq('property_id', propertyId)
      .eq('tenant_id', tenantId)
    
    // Si no hay canales, terminamos aquí
    if (channelIds.length === 0) {
      return true
    }
    
    // Para cada canal, crear o activar la relación
    const operations = channelIds.map(async (channelId) => {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('property_sales_channels')
        .select('id')
        .eq('property_id', propertyId)
        .eq('sales_channel_id', channelId)
        .eq('tenant_id', tenantId)
        .maybeSingle()
      
      if (existing) {
        // Actualizar existente
        const { error } = await supabase
          .from('property_sales_channels')
          .update({ is_active: true })
          .eq('id', existing.id)
        
        return !error
      } else {
        // Crear nuevo
        const { error } = await supabase
          .from('property_sales_channels')
          .insert({
            tenant_id: tenantId,
            property_id: propertyId,
            sales_channel_id: channelId,
            is_active: true,
            created_by: user?.id || null,
          })
        
        return !error
      }
    })
    
    const results = await Promise.all(operations)
    return results.every(r => r)
  } catch (error) {
    console.error('Error in setPropertySalesChannels:', error)
    return false
  }
}

// Obtener propiedades que tienen un canal específico activo
export async function getPropertiesBySalesChannel(
  channelId: string,
  tenantId: string
): Promise<string[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('property_sales_channels')
      .select('property_id')
      .eq('sales_channel_id', channelId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
    
    if (error) {
      console.error('Error fetching properties by sales channel:', error)
      return []
    }
    
    return (data || []).map((item: any) => item.property_id)
  } catch (error) {
    console.error('Error in getPropertiesBySalesChannel:', error)
    return []
  }
}


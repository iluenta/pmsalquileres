// Servicio para operaciones CRUD de canales de venta
// Integrado con Supabase y multi-tenant

import { getSupabaseServerClient } from '@/lib/supabase/server'
import type {
  SalesChannel,
  SalesChannelWithDetails,
  CreateSalesChannelData,
  UpdateSalesChannelData,
} from '@/types/sales-channels'
import { getPersonContacts, extractEmailAndPhoneFromContacts } from './bookings'
import type { PersonContactInfo } from '@/types/bookings'

// Función auxiliar para obtener el ID de configuration_value 'sales_channel'
async function getSalesChannelPersonTypeId(tenantId: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    // Buscar el configuration_type 'person_type'
    const { data: configType } = await supabase
      .from('configuration_types')
      .select('id')
      .eq('tenant_id', tenantId)
      .or('name.eq.person_type,name.eq.Tipo de Persona')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()
    
    if (!configType) return null
    
    // Buscar el valor 'sales_channel'
    const { data: value } = await supabase
      .from('configuration_values')
      .select('id')
      .eq('configuration_type_id', configType.id)
      .eq('is_active', true)
      .or('value.eq.sales_channel,label.ilike.canal%venta')
      .limit(1)
      .maybeSingle()
    
    return value?.id || null
  } catch (error) {
    console.error('Error getting sales_channel person_type:', error)
    return null
  }
}

/**
 * Obtiene el canal propio (is_own_channel = true) para un tenant
 */
export async function getOwnSalesChannel(tenantId: string): Promise<SalesChannel | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    const { data: channel, error } = await supabase
      .from('sales_channels')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_own_channel', true)
      .eq('is_active', true)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching own sales channel:', error)
      return null
    }
    
    return channel as SalesChannel | null
  } catch (error) {
    console.error('Error in getOwnSalesChannel:', error)
    return null
  }
}

// Obtener todos los canales de venta
export async function getSalesChannels(tenantId: string, includeInactive: boolean = false): Promise<SalesChannelWithDetails[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []
    
    let query = supabase
      .from('sales_channels')
      .select('*')
      .eq('tenant_id', tenantId)
    
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }
    
    const { data: channels, error } = await query
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching sales channels:', error)
      return []
    }
    
    if (!channels || channels.length === 0) {
      return []
    }
    
    // Obtener información de las personas
    const personIds = channels.map((c: any) => c.person_id)
    const { data: persons } = await supabase
      .from('persons')
      .select('*')
      .in('id', personIds)
    
    // Obtener contactos de todas las personas
    const { data: allContacts } = await supabase
      .from('person_contact_infos')
      .select('*')
      .in('person_id', personIds)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
    
    // Crear map de contactos por persona
    const contactsByPerson = new Map<string, PersonContactInfo[]>()
    ;(allContacts || []).forEach((contact: any) => {
      const existing = contactsByPerson.get(contact.person_id) || []
      existing.push(contact)
      contactsByPerson.set(contact.person_id, existing)
    })
    
    // Obtener tipos de impuesto si existen
    const taxTypeIds = channels
      .map((c: any) => c.tax_type_id)
      .filter((id: string | null) => id !== null)
    
    const taxTypesMap = new Map<string, any>()
    if (taxTypeIds.length > 0) {
      const { data: taxTypes } = await supabase
        .from('configuration_values')
        .select('id, label, description')
        .in('id', taxTypeIds)
      
      ;(taxTypes || []).forEach((taxType: any) => {
        taxTypesMap.set(taxType.id, {
          id: taxType.id,
          label: taxType.label,
          description: taxType.description,
        })
      })
    }
    
    // Combinar canales con información de personas
    const channelsWithDetails: SalesChannelWithDetails[] = (channels || []).map((channel: any) => {
      const person = (persons || []).find((p: any) => p.id === channel.person_id)
      if (!person) {
        return null
      }
      
      const contacts = contactsByPerson.get(person.id) || []
      const { email, phone } = extractEmailAndPhoneFromContacts(contacts)
      
      // Obtener tipo de impuesto si existe
      const taxType = channel.tax_type_id ? taxTypesMap.get(channel.tax_type_id) : null
      
      return {
        ...channel,
        person: {
          ...person,
          email,
          phone,
        },
        tax_type: taxType,
      }
    }).filter(Boolean) as SalesChannelWithDetails[]
    
    return channelsWithDetails
  } catch (error) {
    console.error('Error in getSalesChannels:', error)
    return []
  }
}

// Obtener un canal por ID
export async function getSalesChannelById(id: string, tenantId: string): Promise<SalesChannelWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    const { data: channel, error } = await supabase
      .from('sales_channels')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()
    
    if (error || !channel) {
      console.error('Error fetching sales channel:', error)
      return null
    }
    
    // Obtener información de la persona
    const { data: person } = await supabase
      .from('persons')
      .select('*')
      .eq('id', channel.person_id)
      .single()
    
    if (!person) {
      return null
    }
    
    // Obtener contactos
    const contacts = await getPersonContacts(person.id, tenantId)
    const { email, phone } = extractEmailAndPhoneFromContacts(contacts)
    
    // Obtener tipo de impuesto si existe
    let taxType = null
    if (channel.tax_type_id) {
      const { data: taxTypeData } = await supabase
        .from('configuration_values')
        .select('id, label, description')
        .eq('id', channel.tax_type_id)
        .single()
      
      if (taxTypeData) {
        taxType = {
          id: taxTypeData.id,
          label: taxTypeData.label,
          description: taxTypeData.description,
        }
      }
    }
    
    return {
      ...channel,
      person: {
        ...person,
        email,
        phone,
      },
      tax_type: taxType,
    }
  } catch (error) {
    console.error('Error in getSalesChannelById:', error)
    return null
  }
}

// Crear un nuevo canal de venta
export async function createSalesChannel(
  data: CreateSalesChannelData,
  tenantId: string
): Promise<SalesChannelWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null
    
    // Obtener el person_type para 'sales_channel'
    const salesChannelPersonTypeId = await getSalesChannelPersonTypeId(tenantId)
    
    if (!salesChannelPersonTypeId) {
      throw new Error('No se encontró el tipo de persona "Canal de Venta". Por favor, ejecuta el script 025_add_sales_channel_person_type.sql')
    }
    
    // Crear la persona (jurídica, usando full_name)
    const { data: person, error: personError } = await supabase
      .from('persons')
      .insert({
        tenant_id: tenantId,
        person_type: salesChannelPersonTypeId,
        full_name: data.full_name,
        first_name: null,
        last_name: null,
        document_type: data.document_type || null,
        document_number: data.document_number || null,
        notes: data.notes || null,
        is_active: true,
      })
      .select()
      .single()
    
    if (personError || !person) {
      console.error('Error creating person for sales channel:', personError)
      throw personError || new Error('Error al crear la persona del canal')
    }
    
    // Crear contactos si se proporcionan
    if (data.email || data.phone) {
      const contacts: any[] = []
      if (data.email) {
        contacts.push({
          tenant_id: tenantId,
          person_id: person.id,
          contact_type: 'email',
          contact_value: data.email,
          is_primary: !data.phone, // Si no hay teléfono, el email es primario
          is_active: true,
        })
      }
      if (data.phone) {
        contacts.push({
          tenant_id: tenantId,
          person_id: person.id,
          contact_type: 'phone',
          contact_value: data.phone,
          is_primary: !data.email, // Si no hay email, el teléfono es primario
          is_active: true,
        })
      }
      
      if (contacts.length > 0) {
        const { error: contactsError } = await supabase
          .from('person_contact_infos')
          .insert(contacts)
        
        if (contactsError) {
          console.error('Error creating contacts for sales channel:', contactsError)
          // No lanzar error, continuar sin contactos
        }
      }
    }
    
    // Si se marca como canal propio, desmarcar otros canales propios del mismo tenant
    if (data.is_own_channel) {
      await supabase
        .from('sales_channels')
        .update({ is_own_channel: false })
        .eq('tenant_id', tenantId)
        .eq('is_own_channel', true)
    }

    // Crear el canal de venta
    const { data: channel, error: channelError } = await supabase
      .from('sales_channels')
      .insert({
        tenant_id: tenantId,
        person_id: person.id,
        logo_url: data.logo_url || null,
        sales_commission: data.sales_commission,
        collection_commission: data.collection_commission,
        apply_tax: data.apply_tax !== undefined ? data.apply_tax : false,
        tax_type_id: data.tax_type_id || null,
        is_own_channel: data.is_own_channel !== undefined ? data.is_own_channel : false,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single()
    
    if (channelError || !channel) {
      console.error('Error creating sales channel:', channelError)
      throw channelError || new Error('Error al crear el canal de venta')
    }
    
    // Obtener el canal completo con detalles
    return await getSalesChannelById(channel.id, tenantId)
  } catch (error) {
    console.error('Error in createSalesChannel:', error)
    throw error
  }
}

// Actualizar un canal de venta
export async function updateSalesChannel(
  id: string,
  data: UpdateSalesChannelData,
  tenantId: string
): Promise<SalesChannelWithDetails | null> {
  try {
    console.log('[updateSalesChannel] Starting update', { id, data, tenantId })
    
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      console.error('[updateSalesChannel] No supabase client')
      return null
    }
    
    // Obtener el canal actual
    console.log('[updateSalesChannel] Getting current channel')
    const currentChannel = await getSalesChannelById(id, tenantId)
    if (!currentChannel) {
      console.error('[updateSalesChannel] Channel not found', id)
      throw new Error('Canal de venta no encontrado')
    }
    
    console.log('[updateSalesChannel] Current channel', currentChannel)
    
    // Actualizar la persona si se proporciona full_name
    if (data.full_name !== undefined) {
      const personUpdateData = {
        full_name: data.full_name,
        document_type: data.document_type !== undefined ? data.document_type : currentChannel.person.document_type,
        document_number: data.document_number !== undefined ? data.document_number : currentChannel.person.document_number,
        notes: data.notes !== undefined ? data.notes : currentChannel.person.notes,
      }
      
      console.log('[updateSalesChannel] Updating person', {
        person_id: currentChannel.person_id,
        data: personUpdateData,
      })
      
      const { error: personError } = await supabase
        .from('persons')
        .update(personUpdateData)
        .eq('id', currentChannel.person_id)
        .eq('tenant_id', tenantId)
      
      if (personError) {
        console.error('[updateSalesChannel] Error updating person:', personError)
        throw new Error(personError.message || 'Error al actualizar la información de la persona')
      }
      
      console.log('[updateSalesChannel] Person updated successfully')
    }
    
    // Actualizar contactos si se proporcionan
    if (data.email !== undefined || data.phone !== undefined) {
      // Eliminar contactos existentes
      await supabase
        .from('person_contact_infos')
        .delete()
        .eq('person_id', currentChannel.person_id)
        .eq('tenant_id', tenantId)
      
      // Crear nuevos contactos
      const contacts: any[] = []
      if (data.email) {
        contacts.push({
          tenant_id: tenantId,
          person_id: currentChannel.person_id,
          contact_type: 'email',
          contact_value: data.email,
          is_primary: !data.phone,
          is_active: true,
        })
      }
      if (data.phone) {
        contacts.push({
          tenant_id: tenantId,
          person_id: currentChannel.person_id,
          contact_type: 'phone',
          contact_value: data.phone,
          is_primary: !data.email,
          is_active: true,
        })
      }
      
      if (contacts.length > 0) {
        const { error: contactsError } = await supabase
          .from('person_contact_infos')
          .insert(contacts)
        
        if (contactsError) {
          console.error('Error updating contacts:', contactsError)
          // No lanzar error, continuar
        }
      }
    }
    
    // Si se marca como canal propio, desmarcar otros canales propios del mismo tenant
    if (data.is_own_channel === true) {
      await supabase
        .from('sales_channels')
        .update({ is_own_channel: false })
        .eq('tenant_id', tenantId)
        .eq('is_own_channel', true)
        .neq('id', id)
    }

    // Actualizar el canal
    const updateData: any = {}
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url
    if (data.is_own_channel !== undefined) updateData.is_own_channel = data.is_own_channel
    if (data.sales_commission !== undefined) updateData.sales_commission = data.sales_commission
    if (data.collection_commission !== undefined) updateData.collection_commission = data.collection_commission
    if (data.apply_tax !== undefined) updateData.apply_tax = data.apply_tax
    if (data.tax_type_id !== undefined) updateData.tax_type_id = data.tax_type_id
    if (data.is_active !== undefined) updateData.is_active = data.is_active
    
    console.log('[updateSalesChannel] Updating sales channel', {
      id,
      updateData,
    })
    
    const { data: channel, error: channelError } = await supabase
      .from('sales_channels')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single()
    
    if (channelError || !channel) {
      console.error('[updateSalesChannel] Error updating sales channel:', channelError)
      throw new Error(channelError?.message || 'Error al actualizar el canal de venta')
    }
    
    console.log('[updateSalesChannel] Sales channel updated successfully', channel)
    
    const updatedChannel = await getSalesChannelById(id, tenantId)
    console.log('[updateSalesChannel] Final channel data', updatedChannel)
    
    return updatedChannel
  } catch (error) {
    console.error('Error in updateSalesChannel:', error)
    throw error
  }
}

// Eliminar un canal de venta (soft delete)
export async function deleteSalesChannel(id: string, tenantId: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return false
    
    // Soft delete: marcar como inactivo
    const { error } = await supabase
      .from('sales_channels')
      .update({ is_active: false })
      .eq('id', id)
      .eq('tenant_id', tenantId)
    
    if (error) {
      console.error('Error deleting sales channel:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteSalesChannel:', error)
    return false
  }
}


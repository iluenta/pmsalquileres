// Servicio para operaciones CRUD de proveedores de servicios
// Integrado con Supabase y multi-tenant

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { CONFIG_CODES } from '@/lib/constants/config'
import type {
  ServiceProvider,
  ServiceProviderWithDetails,
  CreateServiceProviderData,
  UpdateServiceProviderData,
  ServiceProviderService,
  ServiceProviderServiceWithDetails,
  CreateServiceProviderServiceData,
  UpdateServiceProviderServiceData,
} from '@/types/service-providers'
import { getPersonContacts, extractEmailAndPhoneFromContacts } from './bookings'
import type { PersonContactInfo } from '@/types/bookings'

// Función auxiliar para obtener el ID de configuration_value 'service_provider'
async function getServiceProviderPersonTypeId(tenantId: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Buscar el configuration_type 'PERSON_TYPE' usando el código estable
    const { data: configType } = await supabase
      .from('configuration_types')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('code', CONFIG_CODES.PERSON_TYPE)
      .maybeSingle()

    let configTypeId: string | null = configType?.id || null

    if (!configTypeId) {
      // Fallback legacy
      const { data: legacy } = await supabase
        .from('configuration_types')
        .select('id')
        .eq('tenant_id', tenantId)
        .or('name.eq.person_type,name.eq.Tipo de Persona')
        .maybeSingle()
      if (!legacy) return null
      configTypeId = legacy.id
    }

    // Buscar el valor 'service_provider'
    const { data: value } = await supabase
      .from('configuration_values')
      .select('id')
      .eq('configuration_type_id', configTypeId)
      .eq('is_active', true)
      .or('value.eq.service_provider,label.ilike.proveedor%servicio')
      .limit(1)
      .maybeSingle()

    return value?.id || null
  } catch (error) {
    console.error('Error getting service_provider person_type:', error)
    return null
  }
}

// Obtener todos los proveedores de servicios
export async function getServiceProviders(tenantId: string, includeInactive: boolean = false): Promise<ServiceProviderWithDetails[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []

    let query = supabase
      .from('service_providers')
      .select('*')
      .eq('tenant_id', tenantId)

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data: providers, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching service providers:', error)
      return []
    }

    if (!providers || providers.length === 0) {
      return []
    }

    // Obtener información de las personas
    const personIds = providers.map((p: any) => p.person_id)
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
      ; (allContacts || []).forEach((contact: any) => {
        const existing = contactsByPerson.get(contact.person_id) || []
        existing.push(contact)
        contactsByPerson.set(contact.person_id, existing)
      })

    // Combinar personas con sus contactos (email/phone)
    const personsMap = new Map(
      (persons || []).map((p: any) => {
        const contacts = contactsByPerson.get(p.id) || []
        const { email, phone } = extractEmailAndPhoneFromContacts(contacts)
        return [p.id, { ...p, email, phone }]
      })
    )

    // Obtener servicios de cada proveedor
    const providerIds = providers.map((p: any) => p.id)
    const { data: services } = await supabase
      .from('service_provider_services')
      .select('*')
      .in('service_provider_id', providerIds)
      .eq('is_active', true)

    // Obtener tipos de servicio
    const serviceTypeIds = [...new Set((services || []).map((s: any) => s.service_type_id).filter(Boolean))]
    const serviceTypesMap = new Map<string, any>()
    if (serviceTypeIds.length > 0) {
      const { data: serviceTypes } = await supabase
        .from('configuration_values')
        .select('id, label, value, description, color, icon')
        .in('id', serviceTypeIds)

        ; (serviceTypes || []).forEach((st: any) => {
          serviceTypesMap.set(st.id, st)
        })
    }

    // Obtener tipos de impuesto si existen
    const taxTypeIds = [...new Set((services || []).map((s: any) => s.tax_type_id).filter(Boolean))]
    const taxTypesMap = new Map<string, any>()
    if (taxTypeIds.length > 0) {
      const { data: taxTypes } = await supabase
        .from('configuration_values')
        .select('id, label, description')
        .in('id', taxTypeIds)

        ; (taxTypes || []).forEach((taxType: any) => {
          taxTypesMap.set(taxType.id, {
            id: taxType.id,
            label: taxType.label,
            description: taxType.description,
          })
        })
    }

    // Combinar servicios con sus tipos
    const servicesByProvider = new Map<string, ServiceProviderService[]>()
      ; (services || []).forEach((service: any) => {
        const existing = servicesByProvider.get(service.service_provider_id) || []
        existing.push({
          ...service,
          service_type: serviceTypesMap.get(service.service_type_id),
          tax_type: service.tax_type_id ? taxTypesMap.get(service.tax_type_id) : null,
        })
        servicesByProvider.set(service.service_provider_id, existing)
      })

    // Combinar datos
    return providers.map((provider: any) => ({
      ...provider,
      person: personsMap.get(provider.person_id) || null,
      services: servicesByProvider.get(provider.id) || [],
    })).filter((p: any) => p.person !== null) as ServiceProviderWithDetails[]
  } catch (error) {
    console.error('Error in getServiceProviders:', error)
    return []
  }
}

// Obtener un proveedor por ID
export async function getServiceProviderById(id: string, tenantId: string): Promise<ServiceProviderWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Obtener proveedor
    const { data: provider, error } = await supabase
      .from('service_providers')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !provider) {
      console.error('Error fetching service provider:', error)
      return null
    }

    // Obtener persona
    const { data: person } = await supabase
      .from('persons')
      .select('*')
      .eq('id', provider.person_id)
      .single()

    if (!person) {
      console.error('Person not found for service provider')
      return null
    }

    // Obtener contactos de la persona
    const contacts = await getPersonContacts(person.id, tenantId)
    const { email, phone } = extractEmailAndPhoneFromContacts(contacts)

    // Obtener servicios del proveedor
    const { data: services } = await supabase
      .from('service_provider_services')
      .select('*')
      .eq('service_provider_id', id)
      .order('created_at', { ascending: true })

    // Obtener tipos de servicio
    const serviceTypeIds = [...new Set((services || []).map((s: any) => s.service_type_id).filter(Boolean))]
    const serviceTypesMap = new Map<string, any>()
    if (serviceTypeIds.length > 0) {
      const { data: serviceTypes } = await supabase
        .from('configuration_values')
        .select('id, label, value, description, color, icon')
        .in('id', serviceTypeIds)

        ; (serviceTypes || []).forEach((st: any) => {
          serviceTypesMap.set(st.id, st)
        })
    }

    // Obtener tipos de impuesto
    const taxTypeIds = [...new Set((services || []).map((s: any) => s.tax_type_id).filter(Boolean))]
    const taxTypesMap = new Map<string, any>()
    if (taxTypeIds.length > 0) {
      const { data: taxTypes } = await supabase
        .from('configuration_values')
        .select('id, label, description')
        .in('id', taxTypeIds)

        ; (taxTypes || []).forEach((taxType: any) => {
          taxTypesMap.set(taxType.id, {
            id: taxType.id,
            label: taxType.label,
            description: taxType.description,
          })
        })
    }

    return {
      ...provider,
      person: {
        ...person,
        email,
        phone,
      },
      services: (services || []).map((service: any) => ({
        ...service,
        service_type: serviceTypesMap.get(service.service_type_id),
        tax_type: service.tax_type_id ? taxTypesMap.get(service.tax_type_id) : null,
      })),
    }
  } catch (error) {
    console.error('Error in getServiceProviderById:', error)
    return null
  }
}

// Crear un nuevo proveedor de servicios
export async function createServiceProvider(
  data: CreateServiceProviderData,
  tenantId: string
): Promise<ServiceProviderWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Obtener el tipo de persona 'service_provider'
    const personTypeId = await getServiceProviderPersonTypeId(tenantId)
    if (!personTypeId) {
      throw new Error('No se encontró el tipo de persona "Proveedor de Servicios". Ejecuta el script SQL 040_add_service_provider_person_type.sql')
    }

    // Crear la persona
    const { data: person, error: personError } = await supabase
      .from('persons')
      .insert({
        tenant_id: tenantId,
        person_type: personTypeId,
        full_name: data.full_name,
        document_type: data.document_type || null,
        document_number: data.document_number || null,
        notes: data.notes || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single()

    if (personError || !person) {
      console.error('Error creating person for service provider:', personError)
      throw personError || new Error('Error al crear la persona del proveedor')
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
          is_primary: !data.phone,
          is_active: true,
        })
      }
      if (data.phone) {
        contacts.push({
          tenant_id: tenantId,
          person_id: person.id,
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
          console.error('Error creating contacts for service provider:', contactsError)
          // No lanzar error, continuar sin contactos
        }
      }
    }

    // Crear el proveedor de servicios
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .insert({
        tenant_id: tenantId,
        person_id: person.id,
        logo_url: data.logo_url || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single()

    if (providerError || !provider) {
      console.error('Error creating service provider:', providerError)
      throw providerError || new Error('Error al crear el proveedor de servicios')
    }

    // Obtener el proveedor completo con detalles
    return await getServiceProviderById(provider.id, tenantId)
  } catch (error) {
    console.error('Error in createServiceProvider:', error)
    throw error
  }
}

// Actualizar un proveedor de servicios
export async function updateServiceProvider(
  id: string,
  data: UpdateServiceProviderData,
  tenantId: string
): Promise<ServiceProviderWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Obtener el proveedor actual
    const currentProvider = await getServiceProviderById(id, tenantId)
    if (!currentProvider) {
      throw new Error('Proveedor de servicios no encontrado')
    }

    // Actualizar la persona
    const { error: personError } = await supabase
      .from('persons')
      .update({
        full_name: data.full_name,
        document_type: data.document_type !== undefined ? data.document_type : null,
        document_number: data.document_number !== undefined ? data.document_number : null,
        notes: data.notes !== undefined ? data.notes : null,
        is_active: data.is_active !== undefined ? data.is_active : currentProvider.person.is_active,
      })
      .eq('id', currentProvider.person_id)

    if (personError) {
      console.error('Error updating person for service provider:', personError)
      throw personError
    }

    // Actualizar contactos
    if (data.email !== undefined || data.phone !== undefined) {
      // Eliminar contactos existentes
      await supabase
        .from('person_contact_infos')
        .delete()
        .eq('person_id', currentProvider.person_id)
        .eq('tenant_id', tenantId)

      // Crear nuevos contactos
      const contacts: any[] = []
      if (data.email) {
        contacts.push({
          tenant_id: tenantId,
          person_id: currentProvider.person_id,
          contact_type: 'email',
          contact_value: data.email,
          is_primary: !data.phone,
          is_active: true,
        })
      }
      if (data.phone) {
        contacts.push({
          tenant_id: tenantId,
          person_id: currentProvider.person_id,
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
          console.error('Error updating contacts for service provider:', contactsError)
          // No lanzar error, continuar
        }
      }
    }

    // Actualizar el proveedor
    const { error: providerError } = await supabase
      .from('service_providers')
      .update({
        logo_url: data.logo_url !== undefined ? data.logo_url : null,
        is_active: data.is_active !== undefined ? data.is_active : currentProvider.is_active,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (providerError) {
      console.error('Error updating service provider:', providerError)
      throw providerError
    }

    // Obtener el proveedor actualizado
    return await getServiceProviderById(id, tenantId)
  } catch (error) {
    console.error('Error in updateServiceProvider:', error)
    throw error
  }
}

// Eliminar un proveedor de servicios
export async function deleteServiceProvider(id: string, tenantId: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return false

    // Obtener el proveedor para obtener el person_id
    const provider = await getServiceProviderById(id, tenantId)
    if (!provider) {
      return false
    }

    // Eliminar el proveedor (esto eliminará automáticamente los servicios por CASCADE)
    const { error: providerError } = await supabase
      .from('service_providers')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (providerError) {
      console.error('Error deleting service provider:', providerError)
      return false
    }

    // Eliminar la persona (esto eliminará automáticamente los contactos por CASCADE)
    const { error: personError } = await supabase
      .from('persons')
      .delete()
      .eq('id', provider.person_id)
      .eq('tenant_id', tenantId)

    if (personError) {
      console.error('Error deleting person for service provider:', personError)
      // No fallar si ya se eliminó
    }

    return true
  } catch (error) {
    console.error('Error in deleteServiceProvider:', error)
    return false
  }
}

// ===== SERVICIOS DEL PROVEEDOR =====

// Obtener servicios de un proveedor
export async function getServiceProviderServices(
  serviceProviderId: string,
  tenantId: string
): Promise<ServiceProviderServiceWithDetails[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []

    // Verificar que el proveedor pertenece al tenant
    const { data: provider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('id', serviceProviderId)
      .eq('tenant_id', tenantId)
      .single()

    if (!provider) {
      return []
    }

    // Obtener servicios
    const { data: services, error } = await supabase
      .from('service_provider_services')
      .select('*')
      .eq('service_provider_id', serviceProviderId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching service provider services:', error)
      return []
    }

    if (!services || services.length === 0) {
      return []
    }

    // Obtener tipos de servicio
    const serviceTypeIds = [...new Set(services.map((s: any) => s.service_type_id).filter(Boolean))]
    const { data: serviceTypes } = await supabase
      .from('configuration_values')
      .select('id, label, value, description, color, icon')
      .in('id', serviceTypeIds)

    const serviceTypesMap = new Map<string, any>()
      ; (serviceTypes || []).forEach((st: any) => {
        serviceTypesMap.set(st.id, st)
      })

    // Obtener tipos de impuesto
    const taxTypeIds = [...new Set(services.map((s: any) => s.tax_type_id).filter(Boolean))]
    const taxTypesMap = new Map<string, any>()
    if (taxTypeIds.length > 0) {
      const { data: taxTypes } = await supabase
        .from('configuration_values')
        .select('id, label, description')
        .in('id', taxTypeIds)

        ; (taxTypes || []).forEach((taxType: any) => {
          taxTypesMap.set(taxType.id, {
            id: taxType.id,
            label: taxType.label,
            description: taxType.description,
          })
        })
    }

    return services.map((service: any) => ({
      ...service,
      service_type: serviceTypesMap.get(service.service_type_id)!,
      tax_type: service.tax_type_id ? taxTypesMap.get(service.tax_type_id) : null,
    }))
  } catch (error) {
    console.error('Error in getServiceProviderServices:', error)
    return []
  }
}

// Añadir un servicio a un proveedor
export async function addServiceToProvider(
  serviceProviderId: string,
  data: CreateServiceProviderServiceData,
  tenantId: string
): Promise<ServiceProviderServiceWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Verificar que el proveedor pertenece al tenant
    const { data: provider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('id', serviceProviderId)
      .eq('tenant_id', tenantId)
      .single()

    if (!provider) {
      throw new Error('Proveedor de servicios no encontrado')
    }

    // Validar precio según tipo
    if (data.price_type === 'percentage' && (data.price < 0 || data.price > 100)) {
      throw new Error('El porcentaje debe estar entre 0 y 100')
    }
    if (data.price_type === 'fixed' && data.price < 0) {
      throw new Error('El precio fijo debe ser mayor o igual a 0')
    }

    // Crear el servicio
    const { data: service, error } = await supabase
      .from('service_provider_services')
      .insert({
        service_provider_id: serviceProviderId,
        service_type_id: data.service_type_id,
        price_type: data.price_type,
        price: data.price,
        apply_tax: data.apply_tax !== undefined ? data.apply_tax : false,
        tax_type_id: data.tax_type_id || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single()

    if (error || !service) {
      console.error('Error creating service provider service:', error)
      throw error || new Error('Error al crear el servicio del proveedor')
    }

    // Obtener el servicio completo con detalles
    const services = await getServiceProviderServices(serviceProviderId, tenantId)
    return services.find(s => s.id === service.id) || null
  } catch (error) {
    console.error('Error in addServiceToProvider:', error)
    throw error
  }
}

// Actualizar un servicio de un proveedor
export async function updateProviderService(
  serviceId: string,
  data: UpdateServiceProviderServiceData,
  tenantId: string
): Promise<ServiceProviderServiceWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Obtener el servicio actual
    const { data: currentService } = await supabase
      .from('service_provider_services')
      .select('*, service_providers!inner(tenant_id)')
      .eq('id', serviceId)
      .single()

    if (!currentService || (currentService as any).service_providers.tenant_id !== tenantId) {
      throw new Error('Servicio no encontrado')
    }

    // Validar precio si se actualiza
    if (data.price !== undefined) {
      const priceType = data.price_type || currentService.price_type
      if (priceType === 'percentage' && (data.price < 0 || data.price > 100)) {
        throw new Error('El porcentaje debe estar entre 0 y 100')
      }
      if (priceType === 'fixed' && data.price < 0) {
        throw new Error('El precio fijo debe ser mayor o igual a 0')
      }
    }

    // Actualizar el servicio
    const updateData: any = {}
    if (data.price_type !== undefined) updateData.price_type = data.price_type
    if (data.price !== undefined) updateData.price = data.price
    if (data.apply_tax !== undefined) updateData.apply_tax = data.apply_tax
    if (data.tax_type_id !== undefined) updateData.tax_type_id = data.tax_type_id || null
    if (data.is_active !== undefined) updateData.is_active = data.is_active

    const { data: updatedService, error } = await supabase
      .from('service_provider_services')
      .update(updateData)
      .eq('id', serviceId)
      .select()
      .single()

    if (error || !updatedService) {
      console.error('Error updating service provider service:', error)
      throw error || new Error('Error al actualizar el servicio')
    }

    // Obtener el servicio actualizado con detalles
    const services = await getServiceProviderServices(updatedService.service_provider_id, tenantId)
    return services.find(s => s.id === serviceId) || null
  } catch (error) {
    console.error('Error in updateProviderService:', error)
    throw error
  }
}

// Eliminar un servicio de un proveedor
export async function removeServiceFromProvider(serviceId: string, tenantId: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return false

    // Verificar que el servicio pertenece al tenant
    const { data: service } = await supabase
      .from('service_provider_services')
      .select('*, service_providers!inner(tenant_id)')
      .eq('id', serviceId)
      .single()

    if (!service || (service as any).service_providers.tenant_id !== tenantId) {
      throw new Error('Servicio no encontrado')
    }

    // Verificar si el servicio está siendo usado en algún movimiento
    const { data: movementsUsingService } = await supabase
      .from('movements')
      .select('id')
      .eq('service_provider_service_id', serviceId)
      .limit(1)

    if (movementsUsingService && movementsUsingService.length > 0) {
      throw new Error('No se puede eliminar el servicio porque está siendo usado en uno o más movimientos. Elimina primero los movimientos asociados.')
    }

    // Verificar si el servicio está siendo usado en expense items
    const { data: expenseItemsUsingService } = await supabase
      .from('movement_expense_items')
      .select('id')
      .eq('service_provider_service_id', serviceId)
      .limit(1)

    if (expenseItemsUsingService && expenseItemsUsingService.length > 0) {
      // En este caso, podemos eliminar porque tiene ON DELETE SET NULL
      // Pero informamos al usuario
      console.warn('El servicio está siendo usado en expense items, pero se puede eliminar (se establecerá a NULL)')
    }

    // Eliminar el servicio
    const { error } = await supabase
      .from('service_provider_services')
      .delete()
      .eq('id', serviceId)

    if (error) {
      console.error('Error deleting service provider service:', error)
      // Verificar si es un error de foreign key constraint
      if (error.code === '23503' || error.message?.includes('foreign key')) {
        throw new Error('No se puede eliminar el servicio porque está siendo usado en uno o más movimientos. Elimina primero los movimientos asociados.')
      }
      throw new Error(error.message || 'Error al eliminar el servicio')
    }

    return true
  } catch (error: any) {
    console.error('Error in removeServiceFromProvider:', error)
    throw error // Re-lanzar el error para que el endpoint pueda capturarlo
  }
}


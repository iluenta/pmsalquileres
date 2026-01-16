// Servicio para operaciones CRUD de personas
// Integrado con Supabase y multi-tenant

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { CONFIG_CODES } from '@/lib/constants/config'
import type {
  Person,
  PersonWithDetails,
  PersonContactInfo,
  PersonFiscalAddress,
  CreatePersonData,
  UpdatePersonData,
  CreatePersonContactData,
  UpdatePersonContactData,
  CreatePersonAddressData,
  UpdatePersonAddressData,
} from '@/types/persons'
import type { ConfigurationValue } from '@/lib/api/configuration'

// Helper para extraer email y phone de contactos
function extractEmailAndPhoneFromContacts(contacts: PersonContactInfo[]): {
  email: string | null
  phone: string | null
} {
  const email = contacts.find((c) => c.contact_type === 'email' && c.is_active)?.contact_value || null
  const phone = contacts.find((c) => c.contact_type === 'phone' && c.is_active)?.contact_value || null
  return { email, phone }
}

// Obtener todas las personas
export async function getPersons(
  tenantId: string,
  options?: {
    includeInactive?: boolean
    personType?: string // ID de configuration_value
    search?: string
    searchName?: string
    searchDocument?: string
    searchEmail?: string
    searchPhone?: string
    isActive?: boolean | null // null = todos, true = solo activos, false = solo inactivos
    limit?: number
    offset?: number
    enriched?: boolean // true = incluir contactos y direcciones (por defecto true)
  }
): Promise<PersonWithDetails[]> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return []

    // 1. Filtrado por Email o Teléfono a nivel de BD si se solicitan
    let filteredPersonIds: string[] | null = null

    if (options?.searchEmail || options?.searchPhone) {
      let contactQuery = supabase
        .from('person_contact_infos')
        .select('person_id')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)

      if (options.searchEmail) {
        contactQuery = contactQuery.ilike('contact_value', `%${options.searchEmail}%`).eq('contact_type', 'email')
      } else if (options.searchPhone) {
        // Limpiar espacios para búsqueda de teléfono
        const phonePattern = `%${options.searchPhone.replace(/\s/g, '')}%`
        contactQuery = contactQuery.ilike('contact_value', phonePattern).eq('contact_type', 'phone')
      }

      const { data: contacts } = await contactQuery
      filteredPersonIds = (contacts || []).map((c: any) => c.person_id)

      // Si se buscó por contacto y no hay resultados, retornar vacío de inmediato
      if (!filteredPersonIds || filteredPersonIds.length === 0) return []
    }

    // 2. Query principal de personas
    let query = supabase
      .from('persons')
      .select('*')
      .eq('tenant_id', tenantId)

    // Filtro de IDs resultante de búsqueda por contactos
    if (filteredPersonIds && filteredPersonIds.length > 0) {
      query = query.in('id', filteredPersonIds)
    }

    // Filtro de estado
    if (options?.isActive !== null && options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive)
    } else if (!options?.includeInactive) {
      query = query.eq('is_active', true)
    }

    if (options?.personType) {
      query = query.eq('person_type', options.personType)
    }

    // Búsqueda general o específica por nombre/documento
    if (options?.search) {
      const searchPattern = `%${options.search}%`
      query = query.or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},full_name.ilike.${searchPattern},document_number.ilike.${searchPattern}`)
    }

    if (options?.searchName) {
      const searchPattern = `%${options.searchName}%`
      query = query.or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},full_name.ilike.${searchPattern}`)
    }

    if (options?.searchDocument) {
      const searchPattern = `%${options.searchDocument}%`
      query = query.ilike('document_number', searchPattern)
    }

    // Aplicar paginación
    if (options?.limit !== undefined) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    const { data: persons, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching persons:', error)
      return []
    }

    if (!persons || persons.length === 0) {
      return []
    }

    // 3. Enriquecimiento de datos (solo si se solicita o por defecto)
    const isEnriched = options?.enriched !== false
    const personIds = persons.map((p: any) => p.id)

    // Obtener tipos de persona (siempre necesario para mostrar el label)
    const personTypeIds = [...new Set(persons.map((p: any) => p.person_type).filter(Boolean))]
    const personTypesMap = new Map<string, ConfigurationValue>()
    if (personTypeIds.length > 0) {
      const { data: personTypes } = await supabase
        .from('configuration_values')
        .select('id, label, value, description, color, icon')
        .in('id', personTypeIds)

        ; (personTypes || []).forEach((pt: any) => {
          personTypesMap.set(pt.id, pt)
        })
    }

    // Obtener contactos y direcciones solo si es "enriched"
    const contactsByPerson = new Map<string, PersonContactInfo[]>()
    const addressesByPerson = new Map<string, PersonFiscalAddress[]>()

    if (isEnriched) {
      const [{ data: allContacts }, { data: allAddresses }] = await Promise.all([
        supabase
          .from('person_contact_infos')
          .select('*')
          .in('person_id', personIds)
          .eq('tenant_id', tenantId)
          .eq('is_active', true)
          .order('is_primary', { ascending: false }),
        supabase
          .from('person_fiscal_addresses')
          .select('*')
          .in('person_id', personIds)
          .eq('tenant_id', tenantId)
          .eq('is_active', true)
          .order('is_primary', { ascending: false })
      ])

        ; (allContacts || []).forEach((contact: any) => {
          const existing = contactsByPerson.get(contact.person_id) || []
          existing.push(contact)
          contactsByPerson.set(contact.person_id, existing)
        })

        ; (allAddresses || []).forEach((address: any) => {
          const existing = addressesByPerson.get(address.person_id) || []
          existing.push(address)
          addressesByPerson.set(address.person_id, existing)
        })
    }

    // Combinar datos
    return persons.map((person: any) => {
      const contacts = contactsByPerson.get(person.id) || []
      const addresses = addressesByPerson.get(person.id) || []
      const { email, phone } = extractEmailAndPhoneFromContacts(contacts)

      return {
        ...person,
        person_type_value: personTypesMap.get(person.person_type),
        contacts,
        addresses,
        email,
        phone,
      }
    })
  } catch (error) {
    console.error('Error in getPersons:', error)
    return []
  }
}

// Obtener una persona por ID
export async function getPersonById(id: string, tenantId: string): Promise<PersonWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    const { data: person, error } = await supabase
      .from('persons')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (error || !person) {
      console.error('Error fetching person:', error)
      return null
    }

    // Obtener tipo de persona
    const { data: personType } = await supabase
      .from('configuration_values')
      .select('id, label, value, description, color, icon')
      .eq('id', person.person_type)
      .single()

    // Obtener contactos
    const { data: contacts } = await supabase
      .from('person_contact_infos')
      .select('*')
      .eq('person_id', id)
      .eq('tenant_id', tenantId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })

    // Obtener direcciones
    const { data: addresses } = await supabase
      .from('person_fiscal_addresses')
      .select('*')
      .eq('person_id', id)
      .eq('tenant_id', tenantId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })

    const { email, phone } = extractEmailAndPhoneFromContacts(contacts || [])

    return {
      ...person,
      person_type_value: personType || undefined,
      contacts: contacts || [],
      addresses: addresses || [],
      email,
      phone,
    }
  } catch (error) {
    console.error('Error in getPersonById:', error)
    return null
  }
}

// Función auxiliar para obtener el tipo de persona "guest"
async function getGuestPersonTypeId(tenantId: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Obtener configuration_type 'PERSON_TYPE' usando el código estable
    const { data: personTypeConfig } = await supabase
      .from('configuration_types')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('code', CONFIG_CODES.PERSON_TYPE)
      .maybeSingle()

    let configTypeId: string | null = personTypeConfig?.id || null

    if (!configTypeId) {
      // Fallback legacy
      const { data: legacy } = await supabase
        .from('configuration_types')
        .select('id')
        .eq('tenant_id', tenantId)
        .or('name.eq.person_type,name.eq.Tipo de Persona,name.eq.Tipos de Persona')
        .maybeSingle()
      if (!legacy) return null
      configTypeId = legacy.id
    }

    // Obtener configuration_value 'guest' (buscar por value o label)
    const { data: guestValue } = await supabase
      .from('configuration_values')
      .select('id')
      .eq('configuration_type_id', configTypeId)
      .eq('is_active', true)
      .or('value.eq.guest,label.ilike.huésped,label.ilike.guest')
      .maybeSingle()

    return guestValue?.id || null
  } catch (error) {
    console.error('Error getting guest person_type:', error)
    return null
  }
}

// Crear una nueva persona
export async function createPerson(
  data: CreatePersonData,
  tenantId: string
): Promise<PersonWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Si no se proporciona person_type, obtener el tipo "guest" automáticamente
    let personTypeId: string | undefined = data.person_type
    if (!personTypeId) {
      const guestTypeId = await getGuestPersonTypeId(tenantId)
      if (!guestTypeId) {
        throw new Error('No se pudo obtener el tipo de persona "guest". Por favor, verifica la configuración.')
      }
      personTypeId = guestTypeId
    }

    const { data: person, error } = await supabase
      .from('persons')
      .insert({
        tenant_id: tenantId,
        person_type: personTypeId,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        full_name: data.full_name || null,
        document_type: data.document_type || null,
        document_number: data.document_number || null,
        birth_date: data.birth_date || null,
        nationality: data.nationality || null,
        notes: data.notes || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single()

    if (error || !person) {
      console.error('Error creating person:', error)
      throw error || new Error('Error al crear la persona')
    }

    // Crear contactos si se proporcionaron
    if (data.email || data.phone) {
      const contactInserts: any[] = []

      if (data.email) {
        contactInserts.push({
          tenant_id: tenantId,
          person_id: person.id,
          contact_type: 'email',
          contact_value: data.email,
          is_primary: true,
          is_active: true,
        })
      }

      if (data.phone) {
        contactInserts.push({
          tenant_id: tenantId,
          person_id: person.id,
          contact_type: 'phone',
          contact_value: data.phone,
          is_primary: !data.email, // Solo es primario si no hay email
          is_active: true,
        })
      }

      if (contactInserts.length > 0) {
        const { error: contactsError } = await supabase
          .from('person_contact_infos')
          .insert(contactInserts)

        if (contactsError) {
          console.error('Error creating contacts:', contactsError)
          // No lanzar error, solo loguear - la persona ya se creó
        }
      }
    }

    // Retornar la persona con detalles
    return await getPersonById(person.id, tenantId)
  } catch (error) {
    console.error('Error in createPerson:', error)
    throw error
  }
}

// Actualizar una persona
export async function updatePerson(
  id: string,
  data: UpdatePersonData,
  tenantId: string
): Promise<PersonWithDetails | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    const updateData: any = {}
    if (data.person_type !== undefined) updateData.person_type = data.person_type
    if (data.first_name !== undefined) updateData.first_name = data.first_name
    if (data.last_name !== undefined) updateData.last_name = data.last_name
    if (data.full_name !== undefined) updateData.full_name = data.full_name
    if (data.document_type !== undefined) updateData.document_type = data.document_type
    if (data.document_number !== undefined) updateData.document_number = data.document_number
    if (data.birth_date !== undefined) updateData.birth_date = data.birth_date
    if (data.nationality !== undefined) updateData.nationality = data.nationality
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.is_active !== undefined) updateData.is_active = data.is_active

    const { error } = await supabase
      .from('persons')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error updating person:', error)
      throw error
    }

    return await getPersonById(id, tenantId)
  } catch (error) {
    console.error('Error in updatePerson:', error)
    throw error
  }
}

// Eliminar una persona
export async function deletePerson(id: string, tenantId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return { success: false, error: "Error de conexión con la base de datos" }

    // Verificar si la persona tiene reservas asociadas ANTES de intentar eliminar
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('person_id', id)
      .eq('tenant_id', tenantId)
      .limit(1)

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError)
      // Si hay error en la verificación, continuar y dejar que el delete falle con el error de foreign key
    } else if (bookings && bookings.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar esta persona porque tiene reservas asociadas. Por favor, elimine primero las reservas o marque la persona como inactiva."
      }
    }

    // Verificar si la persona está asociada a un proveedor de servicios
    const { data: serviceProviders, error: spError } = await supabase
      .from('service_providers')
      .select('id')
      .eq('person_id', id)
      .eq('tenant_id', tenantId)
      .limit(1)

    if (spError) {
      console.error('Error checking service providers:', spError)
    } else if (serviceProviders && serviceProviders.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar esta persona porque está asociada a un proveedor de servicios. Elimine primero el proveedor de servicios."
      }
    }

    // Verificar si la persona está asociada a un canal de venta
    const { data: salesChannels, error: scError } = await supabase
      .from('sales_channels')
      .select('id')
      .eq('person_id', id)
      .eq('tenant_id', tenantId)
      .limit(1)

    if (scError) {
      console.error('Error checking sales channels:', scError)
    } else if (salesChannels && salesChannels.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar esta persona porque está asociada a un canal de venta. Elimine primero el canal de venta."
      }
    }

    // Si no hay referencias, proceder con la eliminación
    const { error } = await supabase
      .from('persons')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error deleting person:', error)

      // Detectar error de foreign key constraint (por si acaso hay otras referencias)
      if (error.code === '23503') {
        const errorText = `${error.details || ''} ${error.message || ''}`.toLowerCase()
        let errorMessage = "No se puede eliminar esta persona porque está siendo utilizada en el sistema."

        if (errorText.includes('bookings') || errorText.includes('reserva')) {
          errorMessage = "No se puede eliminar esta persona porque tiene reservas asociadas. Por favor, elimine primero las reservas o marque la persona como inactiva."
        } else if (errorText.includes('service_providers') || errorText.includes('proveedor')) {
          errorMessage = "No se puede eliminar esta persona porque está asociada a un proveedor de servicios. Elimine primero el proveedor de servicios."
        } else if (errorText.includes('sales_channels') || errorText.includes('canal')) {
          errorMessage = "No se puede eliminar esta persona porque está asociada a un canal de venta. Elimine primero el canal de venta."
        }

        return { success: false, error: errorMessage }
      }

      return { success: false, error: error.message || "Error al eliminar la persona" }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error in deletePerson:', error)
    return { success: false, error: error.message || "Error inesperado al eliminar la persona" }
  }
}

// ===== CONTACTOS =====

// Añadir contacto a una persona
export async function addPersonContact(
  personId: string,
  data: CreatePersonContactData,
  tenantId: string
): Promise<PersonContactInfo | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Si se marca como primario, desmarcar otros del mismo tipo
    if (data.is_primary) {
      await supabase
        .from('person_contact_infos')
        .update({ is_primary: false })
        .eq('person_id', personId)
        .eq('tenant_id', tenantId)
        .eq('contact_type', data.contact_type)
    }

    const { data: contact, error } = await supabase
      .from('person_contact_infos')
      .insert({
        tenant_id: tenantId,
        person_id: personId,
        contact_type: data.contact_type,
        contact_value: data.contact_value,
        contact_name: data.contact_name || null,
        is_primary: data.is_primary || false,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single()

    if (error || !contact) {
      console.error('Error adding contact:', error)
      throw error || new Error('Error al añadir el contacto')
    }

    return contact
  } catch (error) {
    console.error('Error in addPersonContact:', error)
    throw error
  }
}

// Actualizar contacto
export async function updatePersonContact(
  contactId: string,
  data: UpdatePersonContactData,
  tenantId: string
): Promise<PersonContactInfo | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Obtener el contacto actual para saber el person_id
    const { data: currentContact } = await supabase
      .from('person_contact_infos')
      .select('person_id, contact_type')
      .eq('id', contactId)
      .eq('tenant_id', tenantId)
      .single()

    if (!currentContact) {
      throw new Error('Contacto no encontrado')
    }

    // Si se marca como primario, desmarcar otros del mismo tipo
    if (data.is_primary) {
      await supabase
        .from('person_contact_infos')
        .update({ is_primary: false })
        .eq('person_id', currentContact.person_id)
        .eq('tenant_id', tenantId)
        .eq('contact_type', data.contact_type || currentContact.contact_type)
        .neq('id', contactId)
    }

    const updateData: any = {}
    if (data.contact_type !== undefined) updateData.contact_type = data.contact_type
    if (data.contact_value !== undefined) updateData.contact_value = data.contact_value
    if (data.contact_name !== undefined) updateData.contact_name = data.contact_name || null
    if (data.is_primary !== undefined) updateData.is_primary = data.is_primary
    if (data.is_active !== undefined) updateData.is_active = data.is_active

    const { data: contact, error } = await supabase
      .from('person_contact_infos')
      .update(updateData)
      .eq('id', contactId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error || !contact) {
      console.error('Error updating contact:', error)
      throw error || new Error('Error al actualizar el contacto')
    }

    return contact
  } catch (error) {
    console.error('Error in updatePersonContact:', error)
    throw error
  }
}

// Eliminar contacto
export async function deletePersonContact(contactId: string, tenantId: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return false

    const { error } = await supabase
      .from('person_contact_infos')
      .delete()
      .eq('id', contactId)
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error deleting contact:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deletePersonContact:', error)
    return false
  }
}

// ===== DIRECCIONES =====

// Añadir dirección a una persona
export async function addPersonAddress(
  personId: string,
  data: CreatePersonAddressData,
  tenantId: string
): Promise<PersonFiscalAddress | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Si se marca como primaria, desmarcar otras
    if (data.is_primary) {
      await supabase
        .from('person_fiscal_addresses')
        .update({ is_primary: false })
        .eq('person_id', personId)
        .eq('tenant_id', tenantId)
    }

    const { data: address, error } = await supabase
      .from('person_fiscal_addresses')
      .insert({
        tenant_id: tenantId,
        person_id: personId,
        street: data.street || null,
        number: data.number || null,
        floor: data.floor || null,
        door: data.door || null,
        city: data.city || null,
        province: data.province || null,
        postal_code: data.postal_code || null,
        country: data.country || null,
        is_primary: data.is_primary || false,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .select()
      .single()

    if (error || !address) {
      console.error('Error adding address:', error)
      throw error || new Error('Error al añadir la dirección')
    }

    return address
  } catch (error) {
    console.error('Error in addPersonAddress:', error)
    throw error
  }
}

// Actualizar dirección
export async function updatePersonAddress(
  addressId: string,
  data: UpdatePersonAddressData,
  tenantId: string
): Promise<PersonFiscalAddress | null> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return null

    // Obtener la dirección actual para saber el person_id
    const { data: currentAddress } = await supabase
      .from('person_fiscal_addresses')
      .select('person_id')
      .eq('id', addressId)
      .eq('tenant_id', tenantId)
      .single()

    if (!currentAddress) {
      throw new Error('Dirección no encontrada')
    }

    // Si se marca como primaria, desmarcar otras
    if (data.is_primary) {
      await supabase
        .from('person_fiscal_addresses')
        .update({ is_primary: false })
        .eq('person_id', currentAddress.person_id)
        .eq('tenant_id', tenantId)
        .neq('id', addressId)
    }

    const updateData: any = {}
    if (data.street !== undefined) updateData.street = data.street
    if (data.number !== undefined) updateData.number = data.number
    if (data.floor !== undefined) updateData.floor = data.floor
    if (data.door !== undefined) updateData.door = data.door
    if (data.city !== undefined) updateData.city = data.city
    if (data.province !== undefined) updateData.province = data.province
    if (data.postal_code !== undefined) updateData.postal_code = data.postal_code
    if (data.country !== undefined) updateData.country = data.country
    if (data.is_primary !== undefined) updateData.is_primary = data.is_primary
    if (data.is_active !== undefined) updateData.is_active = data.is_active

    const { data: address, error } = await supabase
      .from('person_fiscal_addresses')
      .update(updateData)
      .eq('id', addressId)
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error || !address) {
      console.error('Error updating address:', error)
      throw error || new Error('Error al actualizar la dirección')
    }

    return address
  } catch (error) {
    console.error('Error in updatePersonAddress:', error)
    throw error
  }
}

// Eliminar dirección
export async function deletePersonAddress(addressId: string, tenantId: string): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) return false

    const { error } = await supabase
      .from('person_fiscal_addresses')
      .delete()
      .eq('id', addressId)
      .eq('tenant_id', tenantId)

    if (error) {
      console.error('Error deleting address:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deletePersonAddress:', error)
    return false
  }
}


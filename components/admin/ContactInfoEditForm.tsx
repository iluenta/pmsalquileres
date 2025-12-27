"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { GuideContactInfo, CreateContactInfoData, UpdateContactInfoData, InterestPhoneCategory, InterestPhoneContact } from "@/types/guides"
import { 
  getGuideContactInfoClient, 
  createGuideContactInfoClient, 
  updateGuideContactInfoClient 
} from "@/lib/api/guides-client"
import { Loader2, AlertCircle, Plus, X, CheckCircle2 } from "lucide-react"

interface ContactInfoEditFormProps {
  guideId: string
}

export function ContactInfoEditForm({ guideId }: ContactInfoEditFormProps) {
  const [contactInfo, setContactInfo] = useState<GuideContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [hostNames, setHostNames] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [hostMessage, setHostMessage] = useState("")
  const [supportPersonName, setSupportPersonName] = useState("")
  const [supportPersonPhone, setSupportPersonPhone] = useState("")
  const [supportPersonWhatsapp, setSupportPersonWhatsapp] = useState("")
  
  // Emergency numbers
  const [emergencias, setEmergencias] = useState("112")
  const [policiaLocal, setPoliciaLocal] = useState("092")
  const [guardiaCivil, setGuardiaCivil] = useState("062")
  const [bomberos, setBomberos] = useState("080")
  
  // Interest phones categories
  const [interestPhones, setInterestPhones] = useState<InterestPhoneCategory[]>([])
  
  // Service issues
  const [serviceIssues, setServiceIssues] = useState<string[]>([])
  const [newServiceIssue, setNewServiceIssue] = useState("")
  const [serviceIntroText, setServiceIntroText] = useState("")

  // Load existing data
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        setLoading(true)
        const data = await getGuideContactInfoClient(guideId)
        
        if (data) {
          setContactInfo(data)
          setHostNames(data.host_names || "")
          setPhone(data.phone || "")
          setEmail(data.email || "")
          setWhatsapp(data.whatsapp || "")
          setHostMessage(data.host_message || "")
          setSupportPersonName(data.support_person_name || "")
          setSupportPersonPhone(data.support_person_phone || "")
          setSupportPersonWhatsapp(data.support_person_whatsapp || "")
          
          // Parse interest_phones
          if (data.interest_phones && Array.isArray(data.interest_phones)) {
            setInterestPhones(data.interest_phones)
          } else {
            setInterestPhones([])
          }
          
          // Parse emergency_numbers
          if (data.emergency_numbers && typeof data.emergency_numbers === 'object') {
            setEmergencias(data.emergency_numbers.emergencias || "112")
            setPoliciaLocal(data.emergency_numbers.policia_local || "092")
            setGuardiaCivil(data.emergency_numbers.guardia_civil || "062")
            setBomberos(data.emergency_numbers.bomberos || "080")
          } else {
            // Fallback to individual fields
            setEmergencias("112")
            setPoliciaLocal(data.police_contact || "092")
            setGuardiaCivil(data.police_contact || "062")
            setBomberos(data.fire_contact || "080")
          }
          
          setServiceIssues(data.service_issues || [])
          setServiceIntroText("Si encuentras cualquier problema en el apartamento durante tu estancia, por favor contáctanos inmediatamente:")
        }
      } catch (err) {
        console.error("Error loading contact info:", err)
        setError("Error al cargar la información de contacto")
      } finally {
        setLoading(false)
      }
    }

    if (guideId) {
      loadContactInfo()
    }
  }, [guideId])

  const handleAddServiceIssue = () => {
    if (newServiceIssue.trim()) {
      setServiceIssues([...serviceIssues, newServiceIssue.trim()])
      setNewServiceIssue("")
    }
  }

  const handleRemoveServiceIssue = (index: number) => {
    setServiceIssues(serviceIssues.filter((_, i) => i !== index))
  }

  // Interest phones management
  const getCategoryIndex = (category: InterestPhoneCategory['category']) => {
    return interestPhones.findIndex(cat => cat.category === category)
  }

  const getCategoryContacts = (category: InterestPhoneCategory['category']) => {
    const index = getCategoryIndex(category)
    return index >= 0 ? interestPhones[index].contacts : []
  }

  const addContactToCategory = (category: InterestPhoneCategory['category'], contact: InterestPhoneContact) => {
    const index = getCategoryIndex(category)
    if (index >= 0) {
      const updated = [...interestPhones]
      updated[index].contacts = [...updated[index].contacts, contact]
      setInterestPhones(updated)
    } else {
      setInterestPhones([...interestPhones, { category, contacts: [contact] }])
    }
  }

  const removeContactFromCategory = (category: InterestPhoneCategory['category'], contactIndex: number) => {
    const index = getCategoryIndex(category)
    if (index >= 0) {
      const updated = [...interestPhones]
      updated[index].contacts = updated[index].contacts.filter((_, i) => i !== contactIndex)
      if (updated[index].contacts.length === 0) {
        setInterestPhones(updated.filter((_, i) => i !== index))
      } else {
        setInterestPhones(updated)
      }
    }
  }

  const updateContactInCategory = (
    category: InterestPhoneCategory['category'],
    contactIndex: number,
    updatedContact: InterestPhoneContact
  ) => {
    const index = getCategoryIndex(category)
    if (index >= 0) {
      const updated = [...interestPhones]
      updated[index].contacts[contactIndex] = updatedContact
      setInterestPhones(updated)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      // Build emergency_numbers object
      const emergencyNumbers = {
        emergencias: emergencias || "112",
        policia_local: policiaLocal || "092",
        guardia_civil: guardiaCivil || "062",
        bomberos: bomberos || "080"
      }

      if (contactInfo) {
        // Update existing
        const updateData: UpdateContactInfoData = {
          host_names: hostNames || null,
          phone: phone || null,
          email: email || null,
          whatsapp: whatsapp || null,
          host_message: hostMessage || null,
          support_person_name: supportPersonName || null,
          support_person_phone: supportPersonPhone || null,
          support_person_whatsapp: supportPersonWhatsapp || null,
          emergency_numbers: emergencyNumbers,
          interest_phones: interestPhones.length > 0 ? interestPhones : null,
          service_issues: serviceIssues.length > 0 ? serviceIssues : null
        }

        const updated = await updateGuideContactInfoClient(contactInfo.id, updateData)
        
        if (updated) {
          setContactInfo(updated)
          setSuccess(true)
          setTimeout(() => setSuccess(false), 3000)
        } else {
          setError("Error al actualizar la información de contacto")
        }
      } else {
        // Create new
        const createData: CreateContactInfoData = {
          guide_id: guideId,
          host_names: hostNames || null,
          phone: phone || null,
          email: email || null,
          whatsapp: whatsapp || null,
          host_message: hostMessage || null,
          support_person_name: supportPersonName || null,
          support_person_phone: supportPersonPhone || null,
          support_person_whatsapp: supportPersonWhatsapp || null,
          emergency_numbers: emergencyNumbers,
          interest_phones: interestPhones.length > 0 ? interestPhones : null,
          service_issues: serviceIssues.length > 0 ? serviceIssues : null
        }

        const created = await createGuideContactInfoClient(createData)
        
        if (created) {
          setContactInfo(created)
          setSuccess(true)
          setTimeout(() => setSuccess(false), 3000)
        } else {
          setError("Error al crear la información de contacto")
        }
      }
    } catch (err) {
      console.error("Error saving contact info:", err)
      setError("Error al guardar la información de contacto")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Información de contacto guardada correctamente
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-address-book text-blue-600"></i>
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Sección: Tus Anfitriones */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Tus Anfitriones</h3>
              <p className="text-sm text-gray-500">Información de contacto de los anfitriones</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host_names">Nombres de los Anfitriones</Label>
                <Input
                  id="host_names"
                  value={hostNames}
                  onChange={(e) => setHostNames(e.target.value)}
                  placeholder="Ej: Sonia y Pedro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +34 600 000 000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: info@veratespera.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: +34 600 000 000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="host_message">Mensaje para los Huéspedes (Opcional)</Label>
              <Textarea
                id="host_message"
                value={hostMessage}
                onChange={(e) => setHostMessage(e.target.value)}
                placeholder="Ej: Estamos disponibles para cualquier duda o incidencia durante tu estancia..."
                rows={3}
              />
            </div>

            {/* Persona de Soporte */}
            <div className="border-t pt-4 mt-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Persona de Soporte</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support_person_name">Nombre</Label>
                  <Input
                    id="support_person_name"
                    value={supportPersonName}
                    onChange={(e) => setSupportPersonName(e.target.value)}
                    placeholder="Ej: María García"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support_person_phone">Teléfono</Label>
                  <Input
                    id="support_person_phone"
                    type="tel"
                    value={supportPersonPhone}
                    onChange={(e) => setSupportPersonPhone(e.target.value)}
                    placeholder="Ej: +34 600 000 000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Teléfonos de Interés */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Teléfonos de Interés</h3>
              <p className="text-sm text-gray-500">Números de emergencia y servicios de interés</p>
            </div>

            {/* Números básicos de emergencia */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencias">Emergencias</Label>
                <Input
                  id="emergencias"
                  value={emergencias}
                  onChange={(e) => setEmergencias(e.target.value)}
                  placeholder="112"
                />
                <p className="text-xs text-gray-500">Número general de emergencias</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="policia_local">Policía Local</Label>
                <Input
                  id="policia_local"
                  value={policiaLocal}
                  onChange={(e) => setPoliciaLocal(e.target.value)}
                  placeholder="092"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardia_civil">Guardia Civil</Label>
                <Input
                  id="guardia_civil"
                  value={guardiaCivil}
                  onChange={(e) => setGuardiaCivil(e.target.value)}
                  placeholder="062"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bomberos">Bomberos</Label>
                <Input
                  id="bomberos"
                  value={bomberos}
                  onChange={(e) => setBomberos(e.target.value)}
                  placeholder="080"
                />
              </div>
            </div>

            {/* Categorías adicionales */}
            {(['farmacia', 'veterinario', 'medico', 'otros'] as const).map((category) => {
              const categoryLabel = {
                farmacia: 'Farmacia',
                veterinario: 'Veterinario',
                medico: 'Médico',
                otros: 'Otros'
              }[category]

              const contacts = getCategoryContacts(category)

              return (
                <div key={category} className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-gray-800">{categoryLabel}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        addContactToCategory(category, {
                          name: '',
                          phone: '',
                          address: null,
                          description: null
                        })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar {categoryLabel}
                    </Button>
                  </div>

                  {contacts.length > 0 ? (
                    <div className="space-y-3">
                      {contacts.map((contact, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 grid md:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label>Nombre</Label>
                                  <Input
                                    value={contact.name}
                                    onChange={(e) => {
                                      updateContactInCategory(category, index, {
                                        ...contact,
                                        name: e.target.value
                                      })
                                    }}
                                    placeholder={`Nombre del ${categoryLabel.toLowerCase()}`}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Teléfono</Label>
                                  <Input
                                    type="tel"
                                    value={contact.phone}
                                    onChange={(e) => {
                                      updateContactInCategory(category, index, {
                                        ...contact,
                                        phone: e.target.value
                                      })
                                    }}
                                    placeholder="+34 950 123 456"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Dirección (Opcional)</Label>
                                  <Input
                                    value={contact.address || ''}
                                    onChange={(e) => {
                                      updateContactInCategory(category, index, {
                                        ...contact,
                                        address: e.target.value || null
                                      })
                                    }}
                                    placeholder="Calle Principal 10"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Descripción (Opcional)</Label>
                                  <Input
                                    value={contact.description || ''}
                                    onChange={(e) => {
                                      updateContactInCategory(category, index, {
                                        ...contact,
                                        description: e.target.value || null
                                      })
                                    }}
                                    placeholder="Ej: Abre 24h"
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeContactFromCategory(category, index)}
                                className="text-red-600 hover:text-red-700 ml-2"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No hay contactos de {categoryLabel.toLowerCase()} agregados
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sección: Servicios del Apartamento */}
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Servicios del Apartamento</h3>
              <p className="text-sm text-gray-500">Lista de problemas comunes que los huéspedes pueden reportar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_intro">Texto Introductorio</Label>
              <Textarea
                id="service_intro"
                value={serviceIntroText}
                onChange={(e) => setServiceIntroText(e.target.value)}
                placeholder="Si encuentras cualquier problema en el apartamento durante tu estancia, por favor contáctanos inmediatamente:"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Problemas Comunes</Label>
              <div className="flex gap-2">
                <Input
                  value={newServiceIssue}
                  onChange={(e) => setNewServiceIssue(e.target.value)}
                  placeholder="Ej: Problemas con el aire acondicionado"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddServiceIssue()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddServiceIssue} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>

              {serviceIssues.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {serviceIssues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">{issue}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveServiceIssue(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2 italic">
                  No hay problemas comunes agregados. Agrega algunos para ayudar a los huéspedes.
                </p>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving} className="flex-1 md:flex-none">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {contactInfo ? "Actualizar Información" : "Guardar Información"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


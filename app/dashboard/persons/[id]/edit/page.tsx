import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getPersonById, updatePerson } from "@/lib/api/persons"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PersonForm } from "@/components/persons/PersonForm"
import type { UpdatePersonData } from "@/types/persons"

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userInfo } = await supabase.rpc("get_user_info", {
    p_user_id: user.id,
  })

  if (!userInfo || userInfo.length === 0) {
    redirect("/login")
  }

  const tenantId = userInfo[0].tenant_id

  // Obtener la persona
  const person = await getPersonById(id, tenantId)

  if (!person) {
    redirect("/dashboard/persons")
  }

  const handleSave = async (data: UpdatePersonData): Promise<boolean> => {
    "use server"
    const result = await updatePerson(id, data, tenantId)
    return result !== null
  }

  const getPersonDisplayName = () => {
    if (person.full_name) {
      return person.full_name
    }
    if (person.first_name || person.last_name) {
      return `${person.first_name || ""} ${person.last_name || ""}`.trim()
    }
    return "Persona"
  }

  return (
    <div className="h-full">
      <PersonForm
        person={person}
        tenantId={tenantId}
        onSave={handleSave}
        title={`Editar ${getPersonDisplayName()}`}
        subtitle="Modifica los datos del perfil y sus contactos"
      />
    </div>
  )
}


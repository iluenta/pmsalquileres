import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PersonForm } from "@/components/persons/PersonForm"
import { createPerson } from "@/lib/api/persons"
import type { CreatePersonData, UpdatePersonData } from "@/types/persons"

export default async function NewPersonPage() {
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

  const handleSave = async (data: CreatePersonData | UpdatePersonData): Promise<boolean> => {
    "use server"
    // Asegurar que tenemos los campos requeridos para CreatePersonData
    if (!data.person_type) {
      throw new Error("Faltan campos requeridos para crear la persona")
    }
    const createData: CreatePersonData = {
      person_type: data.person_type,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: data.full_name,
      document_type: data.document_type,
      document_number: data.document_number,
      birth_date: data.birth_date,
      nationality: data.nationality,
      notes: data.notes,
      is_active: data.is_active ?? true,
    }
    const result = await createPerson(createData, tenantId)
    return result !== null
  }

  return (
    <div className="h-full">
      <PersonForm
        tenantId={tenantId}
        onSave={handleSave}
        title="Nueva Persona"
        subtitle="Registra un nuevo huésped, propietario o proveedor"
      />
    </div>
  )
}

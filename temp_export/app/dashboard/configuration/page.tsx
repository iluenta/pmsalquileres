import { getConfigurationTypes } from "@/lib/api/configuration"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings2, ChevronRight, Edit, MoreVertical } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function ConfigurationPage() {
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
  const configTypes = await getConfigurationTypes(tenantId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Gestiona las tablas de configuración y valores del sistema</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/configuration/types/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Tipo
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {configTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle>
                    {type.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{type.description || "Sin descripción"}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={type.is_active ? "default" : "secondary"}>
                    {type.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/configuration/types/${type.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar tipo
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <Settings2 className="inline h-4 w-4 mr-1" />
                  {type.values_count} valores configurados
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/configuration/types/${type.id}`}>
                    Ver valores
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {configTypes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay tipos de configuración</p>
            <p className="text-sm text-muted-foreground mb-4">Comienza creando tu primer tipo de configuración</p>
            <Button asChild>
              <Link href="/dashboard/configuration/types/new">
                <Plus className="mr-2 h-4 w-4" />
                Crear Tipo de Configuración
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

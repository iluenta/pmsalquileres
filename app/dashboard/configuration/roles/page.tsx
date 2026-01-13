import { getRoles, getPermissions } from "@/lib/api/rbac"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { RolesTable } from "@/components/rbac/roles-table"
import { TeamManagement } from "@/components/rbac/team-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function RolesPage() {
    const supabase = await getSupabaseServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const roles = await getRoles()
    const permissions = await getPermissions()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/configuration">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Shield className="h-8 w-8 text-primary" />
                            Roles y Permisos
                        </h1>
                        <p className="text-muted-foreground">
                            Define niveles de acceso personalizados para tu equipo
                        </p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="roles" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="roles">Definición de Roles</TabsTrigger>
                    <TabsTrigger value="team">Miembros del Equipo</TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="space-y-4">
                    <RolesTable initialRoles={roles} allPermissions={permissions} />
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Asignación de Roles</CardTitle>
                            <CardDescription>
                                Gestiona los roles de acceso para cada miembro de tu equipo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TeamManagement allRoles={roles} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

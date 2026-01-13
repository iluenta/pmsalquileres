"use client"

import { useState, useEffect } from "react"
import { Role } from "@/lib/api/rbac"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, UserCog, Mail } from "lucide-react"

interface User {
    id: string
    email: string
    full_name: string
    is_admin: boolean
    roles?: Role[]
}

interface TeamManagementProps {
    allRoles: Role[]
}

export function TeamManagement({ allRoles }: TeamManagementProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [savingId, setSavingId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchUsersAndRoles()
    }, [])

    const fetchUsersAndRoles = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/rbac/users")
            const teamData = await response.json()

            // Para cada usuario, obtener sus roles
            const usersWithRoles = await Promise.all(
                teamData.map(async (u: any) => {
                    const rolesRes = await fetch(`/api/rbac/users/${u.id}/roles`)
                    const rolesData = await rolesRes.json()
                    return { ...u, roles: rolesData }
                })
            )

            setUsers(usersWithRoles)
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cargar la lista del equipo.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, roleId: string) => {
        setSavingId(userId)
        try {
            const response = await fetch(`/api/rbac/users/${userId}/roles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([roleId]), // Por ahora permitimos un rol principal
            })

            if (!response.ok) throw new Error("Error al asignar rol")

            // Actualizar estado local
            const updatedRoles = allRoles.filter(r => r.id === roleId)
            setUsers(users.map(u => u.id === userId ? { ...u, roles: updatedRoles } : u))

            toast({
                title: "Rol asignado",
                description: "El rol se ha actualizado correctamente.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo actualizar el rol.",
                variant: "destructive"
            })
        } finally {
            setSavingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Cargando equipo y roles...</p>
            </div>
        )
    }

    return (
        <div className="border rounded-lg bg-card overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Miembro</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rol Asignado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((u) => (
                        <TableRow key={u.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                        <UserCog className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="font-medium">{u.full_name}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    {u.email}
                                </div>
                            </TableCell>
                            <TableCell>
                                {u.is_admin ? (
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                                        Propio de Cuenta
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Colaborador</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {u.roles && u.roles.length > 0 ? (
                                        u.roles.map(r => (
                                            <Badge key={r.id} variant="secondary" className="bg-primary/5 text-primary">
                                                {r.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">Sin rol asignado</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Select
                                    disabled={savingId === u.id}
                                    onValueChange={(val) => handleRoleChange(u.id, val)}
                                    defaultValue={u.roles?.[0]?.id}
                                >
                                    <SelectTrigger className="w-40 ml-auto h-8 text-xs">
                                        <SelectValue placeholder="Cambiar rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allRoles.map(role => (
                                            <SelectItem key={role.id} value={role.id} className="text-xs">
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

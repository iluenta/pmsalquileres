"use client"

import { useState } from "react"
import { Role, Permission } from "@/lib/api/rbac"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Plus, ShieldCheck, ShieldAlert } from "lucide-react"
import { RoleFormDialog } from "./role-form-dialog"
import { useToast } from "@/components/ui/use-toast"

interface RolesTableProps {
    initialRoles: Role[]
    allPermissions: Permission[]
}

export function RolesTable({ initialRoles, allPermissions }: RolesTableProps) {
    const [roles, setRoles] = useState<Role[]>(initialRoles)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const { toast } = useToast()

    const handleCreate = () => {
        setEditingRole(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (role: Role) => {
        setEditingRole(role)
        setIsDialogOpen(true)
    }

    const handleDelete = async (roleId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer.")) return

        try {
            const response = await fetch(`/api/rbac/roles/${roleId}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Error al eliminar el rol")

            setRoles(roles.filter((r) => r.id !== roleId))
            toast({
                title: "Rol eliminado",
                description: "El rol ha sido eliminado correctamente.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el rol.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-xl font-semibold">Listado de Roles</h2>
                    <p className="text-sm text-muted-foreground">Administra los roles disponibles en tu organización</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Rol
                </Button>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium">{role.name}</TableCell>
                                <TableCell>
                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-primary">
                                        {role.code}
                                    </code>
                                </TableCell>
                                <TableCell className="max-w-xs truncate text-muted-foreground">
                                    {role.description || "—"}
                                </TableCell>
                                <TableCell>
                                    {role.is_system_role ? (
                                        <Badge variant="secondary" className="gap-1">
                                            <ShieldCheck className="h-3 w-3 text-blue-500" />
                                            Sistema
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="gap-1">
                                            <ShieldAlert className="h-3 w-3 text-orange-500" />
                                            Personalizado
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        {!role.is_system_role && (
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)} className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <RoleFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                role={editingRole}
                allPermissions={allPermissions}
                onSuccess={(updatedRole) => {
                    if (editingRole) {
                        setRoles(roles.map((r) => (r.id === updatedRole.id ? updatedRole : r)))
                    } else {
                        setRoles([...roles, updatedRole])
                    }
                }}
            />
        </div>
    )
}

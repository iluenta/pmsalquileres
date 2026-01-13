"use client"

import { useState, useEffect } from "react"
import { Role, Permission } from "@/lib/api/rbac"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface RoleFormDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    role: Role | null
    allPermissions: Permission[]
    onSuccess: (role: Role) => void
}

export function RoleFormDialog({ isOpen, onOpenChange, role, allPermissions, onSuccess }: RoleFormDialogProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [code, setCode] = useState("")
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingPermissions, setIsFetchingPermissions] = useState(false)
    const { toast } = useToast()

    // Agrupar permisos por módulo
    const modules = Array.from(new Set(allPermissions.map((p) => p.module || "General")))

    useEffect(() => {
        if (role) {
            setName(role.name)
            setDescription(role.description || "")
            setCode(role.code)
            fetchRolePermissions(role.id)
        } else {
            setName("")
            setDescription("")
            setCode("")
            setSelectedPermissions([])
        }
    }, [role, isOpen])

    const fetchRolePermissions = async (roleId: string) => {
        setIsFetchingPermissions(true)
        try {
            const response = await fetch(`/api/rbac/roles/${roleId}/permissions`)
            const data = await response.json()
            setSelectedPermissions(data)
        } catch (error) {
            console.error("Error fetching permissions:", error)
        } finally {
            setIsFetchingPermissions(false)
        }
    }

    const togglePermission = (permCode: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permCode) ? prev.filter((p) => p !== permCode) : [...prev, permCode]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Guardar metadatos del rol
            const roleResponse = await fetch(role ? `/api/rbac/roles/${role.id}` : "/api/rbac/roles", {
                method: role ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, code: code.toLowerCase().replace(/\s+/g, "_") }),
            })

            if (!roleResponse.ok) throw new Error("Error al guardar el rol")
            const savedRole = await roleResponse.json()

            // 2. Guardar mapeo de permisos
            const permResponse = await fetch(`/api/rbac/roles/${savedRole.id}/permissions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedPermissions),
            })

            if (!permResponse.ok) throw new Error("Error al guardar los permisos")

            toast({
                title: role ? "Rol actualizado" : "Rol creado",
                description: `El rol "${name}" ha sido guardado con éxito.`,
            })

            onSuccess(savedRole)
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Hubo un problema al guardar el rol.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{role ? "Editar Rol" : "Crear Nuevo Rol"}</DialogTitle>
                    <DialogDescription>
                        Configura el nombre y los permisos de acceso para este rol.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col space-y-4 py-4">
                    <div className="space-y-4 px-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Rol</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej: Manager de Reservas"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Código de Identificación</Label>
                                <Input
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="ej: manager_reservas"
                                    disabled={!!role}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe qué puede hacer el usuario con este rol..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col border rounded-md px-1">
                        <div className="p-2 bg-muted/50 border-b">
                            <Label className="text-sm font-semibold">Permisos de Acceso</Label>
                        </div>

                        {isFetchingPermissions ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Tabs defaultValue={modules[0]} className="flex-1 flex flex-col h-full overflow-hidden">
                                <TabsList className="w-full justify-start rounded-none border-b overflow-x-auto whitespace-nowrap bg-transparent">
                                    {modules.map((mod) => (
                                        <TabsTrigger key={mod} value={mod} className="capitalize px-4">
                                            {mod}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                <div className="flex-1 overflow-y-auto p-4">
                                    {modules.map((mod) => (
                                        <TabsContent key={mod} value={mod} className="mt-0 space-y-4">
                                            <div className="grid grid-cols-1 gap-3">
                                                {allPermissions
                                                    .filter((p) => (p.module || "General") === mod)
                                                    .map((perm) => (
                                                        <div key={perm.id} className="flex items-start space-x-3 p-2 hover:bg-accent rounded-md transition-colors cursor-pointer" onClick={() => togglePermission(perm.code)}>
                                                            <Checkbox
                                                                checked={selectedPermissions.includes(perm.code)}
                                                                onCheckedChange={() => togglePermission(perm.code)}
                                                                id={perm.id}
                                                            />
                                                            <div className="space-y-1">
                                                                <Label htmlFor={perm.id} className="font-medium cursor-pointer">
                                                                    {perm.code}
                                                                </Label>
                                                                <p className="text-xs text-muted-foreground leading-tight">
                                                                    {perm.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </TabsContent>
                                    ))}
                                </div>
                            </Tabs>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {role ? "Guardar Cambios" : "Crear Rol"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

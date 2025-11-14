"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { TreasuryAccount, CreateTreasuryAccountData, UpdateTreasuryAccountData } from "@/types/treasury-accounts"

interface TreasuryAccountFormProps {
  account?: TreasuryAccount
  tenantId: string
  onSave?: () => void
}

export function TreasuryAccountForm({
  account,
  tenantId,
  onSave,
}: TreasuryAccountFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    account_number: "",
    bank_name: "",
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || "",
        account_number: account.account_number || "",
        bank_name: account.bank_name || "",
        is_active: account.is_active,
      })
    }
  }, [account])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "El nombre es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const data: CreateTreasuryAccountData | UpdateTreasuryAccountData = {
        name: formData.name.trim(),
        account_number: formData.account_number.trim() || null,
        bank_name: formData.bank_name.trim() || null,
        is_active: formData.is_active,
      }

      const url = account
        ? `/api/treasury-accounts/${account.id}`
        : "/api/treasury-accounts"
      const method = account ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error al ${account ? "actualizar" : "crear"} la cuenta`)
      }

      toast({
        title: account ? "Cuenta actualizada" : "Cuenta creada",
        description: `La cuenta de tesorería ha sido ${account ? "actualizada" : "creada"} correctamente`,
      })

      if (onSave) {
        onSave()
      } else {
        router.push("/dashboard/treasury-accounts")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la cuenta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Nombre <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Cuenta Principal, Cuenta de Ahorros..."
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="account_number">Número de Cuenta</Label>
        <Input
          id="account_number"
          value={formData.account_number}
          onChange={(e) =>
            setFormData({ ...formData, account_number: e.target.value })
          }
          placeholder="Ej: ES12 3456 7890 1234 5678 9012"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank_name">Banco</Label>
        <Input
          id="bank_name"
          value={formData.bank_name}
          onChange={(e) =>
            setFormData({ ...formData, bank_name: e.target.value })
          }
          placeholder="Ej: Banco Santander, BBVA..."
        />
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Cuenta Activa</Label>
          <p className="text-sm text-muted-foreground">
            Las cuentas inactivas no aparecerán en los selectores
          </p>
        </div>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_active: checked })
          }
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? account
              ? "Actualizando..."
              : "Creando..."
            : account
            ? "Actualizar"
            : "Crear"}
        </Button>
      </div>
    </form>
  )
}


"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function MovementsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a ingresos por defecto (mantener compatibilidad con rutas antiguas)
    router.replace("/dashboard/incomes")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">Redirigiendo...</p>
      </div>
    </div>
  )
}
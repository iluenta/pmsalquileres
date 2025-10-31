"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  const isEnvError = error.message?.includes("Supabase environment variables") ||
                     error.message?.includes("NEXT_PUBLIC_SUPABASE")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle>Error en la aplicación</CardTitle>
          </div>
          <CardDescription>
            Ha ocurrido un error inesperado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEnvError ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                El error indica que faltan variables de entorno de Supabase.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  Variables requeridas:
                </p>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                  <li>NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                </ul>
                <p className="text-xs text-yellow-700 mt-2">
                  Por favor, verifica que estas variables estén configuradas en tu plataforma de despliegue (Vercel).
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {error.message || "Ha ocurrido un error inesperado en la aplicación."}
              </p>
              {process.env.NODE_ENV === "development" && error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    Ver detalles técnicos
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={reset} variant="default">
              Intentar de nuevo
            </Button>
            <Button 
              onClick={() => window.location.href = "/"}
              variant="outline"
            >
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


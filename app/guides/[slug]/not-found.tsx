import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center max-w-md">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Guía no encontrada
                </h1>
                <p className="text-gray-600 mb-6">
                    No se pudo encontrar la guía solicitada. Verifica que la URL sea correcta.
                </p>
                <Button asChild>
                    <Link href="/dashboard">Volver al Panel</Link>
                </Button>
            </div>
        </div>
    )
}


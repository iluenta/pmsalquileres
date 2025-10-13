import { getProperties } from "@/lib/api/properties"
import { PropertyGuideManager } from "@/components/guides/PropertyGuideManager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Home, MapPin, Users } from "lucide-react"
import Link from "next/link"

export default async function GuidesPage() {
  const properties = await getProperties()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Guías del Huésped</h1>
        <p className="text-gray-600 mt-2">
          Gestiona la información y recursos que tus huéspedes necesitan durante su estancia
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Propiedades</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">
              Propiedades disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guías Creadas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Próximamente: contador de guías
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lugares Registrados</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Próximamente: contador de lugares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normas Configuradas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Próximamente: contador de normas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Propiedades</h2>
          <p className="text-gray-600">
            Selecciona una propiedad para gestionar su guía del huésped
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <Badge variant="outline">Sin guía</Badge>
                </div>
                <CardDescription>
                  {property.address || "Sin dirección especificada"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="h-4 w-4" />
                    <span>
                      {property.property_type || "Tipo no especificado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {property.max_guests || 0} huéspedes máx.
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={`/dashboard/guides/${property.id}`}>
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Gestionar Guía
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {properties.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay propiedades
              </h3>
              <p className="text-gray-600 mb-4">
                Primero necesitas crear algunas propiedades para poder gestionar sus guías
              </p>
              <Link href="/dashboard/properties/new">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Crear Propiedad
                </button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>¿Qué son las Guías del Huésped?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Las guías del huésped son documentos informativos que proporcionas a tus huéspedes 
            para mejorar su experiencia durante la estancia. Incluyen información práctica sobre:
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Información Básica</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mensaje de bienvenida personalizado</li>
                <li>• Información del anfitrión</li>
                <li>• Normas de la casa</li>
                <li>• Información de contacto</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Recursos Locales</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Lugares de interés cercanos</li>
                <li>• Restaurantes recomendados</li>
                <li>• Playas y actividades</li>
                <li>• Información práctica (transporte, compras)</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Una guía completa y bien organizada mejora significativamente 
              la experiencia del huésped y puede resultar en mejores reseñas y más reservas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

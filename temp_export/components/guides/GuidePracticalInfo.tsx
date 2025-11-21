import { Card, CardContent } from "@/components/ui/card"
import { CompleteGuideDataResponse } from "@/types/guides"
import { Wifi, Key, Clock, MapPin } from "lucide-react"

interface GuidePracticalInfoProps {
  data?: CompleteGuideDataResponse
}

export function GuidePracticalInfo({ data }: GuidePracticalInfoProps) {
  // Información práctica que podría venir de la configuración
  // Por ahora usamos valores por defecto, pero esto debería ser configurable
  const practicalInfo = {
    checkIn: "16:00h",
    checkOut: "11:00h", 
    accessCode: "07349",
    wifiPassword: "Ver@Tesper@1234",
    address: data?.property?.address || "Dirección no disponible"
  }

  return (
    <div className="bg-muted rounded-2xl p-6 md:p-8 border-l-4 border-primary">
      <h3 className="text-xl font-bold text-foreground mb-3">Información del Apartamento</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground mb-1">Dirección</p>
            <p>{practicalInfo.address}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground mb-1">Check-in / Check-out</p>
            <p>Entrada: {practicalInfo.checkIn} | Salida: {practicalInfo.checkOut}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Key className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground mb-1">Código de acceso</p>
            <p>{practicalInfo.accessCode}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Wifi className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground mb-1">WiFi</p>
            <p>{practicalInfo.wifiPassword}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


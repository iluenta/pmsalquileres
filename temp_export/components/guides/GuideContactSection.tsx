import { Card, CardContent } from "@/components/ui/card"
import { GuideContactInfo } from "@/types/guides"
import { Phone, Mail, MessageCircle, User } from "lucide-react"

interface GuideContactSectionProps {
  contactInfo: GuideContactInfo
}

export function GuideContactSection({ contactInfo }: GuideContactSectionProps) {
  return (
    <section id="contacto" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Contacto y Emergencias
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Estamos aquí para ayudarte durante tu estancia
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Información de contacto de los anfitriones */}
          <Card className="mb-8">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <User className="h-6 w-6 text-primary" />
                Tus Anfitriones
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {contactInfo.host_names && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <span className="font-medium">{contactInfo.host_names}</span>
                    </div>
                  )}
                  
                  {contactInfo.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <a 
                        href={`tel:${contactInfo.phone}`}
                        className="text-primary hover:underline"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  )}
                  
                  {contactInfo.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <a 
                        href={`mailto:${contactInfo.email}`}
                        className="text-primary hover:underline"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  )}
                  
                  {contactInfo.whatsapp && (
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <a 
                        href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp: {contactInfo.whatsapp}
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="text-muted-foreground">
                  <p className="mb-4">
                    Estamos disponibles para cualquier duda o incidencia durante tu estancia. 
                    No dudes en contactarnos.
                  </p>
                  
                  {contactInfo.emergency_numbers && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Números de Emergencia:</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Emergencias:</strong> {contactInfo.emergency_numbers.emergencias}</p>
                        <p><strong>Policía Local:</strong> {contactInfo.emergency_numbers.policia_local}</p>
                        <p><strong>Guardia Civil:</strong> {contactInfo.emergency_numbers.guardia_civil}</p>
                        <p><strong>Bomberos:</strong> {contactInfo.emergency_numbers.bomberos}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de emergencias */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Emergencias</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <Phone className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Emergencias</p>
                  <p className="text-2xl font-bold text-destructive">112</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Policía Local</p>
                  <p className="text-2xl font-bold text-primary">092</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Guardia Civil</p>
                  <p className="text-2xl font-bold text-primary">062</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Bomberos</p>
                  <p className="text-2xl font-bold text-primary">080</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

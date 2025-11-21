import { Phone, Mail, MessageCircle, AlertCircle } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contacto" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Contacto y Emergencias
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            Estamos aquí para ayudarte en cualquier momento de tu estancia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
            <h3 className="text-2xl font-bold text-card-foreground mb-6">Tus Anfitriones</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-semibold text-foreground">+34 600 000 000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">info@veratespera.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-semibold text-foreground">+34 600 000 000</p>
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Estamos disponibles para cualquier duda o incidencia durante tu estancia. No dudes en contactarnos.
            </p>
          </div>

          <div className="bg-accent/10 p-8 rounded-2xl border-l-4 border-accent">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-accent" />
              Emergencias
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Emergencias</span>
                <span className="font-bold text-accent text-xl">112</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Policía Local</span>
                <span className="font-bold text-foreground">092</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Guardia Civil</span>
                <span className="font-bold text-foreground">062</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Bomberos</span>
                <span className="font-bold text-foreground">080</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted p-8 rounded-2xl max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-foreground mb-4">Check-out</h3>
          <p className="text-muted-foreground mb-4">El día de tu salida, por favor:</p>
          <ul className="space-y-2">
            {[
              "Deja las llaves en el lugar acordado",
              "Asegúrate de cerrar ventanas y puertas",
              "Deja la cocina limpia y los platos lavados",
              "Deposita la basura en los contenedores exteriores",
              "Comprueba no haber olvidado ninguna pertenencia",
            ].map((item, index) => (
              <li key={index} className="text-muted-foreground flex items-start">
                <span className="mr-2 text-primary">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-foreground mb-4">¿Qué te ha parecido tu estancia?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Tu opinión nos ayuda a mejorar y a que otros huéspedes descubran VeraTespera
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
          >
            Deja tu reseña
          </a>
        </div>
      </div>
    </section>
  )
}

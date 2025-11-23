import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

interface LandingFooterProps {
  propertyName?: string
  address?: string
}

export function LandingFooter({ propertyName = "VeraTespera", address }: LandingFooterProps) {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h3 className="font-serif text-3xl font-bold mb-4">{propertyName}</h3>
          <p className="mb-2">© {new Date().getFullYear()} {propertyName} - Todos los derechos reservados</p>
          {address && (
            <p className="text-sm opacity-90 mb-6">{address}</p>
          )}
          <div className="flex justify-center gap-6 mb-8">
            <a
              href="#"
              className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
          <p className="text-sm opacity-75">
            Hecho con <span className="text-secondary">❤</span> por Sonia y Pedro
          </p>
        </div>
      </div>
    </footer>
  )
}


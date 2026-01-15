import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

interface LandingFooterProps {
  propertyName?: string
  address?: string
}

export function LandingFooter({ propertyName = "VeraTespera", address }: LandingFooterProps) {
  return (
    <footer className="bg-slate-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">VT</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                {propertyName}
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Tu hogar lejos de casa. Disfruta de lujo, comodidad y la
              mejor ubicación para unas vacaciones inolvidables.
            </p>
            {address && (
              <p className="text-slate-500 text-xs mt-4 flex items-center gap-2">
                <span className="w-1 h-1 bg-teal-500 rounded-full" />
                {address}
              </p>
            )}
          </div>

          {/* Secciones */}
          <div>
            <h4 className="text-white font-semibold mb-4">Secciones</h4>
            <ul className="space-y-2">
              <li><a href="#características" className="text-slate-400 text-sm transition-colors hover:text-white">Características</a></li>
              <li><a href="#galeria" className="text-slate-400 text-sm transition-colors hover:text-white">Galería</a></li>
              <li><a href="#precios" className="text-slate-400 text-sm transition-colors hover:text-white">Precios</a></li>
              <li><a href="#ubicacion" className="text-slate-400 text-sm transition-colors hover:text-white">Ubicación</a></li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h4 className="text-white font-semibold mb-4">Información</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 text-sm transition-colors hover:text-white">
                  Guía del Huésped
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 text-sm transition-colors hover:text-white">
                  Política de Cancelación
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 text-sm transition-colors hover:text-white">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {propertyName}. Todos los derechos reservados.
          </p>
          <p className="text-slate-600 text-xs">
            Hecho con <span className="text-teal-500">❤</span> por Sonia y Pedro
          </p>
        </div>
      </div>
    </footer>
  )
}


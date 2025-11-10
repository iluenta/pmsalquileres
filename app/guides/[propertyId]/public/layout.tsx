"use client"

import { useEffect } from "react"

export default function GuidePublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Habilitar scroll en la página de guía pública
    document.documentElement.style.overflow = "auto"
    document.documentElement.style.height = "auto"
    document.body.style.overflow = "auto"
    document.body.style.height = "auto"

    return () => {
      // Restaurar estilos originales al salir
      document.documentElement.style.overflow = ""
      document.documentElement.style.height = ""
      document.body.style.overflow = ""
      document.body.style.height = ""
    }
  }, [])

  return <>{children}</>
}



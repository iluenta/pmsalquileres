import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth/auth-context"
import { TenantProvider } from "@/lib/auth/tenant-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "PMS Alquileres Vacacionales",
  description: "Sistema de gestión de propiedades vacacionales",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`} suppressHydrationWarning>
        <Suspense fallback={null}>
          <AuthProvider>
            <TenantProvider>
              {children}
              <Toaster />
            </TenantProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}

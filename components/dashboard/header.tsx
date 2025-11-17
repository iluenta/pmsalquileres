"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { useTenant } from "@/lib/auth/tenant-context"
import { useSeason } from "@/lib/contexts/season-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, User, Settings, LogOut, Moon, Sun, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect } from "react"

export function Header() {
  const { user, userInfo, signOut } = useAuth()
  const { tenantName } = useTenant()
  const { selectedYear, setSelectedYear, availableYears, loadAvailableYears } = useSeason()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Recargar años disponibles al montar
  useEffect(() => {
    loadAvailableYears()
  }, [loadAvailableYears])

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Tenant Info y Selector de Año */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{tenantName || "Cargando..."}</span>
        </div>
        
        {/* Selector de Año/Temporada */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedYear === null ? "all" : selectedYear.toString()}
            onValueChange={(value) => {
              if (value === "all") {
                setSelectedYear(null)
              } else {
                const year = parseInt(value, 10)
                if (!isNaN(year)) {
                  setSelectedYear(year)
                }
              }
              // Refrescar la página para aplicar el filtro
              router.refresh()
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={selectedYear === null ? "Todos" : selectedYear.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {/* Asegurar que el año actual siempre esté disponible */}
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))
              ) : (
                selectedYear !== null && (
                  <SelectItem value={selectedYear.toString()}>
                    {selectedYear}
                  </SelectItem>
                )
              )}
              {/* Si el año actual no está en availableYears, agregarlo */}
              {availableYears.length > 0 && selectedYear !== null && !availableYears.includes(selectedYear) && (
                <SelectItem value={selectedYear.toString()}>
                  {selectedYear}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {userInfo?.full_name ? getInitials(userInfo.full_name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium leading-none">{userInfo?.full_name || "Usuario"}</span>
                <span className="text-xs text-muted-foreground leading-none mt-1">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userInfo?.full_name || "Usuario"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

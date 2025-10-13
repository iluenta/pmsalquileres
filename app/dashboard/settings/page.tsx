"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Palette, Globe, CalendarIcon, Hash } from "lucide-react"
import { useTheme } from "next-themes"

interface UserSettings {
  language: string
  timezone: string
  date_format: string
}

export default function SettingsPage() {
  const { user, userInfo, refreshUserInfo } = useAuth()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const supabase = getSupabaseBrowserClient()

  const [settings, setSettings] = useState<UserSettings>({
    language: "es",
    timezone: "Europe/Madrid",
    date_format: "DD/MM/YYYY",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userInfo) {
      setSettings({
        language: userInfo.language || "es",
        timezone: userInfo.timezone || "Europe/Madrid",
        date_format: userInfo.date_format || "DD/MM/YYYY",
      })
    }
  }, [userInfo])

  const handleSaveSettings = async () => {
    setLoading(true)

    try {
      // Update all settings in users table (since user_settings doesn't exist)
      const { error: userError } = await supabase
        .from("users")
        .update({
          language: settings.language,
          timezone: settings.timezone,
          date_format: settings.date_format,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)

      if (userError) throw userError

      await refreshUserInfo()

      toast({
        title: "Configuración guardada",
        description: "Tus preferencias se han actualizado correctamente.",
      })
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia en el sistema</p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Personaliza el aspecto visual del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">
              <Palette className="inline h-4 w-4 mr-1" />
              Tema
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración Regional</CardTitle>
          <CardDescription>Ajusta el idioma, zona horaria y formatos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">
                <Globe className="inline h-4 w-4 mr-1" />
                Idioma
              </Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">
                <Globe className="inline h-4 w-4 mr-1" />
                Zona Horaria
              </Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Madrid">Europa/Madrid (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Europa/Londres (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">América/Nueva York (GMT-5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">América/Los Ángeles (GMT-8)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokio (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">
                <CalendarIcon className="inline h-4 w-4 mr-1" />
                Formato de Fecha
              </Label>
              <Select
                value={settings.date_format}
                onValueChange={(value) => setSettings({ ...settings, date_format: value })}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberFormat">
                <Hash className="inline h-4 w-4 mr-1" />
                Formato Numérico
              </Label>
              <Select defaultValue="es-ES">
                <SelectTrigger id="numberFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es-ES">1.234,56 (Español)</SelectItem>
                  <SelectItem value="en-US">1,234.56 (Inglés)</SelectItem>
                  <SelectItem value="de-DE">1.234,56 (Alemán)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

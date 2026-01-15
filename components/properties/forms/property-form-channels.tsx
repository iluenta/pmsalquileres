"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Star, MessageSquare } from "lucide-react"
import Image from "next/image"

interface PropertyFormChannelsProps {
  allChannels: Array<{ id: string; name: string; logo_url: string | null }>
  selectedChannels: string[]
  loadingChannels: boolean
  onChannelToggle: (channelId: string, checked: boolean) => void
  landingConfig: any
  onLandingConfigChange: (config: any) => void
}

export function PropertyFormChannels({
  allChannels,
  selectedChannels,
  loadingChannels,
  onChannelToggle,
  landingConfig,
  onLandingConfigChange,
}: PropertyFormChannelsProps) {
  const channelRatings = landingConfig?.channel_ratings || {}

  const updateChannelRating = (channelId: string, name: string, logo_url: string | null, field: string, value: string) => {
    const newRatings = {
      ...channelRatings,
      [channelId]: {
        ...(channelRatings[channelId] || {}),
        name: name,
        logo_url: logo_url,
        [field]: value,
      },
    }
    onLandingConfigChange({
      ...landingConfig,
      channel_ratings: newRatings,
    })
  }

  return (
    <div className="space-y-6">
      {/* Channels Section */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">🛒</span> Canales de Venta y Puntuaciones
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Selecciona los canales activos y define su puntuación para mostrar en la landing page.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {loadingChannels ? (
            <div className="flex items-center justify-center py-12 bg-muted/20 rounded-lg border border-dashed">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
          ) : allChannels.length === 0 ? (
            <div className="p-8 text-center bg-muted/20 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                No hay canales de venta disponibles. Crea canales desde la sección "Canales de Vento".
              </p>
            </div>
          ) : (
            allChannels.map((channel) => {
              const isActive = selectedChannels.includes(channel.id)
              const rating = channelRatings[channel.id]?.rating || ""
              const reviews = channelRatings[channel.id]?.reviews_count || ""

              return (
                <div
                  key={channel.id}
                  className={`flex flex-col p-4 border rounded-xl transition-all duration-300 ${isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-neutral-300"
                    }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`channel-${channel.id}`}
                        checked={isActive}
                        onCheckedChange={(checked) =>
                          onChannelToggle(channel.id, checked === true)
                        }
                        className="h-5 w-5"
                      />
                      <Label
                        htmlFor={`channel-${channel.id}`}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        {channel.logo_url && (
                          <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white border p-1">
                            <Image
                              src={channel.logo_url}
                              alt={channel.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="font-bold text-base">{channel.name}</span>
                      </Label>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                        Activo para Landing
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pt-4 border-t border-primary/10">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          Puntuación (ej: 4.9)
                        </Label>
                        <Input
                          placeholder="4.9"
                          value={rating}
                          onChange={(e) => updateChannelRating(channel.id, channel.name, channel.logo_url, "rating", e.target.value)}
                          className="bg-background border-primary/20 focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3 text-blue-500" />
                          Nº de Reseñas
                        </Label>
                        <Input
                          placeholder="47"
                          value={reviews}
                          onChange={(e) => updateChannelRating(channel.id, channel.name, channel.logo_url, "reviews_count", e.target.value)}
                          className="bg-background border-primary/20 focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}


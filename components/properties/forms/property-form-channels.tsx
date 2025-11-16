"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import Image from "next/image"

interface PropertyFormChannelsProps {
  allChannels: Array<{ id: string; name: string; logo_url: string | null }>
  selectedChannels: string[]
  loadingChannels: boolean
  onChannelToggle: (channelId: string, checked: boolean) => void
}

export function PropertyFormChannels({
  allChannels,
  selectedChannels,
  loadingChannels,
  onChannelToggle,
}: PropertyFormChannelsProps) {
  return (
    <div className="space-y-6">
      {/* Channels Section */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">🛒</span> Canales de Venta Activos
        </h3>
        <div className="bg-muted/30 p-4 md:p-6 rounded-lg border border-border">
          {loadingChannels ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allChannels.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay canales de venta disponibles. Crea canales desde la sección "Canales de Venta".
            </p>
          ) : (
            <div className="space-y-3">
              {allChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={`channel-${channel.id}`}
                    checked={selectedChannels.includes(channel.id)}
                    onCheckedChange={(checked) =>
                      onChannelToggle(channel.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`channel-${channel.id}`}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    {channel.logo_url && (
                      <Image
                        src={channel.logo_url}
                        alt={channel.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    )}
                    <span className="text-sm font-medium text-foreground">{channel.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


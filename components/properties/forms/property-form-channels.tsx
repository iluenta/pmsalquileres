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
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3">
            <Star className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tighter">Canales de Venta</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Puntuaciones y Reseñas para Landing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loadingChannels ? (
            <div className="col-span-full flex items-center justify-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : allChannels.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                No hay canales disponibles.<br />Créalos en la sección "Canales de Venta".
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
                  className={`flex flex-col p-5 border rounded-2xl transition-all duration-300 ${isActive
                    ? "border-indigo-200 bg-indigo-50/20 shadow-sm"
                    : "border-slate-100 bg-slate-50/50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
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
                        className="h-5 w-5 rounded-lg border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <Label
                        htmlFor={`channel-${channel.id}`}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        {channel.logo_url && (
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-100 p-1 shadow-sm">
                            <Image
                              src={channel.logo_url}
                              alt={channel.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="font-black text-sm text-slate-900 tracking-tight">{channel.name}</span>
                      </Label>
                    </div>
                    {isActive && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                        Visible
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-indigo-100">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          Nota
                        </Label>
                        <Input
                          placeholder="4.9"
                          value={rating}
                          onChange={(e) => updateChannelRating(channel.id, channel.name, channel.logo_url, "rating", e.target.value)}
                          className="h-9 bg-white border-slate-100 rounded-xl text-center font-bold text-indigo-600"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3 text-slate-400" />
                          Reseñas
                        </Label>
                        <Input
                          placeholder="47"
                          value={reviews}
                          onChange={(e) => updateChannelRating(channel.id, channel.name, channel.logo_url, "reviews_count", e.target.value)}
                          className="h-9 bg-white border-slate-100 rounded-xl text-center font-bold text-slate-600"
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


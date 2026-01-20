"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PropertyFormCharacteristicsProps {
  formData: {
    bedrooms: number
    bathrooms: number
    max_guests: number
    square_meters: number
    min_nights: number
  }
  onFieldChange: (field: string, value: any) => void
}

export function PropertyFormCharacteristics({
  formData,
  onFieldChange,
}: PropertyFormCharacteristicsProps) {
  return (
    <div className="space-y-6">
      {/* Characteristics Section */}
      <div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <Label htmlFor="bedrooms" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Dormitorios
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms || 0}
                onChange={(e) => onFieldChange("bedrooms", parseInt(e.target.value) || 0)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-center"
              />
            </div>
            <div>
              <Label htmlFor="bathrooms" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Baños
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                value={formData.bathrooms || 0}
                onChange={(e) => onFieldChange("bathrooms", parseInt(e.target.value) || 0)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-center"
              />
            </div>
            <div>
              <Label htmlFor="max_guests" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Huéspedes
              </Label>
              <Input
                id="max_guests"
                type="number"
                min="0"
                value={formData.max_guests || 0}
                onChange={(e) => onFieldChange("max_guests", parseInt(e.target.value) || 0)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-center text-indigo-600"
              />
            </div>
            <div>
              <Label htmlFor="square_meters" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                M²
              </Label>
              <Input
                id="square_meters"
                type="number"
                min="0"
                placeholder="0"
                value={formData.square_meters || 0}
                onChange={(e) => onFieldChange("square_meters", parseInt(e.target.value) || 0)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-center"
              />
            </div>
            <div>
              <Label htmlFor="min_nights" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Mín. Noches <span className="text-destructive">*</span>
              </Label>
              <Input
                id="min_nights"
                type="number"
                min="1"
                placeholder="1"
                value={formData.min_nights || 1}
                onChange={(e) => onFieldChange("min_nights", parseInt(e.target.value) || 1)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-center"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


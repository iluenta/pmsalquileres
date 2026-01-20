"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PropertyFormLocationProps {
  formData: {
    street: string
    number: string
    city: string
    province: string
    postal_code: string
    country: string
  }
  onFieldChange: (field: string, value: any) => void
}

export function PropertyFormLocation({
  formData,
  onFieldChange,
}: PropertyFormLocationProps) {
  return (
    <div className="space-y-6">
      {/* Location Section */}
      <div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <Label htmlFor="street" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Calle / Dirección <span className="text-destructive">*</span>
              </Label>
              <Input
                id="street"
                placeholder="Ej: Avenida de la Libertad"
                value={formData.street}
                onChange={(e) => onFieldChange("street", e.target.value)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium"
                required
              />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="number" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Nº <span className="text-destructive">*</span>
              </Label>
              <Input
                id="number"
                placeholder="12"
                value={formData.number}
                onChange={(e) => onFieldChange("number", e.target.value)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="city" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Ciudad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="Ej: Madrid"
                value={formData.city}
                onChange={(e) => onFieldChange("city", e.target.value)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium"
                required
              />
            </div>
            <div>
              <Label htmlFor="province" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Provincia <span className="text-destructive">*</span>
              </Label>
              <Input
                id="province"
                placeholder="Ej: Madrid"
                value={formData.province}
                onChange={(e) => onFieldChange("province", e.target.value)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium"
                required
              />
            </div>
            <div>
              <Label htmlFor="postal_code" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                C.P. <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postal_code"
                placeholder="28001"
                value={formData.postal_code}
                onChange={(e) => onFieldChange("postal_code", e.target.value)}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-indigo-600"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
              País <span className="text-destructive">*</span>
            </Label>
            <Input
              id="country"
              placeholder="Ej: España"
              value={formData.country}
              onChange={(e) => onFieldChange("country", e.target.value)}
              className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}


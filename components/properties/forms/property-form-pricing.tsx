"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react"

interface PricingPeriod {
  id?: string
  is_base: boolean
  season_name?: string | null
  start_date?: string | null
  end_date?: string | null
  price_night: number
  price_weekend?: number | null
  price_week?: number | null
  price_fortnight?: number | null
  price_month?: number | null
  extra_guest_price?: number | null
  min_nights?: number | null
}

interface PropertyFormPricingProps {
  formData: {
    base_price_per_night: number | null
    cleaning_fee: number | null
    security_deposit: number | null
    check_in_time: string | null
    check_out_time: string | null
    check_in_instructions: string | null
    pricing_periods: any[]
  }
  onFieldChange: (field: string, value: any) => void
}

export function PropertyFormPricing({
  formData,
  onFieldChange,
}: PropertyFormPricingProps) {

  const pricingPeriods = formData.pricing_periods || []

  const handleUpdatePeriod = (index: number, field: keyof PricingPeriod, value: any) => {
    const updatedPeriods = [...pricingPeriods]
    updatedPeriods[index] = { ...updatedPeriods[index], [field]: value }
    onFieldChange("pricing_periods", updatedPeriods)
  }

  const handleAddSeason = () => {
    const newSeason: PricingPeriod = {
      is_base: false,
      season_name: "",
      start_date: "",
      end_date: "",
      price_night: 0,
      min_nights: 1
    }
    onFieldChange("pricing_periods", [...pricingPeriods, newSeason])
  }

  const handleRemoveSeason = (index: number) => {
    const updatedPeriods = pricingPeriods.filter((_, i) => i !== index)
    onFieldChange("pricing_periods", updatedPeriods)
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Pricing Table */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tighter">Tarifas por Temporada</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuración dinámica de precios</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest"
            onClick={handleAddSeason}
          >
            <Plus className="w-4 h-4" />
            Añadir Temporada
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temporadas</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 w-[90px]">1 Noche</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 w-[90px]">Finde</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 w-[90px]">Semana</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 w-[90px]">15 Días</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 w-[90px]">Mes</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 w-[90px]">Extra</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 w-[90px]">Min.</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingPeriods.map((period, index) => (
                <TableRow key={index} className={`hover:bg-slate-50/50 border-slate-100 transition-colors ${period.is_base ? "bg-indigo-50/20" : ""}`}>
                  <TableCell className="py-3">
                    {period.is_base ? (
                      <div className="flex flex-col">
                        <span className="text-indigo-600 font-black uppercase text-[10px] tracking-widest">Base</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Resto del año</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 min-w-[150px]">
                        <Input
                          placeholder="Nombre"
                          value={period.season_name || ""}
                          onChange={(e) => handleUpdatePeriod(index, "season_name", e.target.value)}
                          className="h-7 text-xs bg-white border-slate-200 rounded-lg font-bold"
                        />
                        <div className="flex items-center gap-1">
                          <Input
                            type="date"
                            value={period.start_date || ""}
                            onChange={(e) => handleUpdatePeriod(index, "start_date", e.target.value)}
                            className="h-7 text-[9px] px-1 bg-white border-slate-200 rounded-lg"
                          />
                          <Input
                            type="date"
                            value={period.end_date || ""}
                            onChange={(e) => handleUpdatePeriod(index, "end_date", e.target.value)}
                            className="h-7 text-[9px] px-1 bg-white border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      className="h-8 text-center bg-white border-slate-200 rounded-lg text-xs font-black"
                      value={period.price_night || 0}
                      onChange={(e) => handleUpdatePeriod(index, "price_night", parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="-"
                      className="h-8 text-center bg-white border-slate-200 rounded-lg text-xs font-bold text-slate-500"
                      value={period.price_weekend || ""}
                      onChange={(e) => handleUpdatePeriod(index, "price_weekend", parseFloat(e.target.value) || null)}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="-"
                      className="h-8 text-center bg-white border-slate-200 rounded-lg text-xs font-bold text-slate-500"
                      value={period.price_week || ""}
                      onChange={(e) => handleUpdatePeriod(index, "price_week", parseFloat(e.target.value) || null)}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="-"
                      className="h-8 text-center bg-white border-slate-200 rounded-lg text-xs font-bold text-slate-500"
                      value={period.price_fortnight || ""}
                      onChange={(e) => handleUpdatePeriod(index, "price_fortnight", parseFloat(e.target.value) || null)}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="-"
                      className="h-8 text-center bg-white border-slate-200 rounded-lg text-xs font-bold text-slate-500"
                      value={period.price_month || ""}
                      onChange={(e) => handleUpdatePeriod(index, "price_month", parseFloat(e.target.value) || null)}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="-"
                      className="h-8 text-center bg-white border-slate-200 rounded-lg text-xs font-bold text-slate-500"
                      value={period.extra_guest_price || ""}
                      onChange={(e) => handleUpdatePeriod(index, "extra_guest_price", parseFloat(e.target.value) || null)}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      className="h-8 text-center bg-white border-slate-200 rounded-lg text-xs font-black"
                      value={period.min_nights || 1}
                      onChange={(e) => handleUpdatePeriod(index, "min_nights", parseInt(e.target.value) || 1)}
                    />
                  </TableCell>
                  <TableCell className="p-1">
                    {!period.is_base && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-300 hover:text-destructive h-7 w-7 transition-colors"
                        onClick={() => handleRemoveSeason(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Other Costs & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center -rotate-6">
              <span className="text-indigo-600 text-sm">🛡️</span>
            </div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Cargos y Horarios</h4>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="cleaning_fee" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                Limpieza (€)
              </Label>
              <Input
                id="cleaning_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.cleaning_fee || 0}
                onChange={(e) => onFieldChange("cleaning_fee", parseFloat(e.target.value) || 0)}
                className="bg-slate-50 border-slate-100 h-10 rounded-xl font-bold"
              />
            </div>
            <div>
              <Label htmlFor="security_deposit" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                Fianza (€)
              </Label>
              <Input
                id="security_deposit"
                type="number"
                step="0.01"
                min="0"
                value={formData.security_deposit || 0}
                onChange={(e) => onFieldChange("security_deposit", parseFloat(e.target.value) || 0)}
                className="bg-slate-50 border-slate-100 h-10 rounded-xl font-bold"
              />
            </div>
            <div>
              <Label htmlFor="check_in_time" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                Check-in
              </Label>
              <Input
                id="check_in_time"
                type="time"
                value={formData.check_in_time || "15:00"}
                onChange={(e) => onFieldChange("check_in_time", e.target.value)}
                className="bg-slate-50 border-slate-100 h-10 rounded-xl font-black"
              />
            </div>
            <div>
              <Label htmlFor="check_out_time" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                Check-out
              </Label>
              <Input
                id="check_out_time"
                type="time"
                value={formData.check_out_time || "11:00"}
                onChange={(e) => onFieldChange("check_out_time", e.target.value)}
                className="bg-slate-50 border-slate-100 h-10 rounded-xl font-black"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center rotate-6">
              <span className="text-indigo-600 text-sm">ℹ️</span>
            </div>
            <Label htmlFor="check_in_instructions" className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Instrucciones de Check-in
            </Label>
          </div>
          <Textarea
            id="check_in_instructions"
            placeholder="Ej: Por favor, tenga a mano su DNI..."
            value={formData.check_in_instructions || ""}
            onChange={(e) => onFieldChange("check_in_instructions", e.target.value)}
            className="bg-slate-50 border-slate-100 min-h-[120px] rounded-2xl text-sm font-medium focus:ring-indigo-500"
          />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">
            Se mostrará al huésped antes del registro.
          </p>
        </div>
      </div>
    </div>
  )
}


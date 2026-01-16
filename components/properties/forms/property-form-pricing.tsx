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
    <div className="space-y-8">
      {/* Dynamic Pricing Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-lg">
            <span>📅</span> Tarifas Configurables por Temporada
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleAddSeason}
          >
            <Plus className="w-4 h-4" />
            Añadir Temporada
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px]">Temporadas</TableHead>
                <TableHead className="text-center w-[110px]">1 Noche</TableHead>
                <TableHead className="text-center w-[110px]">Fin de Sem.</TableHead>
                <TableHead className="text-center w-[110px]">1 Semana</TableHead>
                <TableHead className="text-center w-[110px]">Quincena</TableHead>
                <TableHead className="text-center w-[110px]">1 Mes</TableHead>
                <TableHead className="text-center w-[110px]">Huesped Extra</TableHead>
                <TableHead className="text-center w-[110px]">Mín. Noches</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingPeriods.map((period, index) => (
                <TableRow key={index} className={period.is_base ? "bg-teal-50/30" : ""}>
                  <TableCell className="font-medium">
                    {period.is_base ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-teal-700 font-bold uppercase text-xs">Precios básicos</span>
                        <span className="text-[10px] text-muted-foreground uppercase leading-tight">Resto del año</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Nombre (ej: Verano)"
                          value={period.season_name || ""}
                          onChange={(e) => handleUpdatePeriod(index, "season_name", e.target.value)}
                          className="h-8 text-xs"
                        />
                        <div className="flex items-center gap-1">
                          <Input
                            type="date"
                            value={period.start_date || ""}
                            onChange={(e) => handleUpdatePeriod(index, "start_date", e.target.value)}
                            className="h-8 text-[10px] px-1"
                          />
                          <span className="text-muted-foreground">-</span>
                          <Input
                            type="date"
                            value={period.end_date || ""}
                            onChange={(e) => handleUpdatePeriod(index, "end_date", e.target.value)}
                            className="h-8 text-[10px] px-1"
                          />
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      className="h-9 text-center"
                      value={period.price_night || 0}
                      onChange={(e) => handleUpdatePeriod(index, "price_night", parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="-"
                      className="h-9 text-center"
                      value={period.price_weekend || ""}
                      onChange={(e) => handleUpdatePeriod(index, "price_weekend", parseFloat(e.target.value) || null)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="-"
                      className="h-9 text-center"
                      value={period.price_week || ""}
                      onChange={(e) => handleUpdatePeriod(index, "price_week", parseFloat(e.target.value) || null)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="-"
                      className="h-9 text-center"
                      value={period.price_fortnight || ""}
                      onChange={(e) => handleUpdatePeriod(index, "price_fortnight", parseFloat(e.target.value) || null)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="-"
                      className="h-9 text-center"
                      value={period.price_month || ""}
                      onChange={(e) => handleUpdatePeriod(index, "price_month", parseFloat(e.target.value) || null)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="-"
                      className="h-9 text-center"
                      value={period.extra_guest_price || ""}
                      onChange={(e) => handleUpdatePeriod(index, "extra_guest_price", parseFloat(e.target.value) || null)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="h-9 text-center"
                      value={period.min_nights || 1}
                      onChange={(e) => handleUpdatePeriod(index, "min_nights", parseInt(e.target.value) || 1)}
                    />
                  </TableCell>
                  <TableCell>
                    {!period.is_base && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8 hover:bg-destructive/10"
                        onClick={() => handleRemoveSeason(index)}
                      >
                        <Trash2 className="w-4 h-4" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-muted/30 p-4 md:p-6 rounded-xl border border-border space-y-4">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <span>🛡️</span> Otros Cargos y Horarios
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cleaning_fee" className="text-xs font-medium">
                Tarifa de Limpieza (€)
              </Label>
              <Input
                id="cleaning_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.cleaning_fee || 0}
                onChange={(e) => onFieldChange("cleaning_fee", parseFloat(e.target.value) || 0)}
                className="mt-1.5 bg-background h-9"
              />
            </div>
            <div>
              <Label htmlFor="security_deposit" className="text-xs font-medium">
                Depósito de Seguridad (€)
              </Label>
              <Input
                id="security_deposit"
                type="number"
                step="0.01"
                min="0"
                value={formData.security_deposit || 0}
                onChange={(e) => onFieldChange("security_deposit", parseFloat(e.target.value) || 0)}
                className="mt-1.5 bg-background h-9"
              />
            </div>
            <div>
              <Label htmlFor="check_in_time" className="text-xs font-medium">
                Hora de Check-in
              </Label>
              <Input
                id="check_in_time"
                type="time"
                value={formData.check_in_time || "15:00"}
                onChange={(e) => onFieldChange("check_in_time", e.target.value)}
                className="mt-1.5 bg-background h-9"
              />
            </div>
            <div>
              <Label htmlFor="check_out_time" className="text-xs font-medium">
                Hora de Check-out
              </Label>
              <Input
                id="check_out_time"
                type="time"
                value={formData.check_out_time || "11:00"}
                onChange={(e) => onFieldChange("check_out_time", e.target.value)}
                className="mt-1.5 bg-background h-9"
              />
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-4 md:p-6 rounded-xl border border-border space-y-4">
          <Label htmlFor="check_in_instructions" className="text-sm font-medium flex items-center gap-2">
            <span>ℹ️</span> Instrucciones de Check-in (Paso previo)
          </Label>
          <Textarea
            id="check_in_instructions"
            placeholder="Ej: Por favor, tenga a mano su DNI para el escaneo..."
            value={formData.check_in_instructions || ""}
            onChange={(e) => onFieldChange("check_in_instructions", e.target.value)}
            className="bg-background min-h-[100px] text-sm"
          />
          <p className="text-[10px] text-muted-foreground italic">
            Este texto se mostrará en un aviso antes de que el huésped acceda a la URL de registro.
          </p>
        </div>
      </div>
    </div>
  )
}


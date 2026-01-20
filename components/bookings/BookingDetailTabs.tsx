"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CreditCard } from "lucide-react"
import { ReactNode } from "react"

interface BookingDetailTabsProps {
  detailsContent: ReactNode
  paymentsContent: ReactNode
}

export function BookingDetailTabs({ detailsContent, paymentsContent }: BookingDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("details")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
      {/* Móvil: Select */}
      <div className="block md:hidden">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Sección
          </Label>
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="h-12 bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl font-bold focus:ring-indigo-500">
              <SelectValue placeholder="Seleccione una sección" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl overflow-hidden">
              <SelectItem value="details" className="font-bold py-3 focus:bg-teal-50 focus:text-indigo-600 cursor-pointer">Detalles</SelectItem>
              <SelectItem value="payments" className="font-bold py-3 focus:bg-teal-50 focus:text-indigo-600 cursor-pointer">Pagos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop: Tabs */}
      <div className="hidden md:block">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-[1.25rem] h-auto border border-white inline-flex">
          <TabsTrigger
            value="details"
            className="rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-[0_8px_20px_rgb(0,0,0,0.06)]"
          >
            Detalles
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-[0_8px_20px_rgb(0,0,0,0.06)] flex items-center gap-2"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Pagos
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="details" className="mt-0 focus-visible:outline-none">
        {detailsContent}
      </TabsContent>

      <TabsContent value="payments" className="mt-0 focus-visible:outline-none">
        {paymentsContent}
      </TabsContent>
    </Tabs>
  )
}


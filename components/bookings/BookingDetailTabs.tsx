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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      {/* Móvil: Select */}
      <div className="block md:hidden">
        <Label htmlFor="tab-select" className="mb-2 block">
          Sección
        </Label>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger id="tab-select" className="w-full">
            <SelectValue placeholder="Seleccione una sección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="details">Detalles</SelectItem>
            <SelectItem value="payments">Pagos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Tabs */}
      <div className="hidden md:block">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pagos
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="details" className="space-y-6">
        {detailsContent}
      </TabsContent>

      <TabsContent value="payments" className="space-y-6">
        {paymentsContent}
      </TabsContent>
    </Tabs>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Upload, X, Globe, Percent, CheckCircle2, Building2, ShieldCheck, Mail, Phone, Calculator, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { SalesChannelWithDetails, CreateSalesChannelData, UpdateSalesChannelData } from "@/types/sales-channels"
import type { ConfigurationValue } from "@/lib/api/configuration"

interface SalesChannelFormProps {
    channel?: SalesChannelWithDetails
    tenantId: string
    onSave?: (data: CreateSalesChannelData | UpdateSalesChannelData) => Promise<boolean>
    title: string
    subtitle: string
}

export function SalesChannelForm({
    channel,
    tenantId,
    onSave,
    title,
    subtitle,
}: SalesChannelFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [isDirty, setIsDirty] = useState(false)

    const [formData, setFormData] = useState({
        full_name: channel?.person.full_name ?? "",
        document_type: channel?.person.document_type ?? "",
        document_number: channel?.person.document_number ?? "",
        email: channel?.person.email ?? "",
        phone: channel?.person.phone ?? "",
        logo_url: channel?.logo_url ?? "",
        sales_commission: channel?.sales_commission ?? 0,
        collection_commission: channel?.collection_commission ?? 0,
        apply_tax: channel?.apply_tax ?? false,
        tax_type_id: channel?.tax_type_id ?? "",
        notes: channel?.person.notes ?? "",
        is_active: channel?.is_active ?? true,
        is_own_channel: channel?.is_own_channel ?? false,
    })

    const [taxTypes, setTaxTypes] = useState<ConfigurationValue[]>([])
    const [loadingTaxTypes, setLoadingTaxTypes] = useState(false)

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [logoPreview, setLogoPreview] = useState<string | null>(formData.logo_url || null)

    useEffect(() => {
        const loadTaxTypes = async () => {
            setLoadingTaxTypes(true)
            try {
                const response = await fetch("/api/configuration/tax-types")
                if (response.ok) {
                    const data = await response.json()
                    setTaxTypes(data)
                    if (!channel && formData.apply_tax && !formData.tax_type_id && data.length > 0) {
                        const defaultTaxType = data.find((t: ConfigurationValue) => t.is_default === true)
                        if (defaultTaxType) setFormData(prev => ({ ...prev, tax_type_id: defaultTaxType.id }))
                    }
                }
            } catch (error) {
                console.error("Error loading tax types:", error)
            } finally {
                setLoadingTaxTypes(false)
            }
        }
        loadTaxTypes()
    }, [channel])

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingLogo(true)
        try {
            const data = new FormData()
            data.append("file", file)
            const response = await fetch("/api/upload/logo", { method: "POST", body: data })
            if (!response.ok) throw new Error("Error al subir el logo")
            const { url } = await response.json()
            setFormData((prev) => ({ ...prev, logo_url: url }))
            setLogoPreview(url)
            setIsDirty(true)
            toast({ title: "Logo subido" })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setUploadingLogo(false)
        }
    }

    const handleRemoveLogo = () => {
        setFormData({ ...formData, logo_url: "" })
        setLogoPreview(null)
        setIsDirty(true)
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        if (!formData.full_name?.trim()) newErrors.full_name = "El nombre es obligatorio"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!validateForm()) return
        setLoading(true)
        try {
            const channelData = {
                full_name: formData.full_name?.trim() || "",
                document_type: formData.document_type?.trim() || null,
                document_number: formData.document_number?.trim() || null,
                email: formData.email?.trim() || null,
                phone: formData.phone?.trim() || null,
                logo_url: formData.logo_url?.trim() || null,
                sales_commission: formData.sales_commission ?? 0,
                collection_commission: formData.collection_commission ?? 0,
                apply_tax: formData.apply_tax ?? false,
                tax_type_id: formData.apply_tax && formData.tax_type_id ? formData.tax_type_id : null,
                notes: formData.notes?.trim() || null,
                is_active: formData.is_active ?? true,
                is_own_channel: formData.is_own_channel ?? false,
            }

            if (onSave) {
                await onSave(channelData as CreateSalesChannelData)
            } else {
                const url = channel ? `/api/sales-channels/${channel.id}` : "/api/sales-channels"
                const method = channel ? "PUT" : "POST"
                const response = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(channelData),
                })
                if (!response.ok) throw new Error("Error al guardar")
            }
            toast({ title: channel ? "Actualizado" : "Creado" })
            router.push("/dashboard/sales-channels")
            router.refresh()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* FIXED HEADER - Unified with PropertyForm style */}
            <div className="px-8 pt-8 pb-6 shrink-0 bg-white border-b border-slate-100 shadow-sm z-50">
                <div className="flex items-center gap-6 max-w-[1600px] mx-auto">
                    <Link href="/dashboard/sales-channels">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                            {title}
                        </h1>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {subtitle}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-inner">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.is_active ? "text-emerald-600" : "text-slate-400"}`}>
                            {formData.is_active ? "Canal Activo" : "Canal Inactivo"}
                        </span>
                        <Switch
                            checked={formData.is_active}
                            onCheckedChange={(val) => handleFieldChange("is_active", val)}
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1600px] mx-auto">
                    <form onSubmit={handleSubmit} id="sales-channel-form" className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-10">

                        {/* Left Column: Identidad & Contacto (8 cols) */}
                        <div className="xl:col-span-8 space-y-8">
                            <Card className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgb(0,0,0,0.03)] bg-white overflow-hidden">
                                <div className="bg-slate-50/30 px-10 py-6 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">Información Corporativa</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Identidad y contacto del canal</p>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-10 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Comercial</Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                <Input
                                                    value={formData.full_name}
                                                    onChange={(e) => handleFieldChange("full_name", e.target.value)}
                                                    placeholder="Booking.com, Airbnb, etc."
                                                    className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg pl-14"
                                                />
                                            </div>
                                            {errors.full_name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.full_name}</p>}
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono Directo</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                                                    className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg pl-14"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email de Operaciones</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleFieldChange("email", e.target.value)}
                                                    className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold pl-14"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Documento</Label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                <Input
                                                    value={formData.document_type}
                                                    onChange={(e) => handleFieldChange("document_type", e.target.value)}
                                                    placeholder="CIF / NIF"
                                                    className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold pl-14 uppercase"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nº Identificación</Label>
                                            <Input
                                                value={formData.document_number}
                                                onChange={(e) => handleFieldChange("document_number", e.target.value)}
                                                className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold px-6"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgb(0,0,0,0.03)] bg-white overflow-hidden">
                                <div className="bg-slate-50/30 px-10 py-6 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                            <Calculator className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">Finanzas e Impuestos</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cálculo de comisiones y tasas</p>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-10 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Comisión Venta (%)</Label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={formData.sales_commission}
                                                    onChange={(e) => handleFieldChange("sales_commission", parseFloat(e.target.value) || 0)}
                                                    className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg px-6 pr-12"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Comisión Cobro (%)</Label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={formData.collection_commission}
                                                    onChange={(e) => handleFieldChange("collection_commission", parseFloat(e.target.value) || 0)}
                                                    className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg px-6 pr-12"
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Impuesto Aplicable</Label>
                                            <div className="flex h-14 items-center justify-between gap-6 px-6 bg-slate-50 border border-slate-100 rounded-2xl transition-all">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        id="apply_tax"
                                                        checked={formData.apply_tax}
                                                        onCheckedChange={(checked) => handleFieldChange("apply_tax", checked as boolean)}
                                                        className="rounded-md h-5 w-5 border-slate-300"
                                                    />
                                                    <Label htmlFor="apply_tax" className="text-xs font-black text-slate-500 uppercase tracking-tight cursor-pointer">Cargar IVA sobre comisiones</Label>
                                                </div>
                                                {formData.apply_tax && (
                                                    <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
                                                        <Select
                                                            value={formData.tax_type_id}
                                                            onValueChange={(val) => handleFieldChange("tax_type_id", val)}
                                                        >
                                                            <SelectTrigger className="rounded-xl h-10 border-slate-200 bg-white shadow-sm font-bold text-slate-700 px-4">
                                                                <SelectValue placeholder="Impuesto..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white">
                                                                {taxTypes.map(t => (
                                                                    <SelectItem key={t.id} value={t.id} className="font-bold text-slate-700">
                                                                        {t.label} ({t.description}%)
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Assets & Config (4 cols) */}
                        <div className="xl:col-span-4 space-y-8">
                            <Card className="rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white overflow-hidden text-center">
                                <div className="bg-slate-50/30 px-8 py-5 border-b border-slate-100 flex items-center justify-center gap-2">
                                    <h3 className="font-black text-slate-900 tracking-tighter uppercase text-[11px] tracking-widest">Logo del Canal</h3>
                                </div>
                                <CardContent className="p-10 space-y-6">
                                    <div className="relative mx-auto h-40 w-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center overflow-hidden group hover:border-indigo-300 transition-colors">
                                        {logoPreview ? (
                                            <>
                                                <Image src={logoPreview} alt="Logo" fill className="object-contain p-8" />
                                                <button onClick={handleRemoveLogo} className="absolute top-3 right-3 p-2 bg-white shadow-lg rounded-full text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <Upload className="w-10 h-10 text-slate-200" />
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        <Button asChild variant="outline" className="w-full rounded-2xl h-12 border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 shadow-sm">
                                            <label htmlFor="logo" className="cursor-pointer">
                                                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                                Cambiar Imagen
                                            </label>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white overflow-hidden">
                                <div className="bg-slate-50/30 px-8 py-5 border-b border-slate-100">
                                    <h3 className="font-black text-slate-900 tracking-tighter uppercase text-[11px] tracking-widest">Configuraciones</h3>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 transition-all hover:bg-white hover:border-indigo-100 group">
                                        <div>
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">Venta Directa Motor</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">En Landing Propia</p>
                                        </div>
                                        <Switch checked={formData.is_own_channel} onCheckedChange={(val) => handleFieldChange("is_own_channel", val)} />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Anotaciones</Label>
                                        <Textarea
                                            value={formData.notes || ""}
                                            onChange={(e) => handleFieldChange("notes", e.target.value)}
                                            className="min-h-[140px] rounded-[1.5rem] border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 font-medium text-sm p-6 transition-all"
                                            placeholder="..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </div>
            </div>

            {/* FIXED FOOTER ACTIONS - Unified with PropertyForm style */}
            <div className="px-8 py-6 bg-white border-t border-slate-100 shrink-0 z-50">
                <div className="max-w-[1600px] mx-auto flex flex-col-reverse sm:flex-row gap-4 justify-between items-center">
                    <div className="hidden sm:block">
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">
                            {isDirty ? "Cambios no guardados" : "Datos actualizados"}
                        </p>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Link href="/dashboard/sales-channels" className="flex-1 sm:flex-initial">
                            <Button
                                variant="outline"
                                className="w-full sm:px-10 h-12 rounded-2xl font-black uppercase text-[11px] tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                                type="button"
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            form="sales-channel-form"
                            type="submit"
                            disabled={loading}
                            className="flex-1 sm:flex-initial sm:px-14 h-12 rounded-2xl font-black uppercase text-[11px] tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>{channel ? "Actualizar Canal" : "Crear Canal"}</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

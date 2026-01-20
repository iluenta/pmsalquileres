"use client";

import React from "react";
import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    Globe,
    LayoutDashboard,
    BookOpen,
    Wallet,
    Star,
    ShieldCheck,
    Zap,
    PlayCircle
} from "lucide-react";
import Image from "next/image";

// Premium Components inspired by ConvoHunter
const Badge = ({ children }: { children: React.ReactNode }) => (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8 animate-fade-in">
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-[0.2em]">{children}</span>
    </div>
);

const PrimaryButton = ({ href, children, icon: Icon = ArrowRight, className = "" }: { href: string, children: React.ReactNode, icon?: any, className?: string }) => (
    <Link
        href={href}
        className={`group px-8 py-4 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 ${className}`}
    >
        {children} <Icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </Link>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-500">
            <Icon className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-lg">{description}</p>
    </div>
);

const BentoItem = ({ className, title, description, icon: Icon, image, dark = false }: { className?: string, title: string, description: string, icon: any, image?: string, dark?: boolean }) => (
    <div className={`p-10 rounded-[3rem] relative overflow-hidden group border border-slate-100 ${className}`}>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${dark ? 'bg-white/10' : 'bg-indigo-100'}`}>
                <Icon className={`w-6 h-6 ${dark ? 'text-white' : 'text-indigo-600'}`} />
            </div>
            <h3 className={`text-3xl font-bold mb-4 tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            <p className={`max-w-xs leading-relaxed text-lg ${dark ? 'text-white/70' : 'text-slate-500'}`}>{description}</p>
        </div>
        {image && (
            <div className="absolute bottom-0 right-0 w-3/4 h-3/4 translate-x-12 translate-y-12 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-700 ease-out">
                <Image src={image} alt={title} width={600} height={600} className="rounded-2xl shadow-2xl rotate-[-4deg] border-4 border-white/10" />
            </div>
        )}
    </div>
);

export function ProductLandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* Floating Navbar */}
            <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-[100]">
                <div className="bg-white/70 backdrop-blur-2xl border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-8 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-lg shadow-indigo-200">
                            <span className="text-white font-black text-lg">P</span>
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-slate-900">PMS Pro</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Características</Link>
                        <Link href="#showcase" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Soluciones</Link>
                        <Link href="#pricing" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Precios</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/login" className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            Entrar
                        </Link>
                        <Link href="/register" className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200">
                            Free Trial
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section: Centered & Massive */}
            <section className="relative pt-60 pb-32 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50 rounded-full blur-[140px] opacity-40" />
                </div>

                <div className="max-w-5xl mx-auto text-center">
                    <Badge>Software para Propietarios Exigentes</Badge>

                    <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.95] mb-10 tracking-[0.02em] animate-fade-in-up">
                        El control total de tus <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-900">alquileres, reinventado.</span>
                    </h1>

                    <p className="text-xl sm:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                        PMS Pro es la plataforma ágil y sencilla que necesitabas. Gestiona reservas, finanzas y la experiencia de tus huéspedes sin fricciones.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
                        <PrimaryButton href="/register">Empezar Ahora</PrimaryButton>
                        <Link href="#demo" className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-slate-700 hover:bg-slate-50 transition-all border border-slate-200">
                            <PlayCircle className="w-6 h-6 text-indigo-600" /> Ver Demo
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="flex flex-col items-center gap-4 mb-20">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                    <Image src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" width={40} height={40} />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Con la confianza de +1.200 anfitriones</p>
                    </div>

                    {/* Main Mockup with Perspective */}
                    <div className="relative max-w-6xl mx-auto group">
                        <div className="absolute -inset-1 blur-3xl bg-indigo-500/10 rounded-[3rem] group-hover:bg-indigo-500/20 transition-all duration-500" />
                        <div className="relative rounded-[2.5rem] bg-slate-900 p-2 shadow-3xl border border-slate-200/10 transition-transform duration-700 group-hover:scale-[1.01]">
                            <Image
                                src="/pms_dashboard_mockup_1768590374907.png"
                                alt="PMS Dashboard"
                                width={1600}
                                height={1000}
                                className="w-full h-auto rounded-[2rem]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Grid: Solutions */}
            <section id="showcase" className="py-40 px-6 bg-slate-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20 px-4">
                        <div className="max-w-2xl">
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-6 underline decoration-indigo-500/20 underline-offset-8">
                                Un ecosistema diseñado <br />para tu rentabilidad.
                            </h2>
                            <p className="text-xl text-slate-500 font-medium">Desde el check-in hasta el cierre de mes, todo fluye sin salir de PMS Pro.</p>
                        </div>
                        <Link href="#all-features" className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-4 transition-all">
                            Ver todas las funciones <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-10">
                        <BentoItem
                            className="lg:col-span-2 bg-indigo-50/50"
                            title="Tu Web de Reserva Directa"
                            description="Elimina intermediarios. Crea tu propia web de reservas optimizada y ahorra hasta un 15% en comisiones."
                            icon={Globe}
                            image="/direct_booking_mockup_1768590405882.png"
                        />
                        <BentoItem
                            dark
                            className="bg-indigo-600 text-white"
                            title="Digital Guest Experience"
                            description="Guías digitales interactivas en el móvil del huésped. Códigos WiFi, instrucciones y recomendaciones locales."
                            icon={Star}
                            image="/guest_guide_mockup_1768590390987.png"
                        />
                        <BentoItem
                            dark
                            className="bg-slate-900 text-white"
                            title="Channel Manager Pro"
                            description="Sincronización instantánea con Airbnb y Booking. Despídete de los retrasos en calendarios."
                            icon={Zap}
                        />
                        <BentoItem
                            className="lg:col-span-2 bg-slate-50 border-slate-200/50"
                            title="Control Financiero Real"
                            description="Automatiza tus liquidaciones a propietarios y proveedores. Informes de rentabilidad neta al instante."
                            icon={Wallet}
                        />
                    </div>
                </div>
            </section>

            {/* Main Features Grid */}
            <section id="features" className="py-40 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={LayoutDashboard}
                            title="Gestión Ágil"
                            description="Panel centralizado intuitivo para gestionar múltiples propiedades sin complicaciones técnicas."
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Privacidad & Seguridad"
                            description="Tus datos y los de tus clientes protegidos con estándares bancarios. Control multi-usuario."
                        />
                        <FeatureCard
                            icon={BookOpen}
                            title="Guías del Huésped"
                            description="Añade valor a la estancia. Guías personalizables que tus clientes amarán consultar en su móvil."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section: High Contrast */}
            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto rounded-[4rem] bg-indigo-600 p-16 lg:p-32 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]" />
                    <div className="relative z-10">
                        <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-10 tracking-tighter">¿Hablamos de tus <br />próximas reservas?</h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/register" className="px-12 py-6 bg-white text-indigo-600 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-xl">
                                Empezar Gratis
                            </Link>
                            <Link href="/demo" className="px-12 py-6 bg-indigo-700/50 backdrop-blur-sm border border-white/20 text-white rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all">
                                Solicitar Demo
                            </Link>
                        </div>
                        <p className="mt-10 text-indigo-100/80 font-bold uppercase tracking-widest text-sm">
                            Soporte personalizado en español. Sin compromiso.
                        </p>
                    </div>
                </div>
            </section>

            {/* Compact Footer */}
            <footer className="py-24 border-t border-slate-100 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
                        <div className="max-w-xs">
                            <Link href="/" className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <span className="text-white font-black">P</span>
                                </div>
                                <span className="text-2xl font-black tracking-tighter text-slate-900">PMS Pro</span>
                            </Link>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                La solución definitiva para propietarios que buscan escala, control y una experiencia de huésped de lujo.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 uppercase tracking-[0.2em] text-[10px] font-black">
                            <div className="flex flex-col gap-6">
                                <span className="text-slate-900">Producto</span>
                                <Link href="#" className="text-slate-400 hover:text-indigo-600">Funciones</Link>
                                <Link href="#" className="text-slate-400 hover:text-indigo-600">Precios</Link>
                                <Link href="#" className="text-slate-400 hover:text-indigo-600">Seguridad</Link>
                            </div>
                            <div className="flex flex-col gap-6">
                                <span className="text-slate-900">Compañía</span>
                                <Link href="#" className="text-slate-400 hover:text-indigo-600">Sobre nosotros</Link>
                                <Link href="#" className="text-slate-400 hover:text-indigo-600">Contacto</Link>
                                <Link href="#" className="text-slate-400 hover:text-indigo-600">Blog</Link>
                            </div>
                            <div className="hidden sm:flex flex-col gap-6">
                                <span className="text-slate-900">Legal</span>
                                <Link href="#" className="text-slate-400 hover:text-indigo-600">Privacidad</Link>
                                <Link href="#" className="text-slate-400 hover:text-indigo-600">Términos</Link>
                                <Link href="#" className="text-slate-400 hover:text-indigo-600">Cookies</Link>
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-sm font-bold text-slate-300">
                            © 2026 PMS Pro Software SL. Todos los derechos reservados.
                        </div>
                        <div className="flex gap-6">
                            <div className="w-5 h-5 bg-slate-100 rounded-full" />
                            <div className="w-5 h-5 bg-slate-100 rounded-full" />
                            <div className="w-5 h-5 bg-slate-100 rounded-full" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

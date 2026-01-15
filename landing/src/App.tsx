import React, { useState } from 'react';
import { WifiIcon, TvIcon, WindIcon, UtensilsIcon, CoffeeIcon, ShieldIcon, BedDoubleIcon, BathIcon, ChefHatIcon, MapPinIcon, UsersIcon, StarIcon, MenuIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, MinusIcon, PlusIcon, InfoIcon, ClockIcon } from 'lucide-react';
const galleryImages = [{
  url: "/image.png",
  label: 'Salón'
}, {
  url: "/image.png",
  label: 'Terraza'
}, {
  url: "/image.png",
  label: 'Habitación'
}, {
  url: "/image.png",
  label: 'Cocina'
}, {
  url: "/image.png",
  label: 'Baño'
}];
const features = [{
  icon: WifiIcon,
  title: 'WiFi de Alta Velocidad',
  description: 'Conexión rápida y estable para trabajar o disfrutar'
}, {
  icon: TvIcon,
  title: 'Entretenimiento Completo',
  description: 'TV, streaming services y sonido envolvente'
}, {
  icon: WindIcon,
  title: 'Aire Acondicionado',
  description: 'Climatización individual en todas las habitaciones'
}, {
  icon: UtensilsIcon,
  title: 'Cocina Moderna',
  description: 'Equipada con todos los electrodomésticos'
}, {
  icon: CoffeeIcon,
  title: 'Zona de Relax',
  description: 'Terraza con vistas y mobiliario premium'
}, {
  icon: ShieldIcon,
  title: 'Seguridad 24/7',
  description: 'Sistema de seguridad y cerraduras inteligentes'
}];
const spaces = [{
  icon: BedDoubleIcon,
  title: '2 Habitaciones',
  description: 'Espacios amplios y confortables para tu descanso',
  features: ['Camas premium', 'Armarios espaciosos']
}, {
  icon: BathIcon,
  title: '1 Baño',
  description: 'Baños modernos y completamente equipados',
  features: ['Artículos de aseo incluidos', 'Toallas premium']
}, {
  icon: ChefHatIcon,
  title: 'Cocina Completa',
  description: 'Cocina totalmente equipada para preparar tus comidas',
  features: ['Electrodomésticos modernos', 'Utensilios de cocina']
}];
const navLinks = [{
  href: '#caracteristicas',
  label: 'Características'
}, {
  href: '#galeria',
  label: 'Galería'
}, {
  href: '#precios',
  label: 'Precios'
}, {
  href: '#ubicacion',
  label: 'Ubicación'
}];
export function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Calendar and booking state
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0)); // January 2026
  const [checkInDate, setCheckInDate] = useState<Date | null>(new Date(2026, 0, 15));
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(new Date(2026, 0, 17));
  const [guests, setGuests] = useState(2);
  const [showBookingForm, setShowBookingForm] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    pais: 'España',
    comentarios: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Reserved dates (example data)
  const reservedDates = [new Date(2026, 0, 1), new Date(2026, 0, 2), new Date(2026, 0, 3), new Date(2026, 0, 4), new Date(2026, 0, 5), new Date(2026, 0, 6), new Date(2026, 0, 7), new Date(2026, 0, 8), new Date(2026, 0, 9), new Date(2026, 0, 10), new Date(2026, 0, 11), new Date(2026, 0, 12), new Date(2026, 0, 13), new Date(2026, 0, 14)];
  const pricePerNight = 125;
  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return {
      daysInMonth,
      startingDayOfWeek: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1
    };
  };
  const isDateReserved = (date: Date) => {
    return reservedDates.some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear());
  };
  const isDateInRange = (date: Date) => {
    if (!checkInDate || !checkOutDate) return false;
    return date >= checkInDate && date <= checkOutDate;
  };
  const isCheckInOrOut = (date: Date) => {
    if (!checkInDate && !checkOutDate) return false;
    return checkInDate && date.getDate() === checkInDate.getDate() && date.getMonth() === checkInDate.getMonth() || checkOutDate && date.getDate() === checkOutDate.getDate() && date.getMonth() === checkOutDate.getMonth();
  };
  const handleDateClick = (date: Date) => {
    if (isDateReserved(date)) return;
    if (!checkInDate || checkInDate && checkOutDate) {
      setCheckInDate(date);
      setCheckOutDate(null);
    } else if (date > checkInDate) {
      setCheckOutDate(date);
    } else {
      setCheckInDate(date);
      setCheckOutDate(null);
    }
  };
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  const getMonthName = (date: Date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[date.getMonth()]} De ${date.getFullYear()}`;
  };
  const nights = calculateNights();
  const totalPrice = nights * pricePerNight;
  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % galleryImages.length);
  };
  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length);
  };
  return <div className="min-h-screen w-full bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VT</span>
              </div>
              <span className="text-slate-900 font-semibold text-lg tracking-tight">
                VeraTespera
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => <a key={link.href} href={link.href} className="text-slate-600 text-sm font-medium transition-colors hover:text-teal-600">
                  {link.label}
                </a>)}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <a href="#" className="text-slate-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:text-teal-600 hover:bg-slate-50">
                Guía del Huésped
              </a>
              <a href="#" className="bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all hover:bg-teal-700 hover:scale-105">
                Reservar Ahora
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 hover:text-slate-900" aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}>
              {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && <div className="md:hidden bg-white border-t border-slate-100">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map(link => <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block text-slate-600 text-base font-medium py-2 transition-colors hover:text-teal-600">
                  {link.label}
                </a>)}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <a href="#" className="block text-slate-600 text-base font-medium py-2 transition-colors hover:text-teal-600">
                  Guía del Huésped
                </a>
                <a href="#" className="block bg-teal-600 text-white text-center text-base font-medium px-5 py-3 rounded-lg transition-all hover:bg-teal-700">
                  Reservar Ahora
                </a>
              </div>
            </div>
          </div>}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src="/image.png" alt="Interior del apartamento VeraTespera" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="text-white/90 text-sm font-medium">
              Lujo & Confort en Vera
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
            VeraTespera
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 mb-8 font-light">
            Propiedad superchula en Vera
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a href="#" className="w-full sm:w-auto bg-teal-600 text-white font-medium px-8 py-3.5 rounded-lg transition-all hover:bg-teal-700 hover:scale-105">
              Reservar Ahora
            </a>
            <a href="#caracteristicas" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/30 text-white font-medium px-8 py-3.5 rounded-lg transition-all hover:bg-white/20 hover:scale-105">
              Ver Detalles
            </a>
          </div>

          {/* Ratings */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className="text-white font-semibold">5</span>
              <span className="text-white/70">/ 5</span>
              <span className="text-white/60 text-sm">4 reseñas</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">B</span>
              </div>
              <span className="text-white font-semibold">4.7</span>
              <span className="text-white/70">/ 5</span>
              <span className="text-white/60 text-sm">25 reseñas</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span className="text-white font-semibold">4.9</span>
              <span className="text-white/70">/ 5</span>
              <span className="text-white/60 text-sm">15 reseñas</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              <span>6 huéspedes</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              <span>Vera</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Lo Mejor de VeraTespera
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Lujo, comodidad y atención al detalle en cada rincón del
              apartamento
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => <div key={index} className="bg-white rounded-xl p-6 border border-slate-200/80">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeria" className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Galería
            </h2>
            <p className="text-slate-600 text-lg">
              Descubre cada rincón de VeraTespera en detalle
            </p>
          </div>

          {/* Featured Image */}
          <div className="relative mb-4 rounded-2xl overflow-hidden bg-slate-100">
            <div className="aspect-video">
              <img src={galleryImages[currentImageIndex].url} alt={galleryImages[currentImageIndex].label} className="w-full h-full object-cover" />
            </div>

            {/* Navigation Arrows */}
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-white hover:scale-110" aria-label="Imagen anterior">
              <ChevronLeftIcon className="w-5 h-5 text-slate-700" />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-white hover:scale-110" aria-label="Imagen siguiente">
              <ChevronRightIcon className="w-5 h-5 text-slate-700" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-4 bg-slate-900/70 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-lg">
              {currentImageIndex + 1} / {galleryImages.length}
            </div>

            {/* Label */}
            <div className="absolute bottom-4 right-4 bg-slate-900/70 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-lg">
              {galleryImages[currentImageIndex].label}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-5 gap-3">
            {galleryImages.map((image, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`relative aspect-square rounded-lg overflow-hidden transition-all ${index === currentImageIndex ? 'ring-2 ring-teal-600 ring-offset-2' : 'opacity-70 hover:opacity-100'}`} aria-label={`Ver ${image.label}`}>
                <img src={image.url} alt={image.label} className="w-full h-full object-cover" />
              </button>)}
          </div>
        </div>
      </section>

      {/* Spaces Section */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Espacios Pensados para Ti
            </h2>
            <p className="text-slate-600 text-lg">
              Cada rincón diseñado con atención y confort
            </p>
          </div>

          {/* Spaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spaces.map((space, index) => <div key={index} className="bg-white rounded-xl p-8 border border-slate-200/80">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-5">
                  <space.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {space.title}
                </h3>
                <p className="text-slate-600 mb-5">{space.description}</p>
                <ul className="space-y-2">
                  {space.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-center gap-2 text-slate-700 text-sm">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                      {feature}
                    </li>)}
                </ul>
              </div>)}
          </div>
        </div>
      </section>

      {/* Pricing Section with Calendar */}
      <section id="precios" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Sistema de Reservas
            </h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">
              Selecciona tus fechas y completa tu reserva en VeraTespera
            </p>
          </div>

          {/* Calendar and Booking Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Selecciona tus Fechas
              </h3>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Mes anterior">
                  <ChevronLeftIcon className="w-5 h-5 text-slate-700" />
                </button>
                <h4 className="text-lg font-semibold text-slate-900">
                  {getMonthName(currentMonth)}
                </h4>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Mes siguiente">
                  <ChevronRightIcon className="w-5 h-5 text-slate-700" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-rose-200 rounded"></div>
                  <span className="text-slate-600">Reservado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded"></div>
                  <span className="text-slate-600">Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-700 rounded"></div>
                  <span className="text-slate-600">Entrada/Salida</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <div key={index} className="text-center text-sm font-medium text-slate-500 py-2">
                      {day}
                    </div>)}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                  const {
                    daysInMonth,
                    startingDayOfWeek
                  } = getDaysInMonth(currentMonth);
                  const days = [];
                  // Empty cells before first day
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(<div key={`empty-${i}`} />);
                  }
                  // Days of month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const reserved = isDateReserved(date);
                    const inRange = isDateInRange(date);
                    const isCheckInOut = isCheckInOrOut(date);
                    days.push(<button key={day} onClick={() => handleDateClick(date)} disabled={reserved} className={`
                            aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                            ${reserved ? 'bg-rose-200 text-rose-800 cursor-not-allowed' : ''}
                            ${!reserved && isCheckInOut ? 'bg-teal-700 text-white' : ''}
                            ${!reserved && inRange && !isCheckInOut ? 'bg-blue-100 text-blue-900' : ''}
                            ${!reserved && !inRange && !isCheckInOut ? 'hover:bg-slate-100 text-slate-700' : ''}
                          `}>
                          {day}
                        </button>);
                  }
                  return days;
                })()}
                </div>
              </div>

              {/* Selected Dates Display */}
              {checkInDate && checkOutDate && <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <p className="text-teal-800 font-medium text-sm">
                    Fechas seleccionadas: {formatDate(checkInDate)} -{' '}
                    {formatDate(checkOutDate)}
                  </p>
                </div>}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border-2 border-slate-900 sticky top-24">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Tu Reserva
                </h3>

                {/* Check-in */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Check-in</span>
                  </div>
                  <p className="text-teal-700 font-semibold">
                    {checkInDate ? formatDate(checkInDate) : 'Selecciona fecha'}
                  </p>
                </div>

                {/* Check-out */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>Check-out</span>
                  </div>
                  <p className="text-slate-900 font-semibold">
                    {checkOutDate ? formatDate(checkOutDate) : 'Selecciona fecha'}
                  </p>
                </div>

                {/* Nights */}
                <div className="mb-6 pb-6 border-b border-slate-200">
                  <p className="text-slate-600 text-sm mb-1">Noches</p>
                  <p className="text-slate-900 font-bold text-lg">
                    {nights} noches
                  </p>
                </div>

                {/* Guests */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
                    <UsersIcon className="w-4 h-4" />
                    <span>Huéspedes</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors" aria-label="Reducir huéspedes">
                      <MinusIcon className="w-4 h-4 text-slate-700" />
                    </button>
                    <span className="font-semibold text-slate-900">
                      {guests}
                    </span>
                    <button onClick={() => setGuests(Math.min(6, guests + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors" aria-label="Aumentar huéspedes">
                      <PlusIcon className="w-4 h-4 text-slate-700" />
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      €{pricePerNight} × {nights} noches
                    </span>
                    <span className="font-semibold text-slate-900">
                      €{totalPrice}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-teal-700">
                    €{totalPrice}
                  </span>
                </div>

                {/* CTA Button */}
                <button onClick={() => setShowBookingForm(true)} disabled={!checkInDate || !checkOutDate} className="w-full bg-teal-700 text-white font-medium py-3.5 rounded-lg transition-all hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed">
                  Continuar a Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      {showBookingForm && <section className="py-20 lg:py-28 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Finalizar Reserva
              </h2>
              <p className="text-slate-600 text-lg">
                Completa tus datos para confirmar tu estancia en VeraTespera
              </p>
            </div>

            {/* Form and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Form */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-8 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Datos Personales
                </h3>

                <div className="space-y-6">
                  {/* Name and Surname */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="Tu nombre" value={formData.nombre} onChange={e => setFormData({
                    ...formData,
                    nombre: e.target.value
                  })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Apellido <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="Tu apellido" value={formData.apellido} onChange={e => setFormData({
                    ...formData,
                    apellido: e.target.value
                  })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
                    </div>
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input type="email" placeholder="tu@email.com" value={formData.email} onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input type="tel" placeholder="+34 123 456 789" value={formData.telefono} onChange={e => setFormData({
                    ...formData,
                    telefono: e.target.value
                  })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      País
                    </label>
                    <input type="text" value={formData.pais} onChange={e => setFormData({
                  ...formData,
                  pais: e.target.value
                })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
                  </div>

                  {/* Special Comments */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Comentarios especiales
                    </label>
                    <textarea placeholder="Ej: Preferencias de horarios, requerimientos especiales..." rows={4} value={formData.comentarios} onChange={e => setFormData({
                  ...formData,
                  comentarios: e.target.value
                })} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none" />
                  </div>

                  {/* Info Message */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      El pago se procesará de forma segura. Recibirás un email
                      de confirmación con los detalles de tu reserva.
                    </p>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="terms" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-2 focus:ring-teal-600 mt-0.5" />
                    <label htmlFor="terms" className="text-sm text-slate-700">
                      Acepto los términos y condiciones y la política de
                      privacidad <span className="text-red-500">*</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button disabled={!formData.nombre || !formData.apellido || !formData.email || !formData.telefono || !termsAccepted} className="w-full bg-teal-700 text-white font-medium py-4 rounded-lg transition-all hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed">
                    Confirmar Reserva
                  </button>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 border-2 border-slate-900 sticky top-24">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    Resumen de tu Reserva
                  </h3>

                  {/* Check-in */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Check-in</span>
                    </div>
                    <p className="text-slate-900 font-semibold">
                      {checkInDate ? formatDate(checkInDate) : ''}
                    </p>
                  </div>

                  {/* Check-out */}
                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>Check-out</span>
                    </div>
                    <p className="text-slate-900 font-semibold">
                      {checkOutDate ? formatDate(checkOutDate) : ''}
                    </p>
                  </div>

                  {/* Guests */}
                  <div className="mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                      <UsersIcon className="w-4 h-4" />
                      <span>Huéspedes</span>
                    </div>
                    <p className="text-slate-900 font-semibold">
                      {guests} personas
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        €{pricePerNight} × {nights} noches
                      </span>
                      <span className="font-semibold text-slate-900">
                        €{totalPrice}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Servicio</span>
                      <span className="font-semibold text-slate-900">€0</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-teal-700">
                      €{totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>}

      {/* Location Section */}
      <section id="ubicacion" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Ubicación
            </h2>
            <p className="text-slate-600 text-lg">
              En el corazón de Vera, cerca de todo
            </p>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="aspect-video bg-slate-100 flex items-center justify-center">
              <div className="text-center">
                <MapPinIcon className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  Vera, Almería, España
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  A 5 min de la playa
                </p>
              </div>
            </div>
          </div>

          {/* Location Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[{
            label: 'Playa',
            distance: '5 min'
          }, {
            label: 'Supermercado',
            distance: '2 min'
          }, {
            label: 'Restaurantes',
            distance: '3 min'
          }, {
            label: 'Centro',
            distance: '10 min'
          }].map((item, index) => <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-slate-900 font-semibold">{item.label}</p>
                <p className="text-teal-600 text-sm font-medium">
                  {item.distance}
                </p>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            ¿Listo para tu escapada?
          </h2>
          <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
            Reserva ahora y disfruta de una experiencia única en VeraTespera
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#" className="w-full sm:w-auto bg-white text-teal-600 font-medium px-8 py-3.5 rounded-lg transition-all hover:bg-teal-50 hover:scale-105">
              Reservar Ahora
            </a>
            <a href="#" className="w-full sm:w-auto bg-teal-500 text-white font-medium px-8 py-3.5 rounded-lg transition-all hover:bg-teal-400 hover:scale-105">
              Contactar
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VT</span>
                </div>
                <span className="text-white font-semibold text-lg">
                  VeraTespera
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Tu hogar lejos de casa en Vera. Disfruta de lujo, comodidad y la
                mejor ubicación para unas vacaciones inolvidables.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Secciones</h4>
              <ul className="space-y-2">
                {navLinks.map(link => <li key={link.href}>
                    <a href={link.href} className="text-slate-400 text-sm transition-colors hover:text-white">
                      {link.label}
                    </a>
                  </li>)}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="text-white font-semibold mb-4">Información</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-400 text-sm transition-colors hover:text-white">
                    Guía del Huésped
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 text-sm transition-colors hover:text-white">
                    Política de Cancelación
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 text-sm transition-colors hover:text-white">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 mt-12 pt-8">
            <p className="text-slate-500 text-sm text-center">
              © {new Date().getFullYear()} VeraTespera. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>;
}
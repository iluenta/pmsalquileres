// Tipos para el sistema de reportes y análisis

export interface KPIData {
  totalRevenue: number // Ingreso bruto
  netRevenue: number // Ingreso neto (bruto - comisiones - impuestos)
  totalBookings: number
  nightsBooked: number
  occupancyRate: number // Porcentaje de ocupación
  adr: number // Average Daily Rate
  revpar: number // Revenue per Available Room
  trevpar: number // Total Revenue per Available Room
  netProfit: number // Beneficio neto (ingresos - gastos)
  averageLeadTime: number // Lead time medio en días
  averageAdvanceBooking: number // Antelación media en días
  averageStayDuration: number // Estancia media en días
  monthlyCashflow: number
}

export interface RevenueData {
  month: string // Formato "YYYY-MM" o "MM/YYYY"
  revenue: number
  netRevenue: number
  bookings: number
  nights: number
  adr: number
  revpar: number
  trevpar: number
}

export interface OccupancyData {
  propertyId: string
  propertyName: string
  occupancyRate: number
  bookedNights: number
  availableNights: number
  totalBookings: number
}

export interface ChannelData {
  channelId: string
  channelName: string
  revenue: number
  bookings: number
  nights: number
  percentage: number // Porcentaje del total
}

export interface ExpenseData {
  category: string // Nombre de la categoría (tipo de servicio)
  amount: number
  count: number // Número de gastos
  percentage: number // Porcentaje del total de gastos
}

export interface ExpenseByProperty {
  propertyId: string
  propertyName: string
  totalExpenses: number
  categories: ExpenseData[]
}

export interface BookingAnalytics {
  bookingId: string
  bookingCode: string
  propertyName: string
  guestName: string
  checkInDate: string
  checkOutDate: string
  nights: number
  revenue: number
  netRevenue: number
  channelName: string | null
  status: string
  leadTime: number // Días entre booking y check-in
  advanceBooking: number // Días entre creación y check-in
}

export interface GuestAnalytics {
  guestId: string
  guestName: string
  totalBookings: number
  totalNights: number
  totalRevenue: number
  country: string | null
  isRecurring: boolean
  lastBookingDate: string | null
}

export interface ProfitabilityData {
  propertyId: string
  propertyName: string
  revenue: number
  expenses: number
  netProfit: number
  roi: number // Return on Investment (%)
  cashflow: number
  breakEvenPoint: number // Número de noches necesarias para break-even
  occupancyRate: number
}

export interface MonthlyComparison {
  month: string
  currentYear: number
  previousYear: number | null
  currentValue: number
  previousValue: number | null
  change: number | null // Cambio porcentual
}

export interface ReportsFilters {
  year?: number | null
  dateFrom?: string | null
  dateTo?: string | null
  propertyId?: string | null
  channelId?: string | null
  compareYear?: number | null
  compareEnabled?: boolean
}

export interface ReportsData {
  kpis: KPIData
  revenue: RevenueData[]
  occupancy: OccupancyData[]
  channels: ChannelData[]
  expenses: ExpenseData[]
  expensesByProperty: ExpenseByProperty[]
  bookings: BookingAnalytics[]
  profitability: ProfitabilityData[]
  monthlyComparison: {
    revenue: MonthlyComparison[]
    bookings: MonthlyComparison[]
    occupancy: MonthlyComparison[]
  }
}


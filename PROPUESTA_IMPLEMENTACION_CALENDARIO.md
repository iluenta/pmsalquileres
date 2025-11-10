# Propuesta de Implementación - Calendario y Tipos de Reserva

## 1. TIPO DE RESERVA (Reserva Comercial / Período Cerrado)

### Cambios en Base de Datos

#### Script 035: Añadir columna booking_type_id
```sql
-- 035_add_booking_type_to_bookings.sql
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS booking_type_id UUID REFERENCES public.configuration_values(id);

CREATE INDEX IF NOT EXISTS idx_bookings_booking_type 
ON public.bookings(booking_type_id);

-- Asignar tipo "commercial" por defecto a reservas existentes
-- (se hará en el script de configuración)
```

#### Script 036: Crear configuración de tipo de reserva
```sql
-- 036_create_booking_type_config.sql
-- Similar a 022_create_booking_status_config.sql
-- Crear tipo "Tipo de Reserva" con valores:
-- - commercial: "Reserva Comercial" (color verde)
-- - closed_period: "Período Cerrado" (color amarillo)
```

### Cambios en Código

#### types/bookings.ts
- Añadir `booking_type_id: string | null` a `Booking`
- Añadir `booking_type?: { id, label, color } | null` a `BookingWithDetails`

#### lib/api/bookings.ts
- Cargar `booking_type` en `getBookings()` y `getBookingById()`
- En `createBooking()`: validar que períodos cerrados no tengan:
  - `person_id` (o usar un person_id especial/null)
  - `total_amount > 0` (debe ser 0)
  - `channel_id` (debe ser null)
  - `number_of_guests` (puede ser 0 o null)

#### components/bookings/BookingForm.tsx
- Añadir Select para "Tipo de Reserva"
- Si es "Período Cerrado":
  - Ocultar: Huésped, Canal de Venta, Importes, Número de huéspedes
  - Mostrar solo: Propiedad, Fechas, Estado, Notas
  - Validación: `total_amount` debe ser 0

---

## 2. CALENDARIO DE DISPONIBILIDAD

### Estructura de Archivos
```
app/dashboard/calendar/page.tsx              # Página principal
components/calendar/CalendarView.tsx         # Vista principal con selector de propiedad
components/calendar/MonthCalendar.tsx        # Componente de un mes
components/calendar/AvailabilityChecker.tsx  # Verificador de disponibilidad
lib/api/calendar.ts                          # API de disponibilidad
lib/utils/calendar.ts                        # Utilidades (detección solapamientos, etc.)
```

### Funcionalidades del Calendario

#### Vista Principal (CalendarView)
- **Selector de Propiedad**: Dropdown para seleccionar propiedad (obligatorio)
- **Navegación**: Botones "Mes Anterior" / "Mes Siguiente"
- **Vista de 2 Meses**: Lado a lado (responsive: apilados en móvil)
- **Fecha Actual**: Resaltada

#### Visualización por Día
- **Verde claro** (`bg-green-100 dark:bg-green-900/30`): Día libre
- **Rojo claro** (`bg-red-100 dark:bg-red-900/30`): Día con reserva comercial
  - Mostrar nombre del huésped al inicio del día
  - Tooltip con detalles: código reserva, fechas, huésped
- **Amarillo claro** (`bg-yellow-100 dark:bg-yellow-900/30`): Día con período cerrado
  - Tooltip: "Período Cerrado" + fechas

#### Interactividad
- Hover: Mostrar tooltip con detalles
- Click en día con reserva: Enlace a ver reserva
- Click en día libre: Opción para crear reserva rápida

### API de Disponibilidad

#### lib/api/calendar.ts
```typescript
export interface CalendarDay {
  date: Date
  isAvailable: boolean
  booking?: BookingWithDetails | null
  bookingType?: 'commercial' | 'closed_period' | null
}

export async function getCalendarAvailability(
  propertyId: string,
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarDay[]>

export async function checkAvailability(
  propertyId: string,
  tenantId: string,
  checkIn: Date,
  checkOut: Date
): Promise<{
  available: boolean
  conflicts: BookingWithDetails[]
  closedPeriods: BookingWithDetails[]
}>
```

#### Lógica de Consulta
```sql
-- Obtener todas las reservas que se solapan con el rango
SELECT * FROM bookings
WHERE property_id = $1
  AND tenant_id = $2
  AND (
    (check_in_date <= $4 AND check_out_date >= $3)
    OR (check_in_date BETWEEN $3 AND $4)
    OR (check_out_date BETWEEN $3 AND $4)
  )
ORDER BY check_in_date
```

### Componente MonthCalendar
- Props: `month: Date`, `bookings: CalendarDay[]`, `propertyId: string`
- Renderiza un mes usando `react-day-picker` o componente custom
- Aplica colores según disponibilidad
- Muestra nombre de huésped en días con reserva comercial

---

## 3. VERIFICACIÓN RÁPIDA DE DISPONIBILIDAD

### Componente AvailabilityChecker
- **Ubicación**: Integrado en la página del calendario (arriba o sidebar)
- **Inputs**:
  - Fecha de entrada (DatePicker)
  - Modo toggle: "Número de noches" / "Fecha de salida"
  - Si "Noches": Input numérico (min: 1)
  - Si "Fecha salida": DatePicker
- **Botón**: "Verificar Disponibilidad"
- **Resultado**:
  - ✅ **Disponible**: Mensaje verde + botón "Crear Reserva"
  - ❌ **No disponible**: Mensaje rojo + lista de reservas que bloquean
  - ⚠️ **Período cerrado**: Mensaje amarillo + detalles del período

### Lógica de Verificación
- Usar `checkAvailability()` de `lib/api/calendar.ts`
- Validar que fecha salida > fecha entrada
- Mostrar conflictos de forma clara

---

## PLAN DE IMPLEMENTACIÓN

### Fase 1: Tipo de Reserva (Base)
1. ✅ Script `035_add_booking_type_to_bookings.sql`
2. ✅ Script `036_create_booking_type_config.sql`
3. ✅ Actualizar `types/bookings.ts`
4. ✅ Actualizar `lib/api/bookings.ts` (cargar booking_type)
5. ✅ Actualizar `components/bookings/BookingForm.tsx`
   - Select de tipo de reserva
   - Lógica condicional para períodos cerrados
6. ✅ Actualizar `app/dashboard/bookings/[id]/page.tsx`
7. ✅ Migración: Asignar "commercial" a reservas existentes

### Fase 2: API de Calendario
1. ✅ Crear `lib/api/calendar.ts`
   - `getCalendarAvailability()`
   - `checkAvailability()`
2. ✅ Crear `lib/utils/calendar.ts`
   - `datesOverlap()`
   - `getDaysInRange()`
   - `isDateInRange()`

### Fase 3: Componentes de Calendario
1. ✅ Crear `components/calendar/MonthCalendar.tsx`
2. ✅ Crear `components/calendar/CalendarView.tsx`
3. ✅ Crear `app/dashboard/calendar/page.tsx`
4. ✅ Añadir enlace en sidebar

### Fase 4: Verificador de Disponibilidad
1. ✅ Crear `components/calendar/AvailabilityChecker.tsx`
2. ✅ Integrar en `app/dashboard/calendar/page.tsx`
3. ✅ Conectar con API

### Fase 5: Estilos y Pulido
1. ✅ Aplicar colores (verde/rojo/amarillo)
2. ✅ Tooltips y hover effects
3. ✅ Responsive design
4. ✅ Loading states
5. ✅ Manejo de errores

---

## DETALLES TÉCNICOS

### Validaciones para Períodos Cerrados
- `person_id`: NULL o no requerido
- `total_amount`: 0 (obligatorio)
- `paid_amount`: 0
- `channel_id`: NULL
- `number_of_guests`: 0 o NULL
- `sales_commission_amount`: 0
- `collection_commission_amount`: 0
- `tax_amount`: 0
- `net_amount`: 0

### Colores y Estilos
```css
/* Días libres */
.bg-green-100.dark:bg-green-900/30

/* Reservas comerciales */
.bg-red-100.dark:bg-red-900/30

/* Períodos cerrados */
.bg-yellow-100.dark:bg-yellow-900/30
```

### Detección de Solapamiento
```typescript
function datesOverlap(
  start1: Date, 
  end1: Date,
  start2: Date, 
  end2: Date
): boolean {
  // end1 y end2 son exclusivos (check-out no cuenta como ocupado)
  return start1 < end2 && start2 < end1
}
```

### Estructura de Datos CalendarDay
```typescript
interface CalendarDay {
  date: Date
  isAvailable: boolean
  booking: BookingWithDetails | null
  bookingType: 'commercial' | 'closed_period' | null
  isCheckIn: boolean  // Si es el día de entrada
  isCheckOut: boolean // Si es el día de salida
  guestName?: string  // Nombre del huésped (solo comercial)
}
```

---

## CONSIDERACIONES ESPECIALES

1. **Períodos Cerrados sin Huésped**: 
   - En el formulario, no mostrar selector de huésped
   - En la BD, `person_id` puede ser NULL o usar un "person" especial del sistema

2. **Calendario por Propiedad**:
   - El selector de propiedad es obligatorio
   - No mostrar calendario hasta que se seleccione una propiedad

3. **Rendimiento**:
   - Cargar solo los meses visibles
   - Cache de disponibilidad por propiedad
   - Lazy loading de detalles de reservas

4. **Responsive**:
   - Desktop: 2 meses lado a lado
   - Tablet: 2 meses apilados verticalmente
   - Móvil: 1 mes con navegación

---

## PREGUNTAS RESUELTAS

✅ Calendario por propiedad (selector obligatorio)
✅ Períodos cerrados sin huésped ni importes
✅ Verificación de disponibilidad integrada en calendario


# Migración a Google Weather API

## 📋 Resumen

Se ha migrado el widget de clima de **OpenWeatherMap** a la **API de Weather de Google Maps Platform** para obtener datos meteorológicos más precisos y hiperlocales.

## 🔄 Cambios Realizados

### 1. **Nueva API Key**
- **Variable de entorno:** `NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY`
- **Ubicación:** `.env.local`
- **Documentación:** [Google Weather API](https://developers.google.com/maps/documentation/weather/overview?hl=es-419)

### 2. **Archivos Modificados**

#### `types/weather.ts`
- ✅ Agregados tipos para `GoogleWeatherCurrentResponse`
- ✅ Agregados tipos para `GoogleWeatherForecastResponse`
- ✅ Mantenidos tipos de OpenWeatherMap para compatibilidad

#### `lib/api/weather.ts`
- ✅ Migrado completamente a Google Weather API
- ✅ Nuevas funciones de transformación de datos
- ✅ Mapeo de códigos de clima de Google a descripciones en español
- ✅ Integración con Google Geocoding API para nombres de ciudades

## 🌟 Ventajas de Google Weather API

### **Precisión Mejorada**
- Datos meteorológicos hiperlocales en tiempo real
- Mejor resolución espacial y temporal
- Información más detallada sobre condiciones climáticas

### **Datos Más Completos**
- **Condiciones actuales:** Temperatura, humedad, presión, viento, UV, visibilidad
- **Pronóstico diario:** Hasta 10 días de pronóstico
- **Pronóstico por hora:** Hasta 240 horas de condiciones previstas
- **Historial por hora:** Hasta 24 horas de condiciones pasadas

### **Características Específicas**
- Índice UV real (no disponible en OpenWeatherMap gratuito)
- Visibilidad atmosférica
- Cobertura de nubes
- Probabilidad de tormentas eléctricas
- Eventos del sol y la luna (amanecer, atardecer)

## 🔧 Configuración

### **Variables de Entorno Requeridas**
```bash
# .env.local
NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY=tu_api_key_aqui
```

### **Endpoints Utilizados**
1. **Condiciones Actuales:**
   ```
   https://weather.googleapis.com/v1/currentConditions?location={lat},{lon}&key={API_KEY}&units=METRIC&language=es
   ```

2. **Pronóstico Diario:**
   ```
   https://weather.googleapis.com/v1/dailyForecast?location={lat},{lon}&key={API_KEY}&units=METRIC&language=es&days=5
   ```

3. **Geocoding (para nombres de ciudades):**
   ```
   https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={API_KEY}&language=es
   ```

## 📊 Mapeo de Códigos de Clima

La API de Google utiliza códigos específicos que se mapean a descripciones en español:

| Código Google | Condición | Descripción |
|---------------|-----------|-------------|
| `CLEAR` | Despejado | Cielo despejado |
| `PARTLY_CLOUDY` | Parcialmente nublado | Parcialmente nublado |
| `CLOUDY` | Nublado | Nublado |
| `OVERCAST` | Muy nublado | Muy nublado |
| `FOG` | Niebla | Niebla |
| `LIGHT_RAIN` | Lluvia ligera | Lluvia ligera |
| `RAIN` | Lluvia | Lluvia |
| `HEAVY_RAIN` | Lluvia intensa | Lluvia intensa |
| `LIGHT_SNOW` | Nieve ligera | Nieve ligera |
| `SNOW` | Nieve | Nieve |
| `HEAVY_SNOW` | Nieve intensa | Nieve intensa |
| `THUNDERSTORM` | Tormenta | Tormenta eléctrica |
| `LIGHT_THUNDERSTORM` | Tormenta ligera | Tormenta eléctrica ligera |
| `HEAVY_THUNDERSTORM` | Tormenta intensa | Tormenta eléctrica intensa |

## 🚀 Funcionalidades Mejoradas

### **Widget de Clima Simplificado**
- Diseño más limpio y profesional
- Información esencial: temperatura, condición, humedad, viento
- Iconos de clima más precisos
- Mejor rendimiento y carga más rápida

### **Datos Más Precisos**
- Temperatura aparente (sensación térmica)
- Índice UV real
- Visibilidad atmosférica
- Dirección del viento en grados y texto
- Probabilidad de precipitación más precisa

## 🔍 Compatibilidad

### **Mantenida**
- ✅ Misma interfaz de componentes
- ✅ Mismos tipos de datos de salida
- ✅ Misma funcionalidad del widget
- ✅ Compatibilidad con coordenadas existentes

### **Mejorada**
- ✅ Mayor precisión en datos meteorológicos
- ✅ Información más detallada
- ✅ Mejor rendimiento de la API
- ✅ Soporte nativo en español

## 📝 Notas Técnicas

### **Manejo de Errores**
- Verificación de API key antes de hacer requests
- Manejo robusto de errores de red
- Fallbacks para datos faltantes
- Logging detallado para debugging

### **Optimizaciones**
- Requests paralelos para datos actuales y pronóstico
- Cache de nombres de ciudades
- Validación de coordenadas
- Formateo eficiente de fechas y horas

## 🎯 Próximos Pasos

1. **Configurar API Key** en `.env.local`
2. **Probar funcionalidad** en desarrollo
3. **Verificar datos** en producción
4. **Monitorear uso** de la API
5. **Optimizar** según necesidades específicas

---

**Referencias:**
- [Google Weather API Documentation](https://developers.google.com/maps/documentation/weather/overview?hl=es-419)
- [Google Maps Platform Pricing](https://developers.google.com/maps/billing-and-pricing)
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)

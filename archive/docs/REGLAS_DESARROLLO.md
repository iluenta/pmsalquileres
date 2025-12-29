# REGLAS IMPORTANTES DE DESARROLLO

## 🚨 REGLA CRÍTICA - NO HACER PUSH SIN AUTORIZACIÓN
**NUNCA hacer `git push origin master` sin autorización explícita del usuario.**

### Comportamiento Correcto:
- ✅ Hacer commits cuando sea necesario
- ✅ Informar al usuario sobre los cambios realizados
- ❌ **NUNCA hacer push automáticamente**
- ⏳ Esperar instrucción explícita del usuario para hacer push

### Proceso Correcto:
1. Realizar cambios necesarios
2. Hacer commit con mensaje descriptivo
3. Informar al usuario: "Cambios listos para push"
4. **ESPERAR** instrucción del usuario: "haz push" o "sube los cambios"
5. Solo entonces ejecutar `git push origin master`

### Excepción:
Solo hacer push automático si el usuario dice explícitamente:
- "haz push"
- "sube los cambios"
- "push a master"
- O similar instrucción directa

## Otras Reglas Importantes:
- No subir nada a producción sin haberlo probado previamente
- Siempre compilar localmente antes de hacer push
- Informar sobre errores encontrados antes de continuar
- Preguntar antes de hacer cambios importantes

---
**Fecha de creación:** 2025-01-28
**Motivo:** Usuario reportó push no autorizado a master


# 🔍 DIAGNÓSTICO: Modelo gemini-2.5-flash-lite

## 📊 Situación Actual

**Modelo configurado**: `gemini-2.5-flash-lite`  
**Problema**: Lysandra no responde en el simulador de WhatsApp  
**Síntoma**: Respuesta vacía (`reply: ""`)

## 🧪 Pruebas Realizadas

### Prueba 1: Webhook con mensaje simple
```bash
npx tsx src/scripts/test-webhook-debug.ts
```

**Resultado**:
```json
{
  "success": true,
  "reply": "",  ← VACÍO
  "phoneNumber": "5215512345678"
}
```

## 🤔 Posibles Causas

### 1. Modelo No Soporta Function Calling
El modelo `gemini-2.5-flash-lite` es experimental y podría no soportar function calling (herramientas) correctamente.

**Modelos que SÍ soportan function calling**:
- ✅ `gemini-2.0-flash`
- ✅ `gemini-1.5-flash` (gemini-flash-latest)
- ✅ `gemini-1.5-pro` (gemini-pro-latest)

### 2. Respuesta Vacía por Configuración
El modelo podría estar devolviendo una respuesta vacía debido a:
- Prompt incompatible
- Límites de tokens
- Error en la API

### 3. Problema con Tools
Si el modelo llama a `getCurrentDateTime` pero no puede procesar la respuesta, el texto final podría quedar vacío.

## 🔧 SOLUCIÓN RECOMENDADA

### Opción A: Cambiar a Modelo Estable (RECOMENDADO)

Cambia a **`gemini-flash-latest`** que es:
- ✅ Estable y probado
- ✅ Soporta function calling
- ✅ Buenas cuotas gratuitas
- ✅ Balance perfecto velocidad/capacidad

```bash
# Ejecutar este script para cambiar el modelo
npx tsx src/scripts/fix-ai-model-stable.ts
```

### Opción B: Probar sin Function Calling

Temporalmente deshabilitar las herramientas para ver si el modelo responde:
1. Comentar las tools en el webhook
2. Hacer que Lysandra responda directamente
3. Ver si el problema es con function calling

### Opción C: Agregar API Key Configurable

Permitir configurar la API Key desde el dashboard para:
- Usar diferentes cuentas de Gemini
- Cambiar entre APIs (Gemini/OpenAI)
- Tener más control sobre las cuotas

## 📝 Plan de Acción

### Paso 1: Cambiar a Modelo Estable
```bash
npx tsx src/scripts/fix-ai-model-stable.ts
```

Este script cambiará el modelo a `gemini-flash-latest`.

### Paso 2: Probar de Nuevo
```bash
npx tsx src/scripts/test-webhook-debug.ts
```

Deberías ver una respuesta con texto.

### Paso 3: Probar en el Simulador
1. Abre: http://localhost:3000/dashboard/whatsapp-simulator
2. Envía: "Hola"
3. Lysandra debería responder

### Paso 4: Agregar Configuración de API Key (Futuro)

Crear una sección en Settings > IA para:
- Configurar Gemini API Key
- Configurar OpenAI API Key (futuro)
- Seleccionar proveedor de IA

## 🎯 Por Qué gemini-flash-latest es Mejor

| Característica | gemini-2.5-flash-lite | gemini-flash-latest |
|----------------|----------------------|---------------------|
| **Estabilidad** | ⚠️ Experimental | ✅ Estable |
| **Function Calling** | ❓ Limitado | ✅ Completo |
| **Cuota Gratuita** | ✅ 1000 req/día | ✅ 15 req/min |
| **Velocidad** | ✅ Muy rápido | ✅ Rápido |
| **Documentación** | ⚠️ Limitada | ✅ Completa |
| **Producción** | ❌ No recomendado | ✅ Recomendado |

## 💡 Recomendación Final

**Usa `gemini-flash-latest`** para:
- ✅ Desarrollo estable
- ✅ Function calling confiable
- ✅ Mejor documentación
- ✅ Listo para producción

**Guarda `gemini-2.5-flash-lite`** para:
- 🧪 Experimentación
- 📊 Pruebas de rendimiento
- 🔬 Cuando no necesites tools

---

## 🚀 Ejecutar Ahora

```bash
# 1. Cambiar a modelo estable
npx tsx src/scripts/fix-ai-model-stable.ts

# 2. Esperar 30 segundos (para reset de cuota)

# 3. Probar
npx tsx src/scripts/test-webhook-debug.ts

# 4. Si funciona, probar en el simulador
# http://localhost:3000/dashboard/whatsapp-simulator
```

---

**Próximo paso**: Agregar configuración de API Keys en el dashboard (sin cambiar la actual).

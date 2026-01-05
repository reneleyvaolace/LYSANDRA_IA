# 🐛 DEBUG: Problema con Respuesta Vacía

## 📊 Estado Actual

### Síntomas
- ✅ Webhook responde 200 OK
- ✅ Estructura JSON correcta
- ❌ Campo `reply` está vacío (`""`)
- ❌ Simulador muestra error porque no hay respuesta

### Prueba Realizada
```bash
npx tsx src/scripts/test-webhook-debug.ts
```

**Resultado**:
```json
{
  "success": true,
  "reply": "",
  "phoneNumber": "5215512345678"
}
```

## 🔍 Posibles Causas

### 1. Problema con Gemini Response
- Gemini podría estar devolviendo una respuesta vacía
- El modelo podría estar esperando más contexto
- Podría haber un error al extraer el texto de la respuesta

### 2. Problema con Tool Calls
- Si Gemini llama a `getCurrentDateTime`, el flujo es:
  1. Usuario: "¿Qué día es hoy?"
  2. Gemini: llama a `getCurrentDateTime`
  3. Sistema: ejecuta la herramienta
  4. Gemini: debería responder con la fecha
  5. **Problema**: La respuesta final podría estar vacía

### 3. Problema con el Logging
- Los logs deberían mostrar:
  - `📱 WhatsApp Message: ...`
  - `🤖 Gemini Response Parts: ...`
  - `🔧 Found X function call(s)`
  - `✅ Tool result: ...`
  - `🤖 Gemini response after tool: ...`

## 🔧 Solución

### Paso 1: Verificar Logs del Servidor

Revisa la terminal donde corre `npm run dev`. Deberías ver algo como:

```
📱 WhatsApp Message: { phoneNumber: '5215512345678', body: '¿Qué día es hoy?', isSimulator: true }
🤖 Gemini Response Parts: [...]
🔧 Found 1 function call(s)
🔧 Calling getCurrentDateTime with args: {}
✅ Tool result: { currentDateTime: '2026-01-05 14:45:00', ... }
🤖 Gemini response after tool: "Hoy es domingo, 05/01/2026..."
```

Si NO ves estos logs, el problema está en el código del webhook.

### Paso 2: Verificar que el Modelo esté Configurado

El usuario mencionó que "cambió de modelo de Gemini". Verifica:

1. ¿Qué modelo está usando?
2. ¿El modelo soporta function calling?
3. ¿La API key es válida?

**Modelos válidos con function calling**:
- `gemini-2.0-flash` ✅
- `gemini-1.5-flash` ✅
- `gemini-1.5-pro` ✅
- `gemini-flash-latest` ✅ (alias)
- `gemini-pro-latest` ✅ (alias)

### Paso 3: Verificar Configuración en Firestore

```bash
npx tsx src/scripts/check-agent-config.ts
```

Busca el campo `aiModel` en la configuración. Debería ser uno de los modelos válidos.

### Paso 4: Agregar Más Logging

Ya agregamos logging detallado al webhook. Si los logs no aparecen, significa que:
- El servidor no está recibiendo la petición, O
- Hay un error antes de llegar al logging, O
- Los logs están siendo suprimidos

## 🎯 Próximos Pasos

### Opción A: Revisar Logs Manualmente
1. Abre la terminal donde corre `npm run dev`
2. Ejecuta de nuevo: `npx tsx src/scripts/test-webhook-debug.ts`
3. Copia TODOS los logs que aparezcan
4. Busca especialmente:
   - Errores (❌)
   - Respuestas de Gemini (🤖)
   - Llamadas a herramientas (🔧)

### Opción B: Probar con Mensaje Simple
Prueba con un mensaje que NO requiera herramientas:

```bash
# Crear script de prueba simple
```

```typescript
const testMessage = {
  // ... mismo formato
  messages: [{
    text: {
      body: 'Hola'  // Mensaje simple sin herramientas
    }
  }]
};
```

Si "Hola" funciona pero "¿Qué día es hoy?" no, el problema está en el manejo de tool calls.

### Opción C: Verificar el Modelo en settings

```bash
# Ver qué modelo está configurado
firebase firestore:get settings/main
```

O manualmente en Firebase Console:
1. Firestore Database
2. Colección `settings`
3. Documento `main`
4. Campo `aiModel`

## 📝 Checklist de Debug

- [ ] Revisar logs del servidor (npm run dev)
- [ ] Verificar modelo configurado en Firestore
- [ ] Probar con mensaje simple ("Hola")
- [ ] Verificar que Gemini API key sea válida
- [ ] Verificar que el modelo soporte function calling
- [ ] Revisar si hay errores en la consola del navegador
- [ ] Verificar que Firebase esté conectado

## 🔥 Fix Rápido

Si el problema persiste, prueba esto:

1. **Cambiar temporalmente a respuesta directa** (sin tools):
   - Comentar las tools en el webhook
   - Hacer que Lysandra responda directamente
   - Ver si el problema es con function calling

2. **Usar modelo diferente**:
   - Cambiar a `gemini-2.0-flash` explícitamente
   - Ver si el problema persiste

3. **Simplificar el prompt**:
   - Usar un prompt más simple
   - Ver si el problema es con las instrucciones

---

**Siguiente acción**: Revisar los logs del servidor para ver exactamente qué está pasando.

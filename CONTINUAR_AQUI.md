# 🚀 GUÍA RÁPIDA: Continuar con WhatsApp

## ⚡ Resumen del Problema

**Estado actual**: El webhook está funcionando correctamente, pero la API de Gemini ha excedido su cuota de solicitudes por minuto.

**Error**: `Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_requests_per_minute`

## ✅ Lo que YA funciona

1. ✅ Webhook recibe mensajes correctamente
2. ✅ Formato JSON y FormData soportados
3. ✅ Detección de simulador vs. WhatsApp real
4. ✅ Guardado en Firestore
5. ✅ Herramienta `getCurrentDateTime` implementada
6. ✅ Sistema de configuración regional

## ⏳ Próximo Paso: Esperar y Probar

### Opción 1: Esperar 2-3 minutos

La cuota de Gemini se resetea automáticamente. Simplemente espera un poco y prueba de nuevo.

```bash
# Después de esperar 2-3 minutos:
npx tsx src/scripts/test-whatsapp-simple.ts
```

### Opción 2: Verificar tu Cuota en Google AI Studio

1. Ve a: https://aistudio.google.com/
2. Inicia sesión con tu cuenta de Google
3. Ve a "API Keys" o "Quotas"
4. Verifica los límites de tu plan actual

### Opción 3: Probar el Webhook sin IA (Solo Estructura)

Puedes verificar que el webhook recibe mensajes correctamente sin llamar a Gemini:

```bash
# Esto solo verifica la estructura del webhook
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "5215512345678",
            "text": {"body": "test"},
            "type": "text"
          }]
        }
      }]
    }]
  }'
```

## 🎯 Cuando la Cuota se Resetee

### Prueba 1: Mensaje Simple (2 minutos)
```bash
npx tsx src/scripts/test-whatsapp-simple.ts
```

**Resultado esperado**:
```
✅ Webhook funcionando correctamente
💡 Revisa los logs del servidor para ver:
   - 📱 WhatsApp Message recibido
   - 🔧 getCurrentDateTime llamado
   - 🤖 Respuesta de Lysandra
```

### Prueba 2: Verificar Firestore (1 minuto)

1. Abre Firebase Console: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Ve a Firestore Database
4. Busca la colección `conversations`
5. Verifica que hay un documento con el número de teléfono
6. Dentro, verifica la subcolección `history`

### Prueba 3: Agendamiento Completo (5 minutos)
```bash
npx tsx src/scripts/test-whatsapp-webhook.ts
```

**Resultado esperado**:
- Lysandra pregunta detalles de la cita
- Calcula correctamente "próximo lunes" = 13 de enero de 2026
- Guarda la cita en Firestore

## 🚀 Despliegue a Producción

Una vez que las pruebas locales funcionen:

### Paso 1: Desplegar a Vercel
```bash
vercel login
vercel --prod
```

### Paso 2: Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, añade:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GEMINI_API_KEY`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_TOKEN` (de Meta)
- `WHATSAPP_PHONE_NUMBER_ID` (de Meta)

### Paso 3: Configurar Webhook en Meta

1. Ve a https://developers.facebook.com/
2. Selecciona tu app de WhatsApp
3. Ve a WhatsApp > Configuration
4. Añade webhook:
   - **URL**: `https://tu-app.vercel.app/api/webhook`
   - **Verify Token**: El mismo de tu `.env.local`
5. Suscríbete al campo "messages"

### Paso 4: Probar con WhatsApp Real

Envía un mensaje desde tu teléfono al número de WhatsApp Business:
- "Hola"
- "¿Qué día es hoy?"
- "Quiero una cita para mañana"

## 📊 Monitoreo

### Ver Logs en Tiempo Real

**Vercel**:
```bash
vercel logs --follow
```

**Local**:
Simplemente observa la terminal donde corre `npm run dev`

### Buscar en los Logs

- `📱 WhatsApp Message:` - Mensaje recibido
- `🔧 Calling getCurrentDateTime...` - Herramienta llamada
- `✅ Function call result:` - Resultado de herramienta
- `📅 Booking appointment:` - Cita agendada
- `❌` - Errores

## 🐛 Solución de Problemas

### Error: "Quota exceeded"
- **Solución**: Esperar 1-2 minutos
- **Prevención**: No hacer muchas pruebas seguidas

### Error: "Invalid WhatsApp format"
- **Solución**: Verificar formato del JSON
- **Verificar**: Que tenga `entry[0].changes[0].value.messages[0]`

### Error: "Missing body or phone number"
- **Solución**: Verificar que el mensaje tenga `text.body` y `from`

### Webhook no recibe mensajes
- **Verificar**: URL HTTPS
- **Verificar**: Verify token correcto
- **Verificar**: Campo "messages" suscrito en Meta

### Lysandra no responde
- **Verificar**: `WHATSAPP_TOKEN` en variables de entorno
- **Verificar**: `GEMINI_API_KEY` válida
- **Verificar**: Logs del servidor

## 📞 Comandos de Emergencia

```bash
# Reiniciar servidor
# Ctrl+C en la terminal de npm run dev
npm run dev

# Verificar configuración de Firebase
npx tsx src/scripts/check-agent-config.ts

# Probar herramienta de fecha
npx tsx src/scripts/test-datetime-tool.ts

# Ver estado de Firestore
# Abrir: https://console.firebase.google.com/
```

## ✨ Tips

1. **Espera entre pruebas**: No hagas más de 2-3 pruebas por minuto
2. **Revisa logs siempre**: Te dirán exactamente qué está pasando
3. **Firestore es tu amigo**: Verifica que los datos se guarden correctamente
4. **Usa el simulador primero**: Antes de probar con WhatsApp real
5. **Documenta errores**: Copia los logs para debugging

## 🎯 Objetivo Final

Que Lysandra pueda:
- ✅ Recibir mensajes de WhatsApp
- ✅ Responder con la fecha actual correcta
- ✅ Agendar citas calculando fechas relativas ("mañana", "próximo lunes")
- ✅ Guardar todo en Firestore
- ✅ Funcionar 24/7 en producción

---

**¿Listo para continuar?**

1. ⏳ Espera 2-3 minutos
2. 🧪 Ejecuta: `npx tsx src/scripts/test-whatsapp-simple.ts`
3. 👀 Revisa los logs
4. ✅ Si funciona, continúa con las pruebas completas
5. 🚀 Despliega a producción

**Última actualización**: 5 de enero de 2026, 14:35 CST

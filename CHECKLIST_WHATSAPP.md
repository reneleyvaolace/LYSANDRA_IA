# ✅ CHECKLIST: Preparación para WhatsApp

## 📋 Pre-Despliegue

### 1. Configuración Local
- [x] Servidor de desarrollo corriendo (`npm run dev`)
- [x] Variables de entorno en `.env.local` configuradas
- [x] Firebase conectado y funcionando
- [x] Gemini API Key válida

### 2. Pruebas Locales
- [x] Laboratorio IA funciona correctamente
- [x] `getCurrentDateTime` retorna fecha actual
- [x] Configuración regional guardada en Firestore
- [x] Agendamiento de citas funciona en el Laboratorio

### 3. Verificación de Firestore
```bash
# Ejecutar estos scripts para verificar:
npx tsx src/scripts/check-agent-config.ts
npx tsx src/scripts/test-datetime-tool.ts
```

Resultados esperados:
- [x] Zona horaria configurada
- [x] Formato de fecha configurado
- [x] Formato de hora configurado
- [x] Fecha actual correcta

### 4. Estado Actual (5 de enero, 14:35)
- [x] Webhook implementado y funcionando
- [x] Estructura de mensajes validada
- [x] Guardado en Firestore funcionando
- ⚠️ **Cuota de Gemini API excedida** (se resetea automáticamente en 1-2 minutos)
- 📝 Ver `CONTINUAR_AQUI.md` para próximos pasos

## 🚀 Despliegue

### Opción A: Vercel (Producción)
```bash
# 1. Login
vercel login

# 2. Deploy
vercel --prod

# 3. Copiar URL de producción
# Ejemplo: https://lysandra-ia.vercel.app
```

- [ ] Proyecto desplegado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] URL de producción obtenida

### Opción B: Ngrok (Pruebas)
```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Ngrok
ngrok http 3000
```

- [ ] Ngrok corriendo
- [ ] URL HTTPS obtenida (ej: https://abc123.ngrok.io)

## 🔧 Configuración de Meta

### 1. Meta for Developers
- [ ] App de WhatsApp creada
- [ ] WhatsApp Business API configurada
- [ ] Número de teléfono añadido

### 2. Webhook Configuration
**URL**: `https://tu-dominio.com/api/webhook`
**Verify Token**: (el mismo de tu `.env.local`)

- [ ] Callback URL configurada
- [ ] Verify Token configurado
- [ ] Webhook verificado (✅ en Meta Console)
- [ ] Campo "messages" seleccionado

### 3. Tokens y Permisos
- [ ] `WHATSAPP_TOKEN` copiado de Meta
- [ ] `WHATSAPP_PHONE_NUMBER_ID` copiado de Meta
- [ ] Permisos de mensajería otorgados

## 🧪 Pruebas

### Prueba 1: Webhook Verification (GET)
Meta enviará automáticamente una petición GET para verificar.
- [ ] Verificación exitosa (✅ en Meta Console)

### Prueba 2: Mensaje de Prueba (Local)
```bash
# Si usas Ngrok o tienes el servidor local
npx tsx src/scripts/test-whatsapp-webhook.ts
```
- [ ] Webhook responde 200 OK
- [ ] Logs muestran el mensaje recibido

### Prueba 3: WhatsApp Real
Envía desde tu teléfono al número de WhatsApp Business:

**Mensaje 1**: "Hola"
- [ ] Lysandra responde con saludo

**Mensaje 2**: "¿Qué día es hoy?"
- [ ] Lysandra responde con fecha actual correcta (5 de enero de 2026)

**Mensaje 3**: "Quiero una cita para el próximo lunes"
- [ ] Lysandra calcula correctamente (13 de enero de 2026)
- [ ] Lysandra pregunta la hora
- [ ] Lysandra confirma la cita

### Prueba 4: Verificar en Firestore
- [ ] Colección `conversations` tiene mensajes
- [ ] Colección `appointments` tiene la cita agendada
- [ ] Datos correctos (fecha, hora, nombre, tipo)

## 📊 Monitoreo

### Logs en Tiempo Real
```bash
# Si usas Vercel
vercel logs --follow

# Si usas servidor local
# Ver la terminal donde corre npm run dev
```

Busca estos mensajes:
- [ ] `📱 WhatsApp Message: ...`
- [ ] `🔧 Calling getCurrentDateTime...`
- [ ] `✅ Function call result: ...`
- [ ] `📅 Booking appointment: ...`

### Firestore Console
- [ ] Abre Firebase Console
- [ ] Ve a Firestore Database
- [ ] Verifica colecciones: `conversations`, `appointments`, `settings`

## 🐛 Troubleshooting

### Si el webhook no recibe mensajes:
1. [ ] Verifica que la URL sea HTTPS
2. [ ] Verifica el verify token
3. [ ] Revisa logs de Meta Developer Console
4. [ ] Prueba con cURL manualmente

### Si Lysandra no responde:
1. [ ] Verifica `WHATSAPP_TOKEN` en variables de entorno
2. [ ] Verifica `GEMINI_API_KEY` en variables de entorno
3. [ ] Revisa logs del servidor
4. [ ] Verifica que Firestore tenga permisos

### Si la fecha es incorrecta:
1. [ ] Ejecuta `npx tsx src/scripts/check-agent-config.ts`
2. [ ] Verifica configuración regional en Settings
3. [ ] Verifica que `getCurrentDateTime` esté en tools
4. [ ] Revisa logs para ver si se llama la herramienta

## ✅ Checklist Final

Antes de considerar el sistema en producción:
- [ ] Todas las pruebas pasadas
- [ ] Webhook verificado y funcionando
- [ ] Mensajes de WhatsApp recibidos y respondidos
- [ ] Fechas correctas en agendamiento
- [ ] Citas guardadas en Firestore
- [ ] Logs monitoreados sin errores
- [ ] Backup de Firestore configurado
- [ ] Documentación actualizada

## 🎉 ¡Listo!

Si todos los checkboxes están marcados, tu sistema está listo para producción.

**Próximos pasos**:
1. Monitorear las primeras conversaciones reales
2. Ajustar prompts según feedback
3. Añadir más herramientas si es necesario
4. Configurar alertas para errores

---

**Fecha**: 5 de enero de 2026
**Versión**: 1.0.0

# 📱 GUÍA: Integración y Pruebas con WhatsApp

## 🎯 Objetivo
Probar que Lysandra use correctamente la fecha/hora actual al agendar citas por WhatsApp.

## ✅ Pre-requisitos

### 1. Verificar Configuración de WhatsApp Business
Necesitas tener configurado:
- Meta Business Account
- WhatsApp Business API
- Webhook URL configurada en Meta Developer Console

### 2. Verificar Variables de Entorno
En tu archivo `.env.local`, asegúrate de tener:

```env
# WhatsApp Business API
WHATSAPP_TOKEN=tu_token_aqui
WHATSAPP_VERIFY_TOKEN=tu_verify_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui

# Firebase
FIREBASE_PROJECT_ID=lysandra-ai-d24d2
FIREBASE_CLIENT_EMAIL=tu_client_email_aqui
FIREBASE_PRIVATE_KEY="tu_private_key_aqui"

# Gemini
GEMINI_API_KEY=tu_gemini_api_key_aqui
```

## 🚀 Paso 1: Desplegar a Producción

### Opción A: Vercel (Recomendado)

1. **Conectar con Vercel**:
```bash
# Si no tienes Vercel CLI instalado
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

2. **Configurar Variables de Entorno en Vercel**:
   - Ve a tu proyecto en Vercel Dashboard
   - Settings > Environment Variables
   - Añade todas las variables de `.env.local`

3. **Obtener URL de Producción**:
   - Ejemplo: `https://lysandra-ia.vercel.app`

### Opción B: Ngrok (Para Pruebas Locales)

1. **Instalar Ngrok**:
```bash
# Descargar de https://ngrok.com/download
# O con chocolatey:
choco install ngrok
```

2. **Iniciar el servidor local**:
```bash
npm run dev
```

3. **Exponer con Ngrok** (en otra terminal):
```bash
ngrok http 3000
```

4. **Copiar la URL HTTPS**:
   - Ejemplo: `https://abc123.ngrok.io`

## 🔧 Paso 2: Configurar Webhook en Meta

1. **Ir a Meta for Developers**:
   - https://developers.facebook.com/apps/

2. **Seleccionar tu App > WhatsApp > Configuration**

3. **Configurar Webhook**:
   - **Callback URL**: `https://tu-dominio.com/api/webhook`
   - **Verify Token**: El mismo que pusiste en `WHATSAPP_VERIFY_TOKEN`
   - **Webhook Fields**: Marca `messages`

4. **Guardar y Verificar**:
   - Meta enviará una petición GET para verificar
   - Deberías ver un ✅ si todo está correcto

## 📊 Paso 3: Verificar que el Webhook Funciona

### Prueba Rápida con cURL:

```bash
# Simular mensaje de WhatsApp
curl -X POST https://tu-dominio.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "1234567890",
            "text": {
              "body": "Hola"
            }
          }]
        }
      }]
    }]
  }'
```

**Respuesta esperada**: `200 OK`

## 🧪 Paso 4: Pruebas con WhatsApp Real

### Prueba 1: Saludo Básico
**Usuario**: "Hola"
**Lysandra**: Debe responder con su nombre y presentación

### Prueba 2: Consultar Fecha Actual
**Usuario**: "¿Qué día es hoy?"
**Lysandra**: 
- Debe llamar a `getCurrentDateTime`
- Responder con la fecha actual correcta (5 de enero de 2026)

### Prueba 3: Agendar Cita con Fecha Relativa
**Usuario**: "Quiero una cita para el próximo lunes"
**Lysandra**:
- Debe llamar a `getCurrentDateTime` → obtiene "2026-01-05"
- Debe calcular: próximo lunes = 13 de enero de 2026
- Debe preguntar la hora preferida
- Debe confirmar la cita con la fecha correcta

### Prueba 4: Agendar Cita Completa
**Usuario**: "Quiero una cita de consultoría para el lunes 13 de enero a las 3 PM"
**Lysandra**:
- Debe llamar a `checkAvailability`
- Debe llamar a `bookSlot` con los datos correctos
- Debe confirmar la cita con ID

## 📝 Paso 5: Monitorear Logs

### Ver logs en tiempo real (si usas Vercel):
```bash
vercel logs --follow
```

### Ver logs en Firestore:
1. Ve a Firebase Console
2. Firestore Database
3. Colección `conversations`
4. Busca por el número de teléfono del usuario

### Ver logs en el código:
Los logs importantes están en `src/app/api/webhook/route.ts`:
```typescript
console.log("📱 WhatsApp Message:", body);
console.log("🔧 Calling getCurrentDateTime...");
console.log("✅ Function call result:", result);
```

## 🐛 Troubleshooting

### Problema 1: Webhook no recibe mensajes
**Solución**:
- Verifica que la URL del webhook sea HTTPS
- Verifica que el verify token sea correcto
- Revisa los logs de Meta Developer Console

### Problema 2: Lysandra no responde
**Solución**:
- Verifica que `WHATSAPP_TOKEN` sea válido
- Verifica que `GEMINI_API_KEY` sea válido
- Revisa los logs del servidor

### Problema 3: Fecha incorrecta
**Solución**:
- Verifica que la configuración regional esté correcta en Firestore
- Ejecuta: `npx tsx src/scripts/check-agent-config.ts`
- Verifica que `getCurrentDateTime` esté en la lista de tools

### Problema 4: No se agenda la cita
**Solución**:
- Verifica que Firestore tenga permisos de escritura
- Revisa la colección `appointments` en Firestore
- Verifica que `bookSlot` esté funcionando

## 🎯 Casos de Prueba Completos

### Caso 1: Flujo Completo de Agendamiento
```
Usuario: "Hola"
Lysandra: "¡Hola! Soy Lysandra..."

Usuario: "Quiero agendar una cita"
Lysandra: "Claro, ¿para qué fecha te gustaría?"

Usuario: "El próximo miércoles"
Lysandra: [Llama getCurrentDateTime] "Perfecto, el próximo miércoles es el 8 de enero. ¿A qué hora?"

Usuario: "A las 2 PM"
Lysandra: [Llama checkAvailability] "Excelente, tengo disponibilidad. ¿Qué tipo de servicio necesitas?"

Usuario: "Consultoría"
Lysandra: [Llama bookSlot] "¡Listo! Tu cita de Consultoría está agendada para el miércoles 8 de enero a las 2:00 PM. ID: xxx"
```

### Caso 2: Consulta de Información
```
Usuario: "¿Cuánto cuesta una consultoría?"
Lysandra: [Llama searchKnowledgeBase] "Nuestros servicios de consultoría..."

Usuario: "¿Cuál es su RFC?"
Lysandra: [Llama searchKnowledgeBase] "Nuestro RFC es COR230101XYZ..."
```

### Caso 3: Escalamiento a Humano
```
Usuario: "Necesito hablar con un humano"
Lysandra: [Llama escalateToHuman] "Entiendo, te estoy conectando con un agente humano..."
```

## 📊 Métricas a Monitorear

1. **Tasa de Respuesta**: % de mensajes respondidos
2. **Tiempo de Respuesta**: Tiempo promedio de respuesta
3. **Citas Agendadas**: Número de citas agendadas exitosamente
4. **Errores**: Número de errores en el webhook
5. **Uso de Tools**: Frecuencia de uso de cada herramienta

## 🔐 Seguridad

1. **Validar Webhook**: El código ya valida el verify token
2. **Rate Limiting**: Considera añadir rate limiting
3. **Sanitización**: Los inputs ya están sanitizados
4. **Logs**: No logues información sensible (tokens, números completos)

## 📱 Números de Prueba

Meta proporciona números de prueba para desarrollo:
- Ve a WhatsApp > API Setup
- Añade números de teléfono de prueba
- Usa esos números para probar sin afectar usuarios reales

## ✅ Checklist Final

Antes de ir a producción:
- [ ] Webhook verificado en Meta
- [ ] Variables de entorno configuradas
- [ ] Pruebas básicas completadas
- [ ] Pruebas de agendamiento completadas
- [ ] Logs monitoreados
- [ ] Configuración regional verificada
- [ ] Backup de Firestore configurado
- [ ] Rate limiting implementado (opcional)
- [ ] Documentación actualizada

## 🚀 ¡Listo para Producción!

Una vez completados todos los pasos, tu sistema estará listo para:
- ✅ Recibir mensajes de WhatsApp
- ✅ Responder con la fecha/hora correcta
- ✅ Agendar citas con fechas precisas
- ✅ Consultar la base de conocimiento
- ✅ Escalar a humanos cuando sea necesario

---

**Documentado por**: Antigravity AI
**Fecha**: 5 de enero de 2026
**Versión**: 1.0.0

# 🔍 CHECKLIST: Integración WhatsApp - Paso a Paso

## 📋 Paso 1: Verificar Variables de Entorno

Abre tu archivo `.env.local` y verifica que tengas estas variables:

```env
# Firebase (YA CONFIGURADO ✅)
FIREBASE_PROJECT_ID=lysandra-ai-d24d2
FIREBASE_CLIENT_EMAIL=tu_client_email_aqui
FIREBASE_PRIVATE_KEY="tu_private_key_aqui"

# Gemini (YA CONFIGURADO ✅)
GEMINI_API_KEY=tu_gemini_api_key_aqui

# WhatsApp Business API (PENDIENTE ⚠️)
WHATSAPP_TOKEN=tu_whatsapp_token_aqui
WHATSAPP_VERIFY_TOKEN=tu_verify_token_personalizado
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
```

### ¿Qué necesitas obtener?

1. **WHATSAPP_TOKEN**: Token de acceso de Meta
2. **WHATSAPP_VERIFY_TOKEN**: Un token que TÚ inventas (ej: "lysandra_2026")
3. **WHATSAPP_PHONE_NUMBER_ID**: ID del número de WhatsApp Business

---

## 🚀 Paso 2: Crear Cuenta en Meta for Developers

### 2.1 Ir a Meta for Developers
1. Ve a: https://developers.facebook.com/
2. Inicia sesión con tu cuenta de Facebook
3. Haz clic en "My Apps" > "Create App"

### 2.2 Crear App
1. **Tipo de App**: Business
2. **Nombre**: Lysandra WhatsApp Bot
3. **Email de contacto**: Tu email
4. **Cuenta de negocio**: Selecciona o crea una

### 2.3 Añadir WhatsApp Product
1. En el dashboard de tu app, busca "WhatsApp"
2. Haz clic en "Set Up"
3. Sigue el wizard de configuración

---

## 📞 Paso 3: Configurar Número de WhatsApp

### 3.1 Número de Prueba (Gratis)
Meta te da un número de prueba GRATIS para desarrollo:
- **Límite**: 5 números de destino
- **Costo**: $0
- **Duración**: Ilimitada

### 3.2 Añadir Números de Prueba
1. En WhatsApp > API Setup
2. Sección "To"
3. Añade tu número personal de WhatsApp
4. Verifica el código que recibes por WhatsApp

### 3.3 Obtener Tokens
En la misma página (API Setup):

**Phone Number ID**:
- Copia el número que aparece bajo "Phone number ID"
- Pégalo en `.env.local` como `WHATSAPP_PHONE_NUMBER_ID`

**Access Token**:
- Copia el "Temporary access token"
- Pégalo en `.env.local` como `WHATSAPP_TOKEN`
- ⚠️ Este token expira en 24 horas (después necesitarás uno permanente)

---

## 🔗 Paso 4: Configurar Webhook

### 4.1 Opciones para Exponer tu Servidor Local

#### Opción A: Ngrok (Recomendado para pruebas)

**Instalar Ngrok**:
```bash
# Con Chocolatey
choco install ngrok

# O descarga de https://ngrok.com/download
```

**Ejecutar Ngrok**:
```bash
# En una terminal separada
ngrok http 3001
```

**Copiar URL**:
- Ngrok te dará una URL como: `https://abc123.ngrok.io`
- Esta es tu URL pública temporal

#### Opción B: Vercel (Para producción)

```bash
# Deploy a Vercel
vercel --prod

# Copiar URL de producción
# Ejemplo: https://lysandra-ia.vercel.app
```

### 4.2 Configurar Webhook en Meta

1. **Ir a**: WhatsApp > Configuration
2. **Webhook > Edit**:
   - **Callback URL**: `https://tu-url/api/webhook`
     - Con Ngrok: `https://abc123.ngrok.io/api/webhook`
     - Con Vercel: `https://lysandra-ia.vercel.app/api/webhook`
   
   - **Verify Token**: El mismo que pusiste en `.env.local` como `WHATSAPP_VERIFY_TOKEN`
     - Ejemplo: `lysandra_2026`
   
3. **Verify and Save**
   - Meta enviará una petición GET a tu webhook
   - Si todo está bien, verás un ✅

4. **Subscribe to Webhook Fields**:
   - Marca: `messages`
   - Guarda

---

## 🧪 Paso 5: Probar la Integración

### 5.1 Verificar que el Webhook Funciona

**Desde tu teléfono**:
1. Abre WhatsApp
2. Envía un mensaje al número de WhatsApp Business de Meta
3. Escribe: "Hola"

**En la terminal del servidor**:
Deberías ver:
```
📱 WhatsApp Message: { phoneNumber: '+1234567890', body: 'Hola', isSimulator: false }
```

**En WhatsApp**:
Deberías recibir la respuesta de Lysandra

### 5.2 Probar Casos Específicos

**Prueba 1: Fecha Actual**
```
Tú: ¿Qué día es hoy?
Lysandra: Hoy es lunes 5 de enero de 2026
```

**Prueba 2: Agendar Cita**
```
Tú: Quiero una cita para el próximo lunes
Lysandra: El próximo lunes es el 13 de enero de 2026. ¿A qué hora te gustaría?
```

**Prueba 3: Información**
```
Tú: ¿Cuánto cuesta una consultoría?
Lysandra: [Respuesta de la base de conocimiento]
```

---

## 📊 Paso 6: Monitorear

### 6.1 Logs del Servidor
```bash
# Si usas Vercel
vercel logs --follow

# Si usas local/Ngrok
# Ver la terminal donde corre npm run dev
```

### 6.2 Firestore
1. Firebase Console > Firestore
2. Colección `conversations`
3. Busca por el número de teléfono
4. Verifica que los mensajes se guarden

### 6.3 Meta Developer Console
1. WhatsApp > Webhooks
2. Ver eventos recibidos
3. Ver errores si los hay

---

## ⚠️ Problemas Comunes

### Problema 1: Webhook no verifica
**Solución**:
- Verifica que `WHATSAPP_VERIFY_TOKEN` en `.env.local` coincida exactamente con el de Meta
- Verifica que la URL del webhook sea HTTPS
- Verifica que el servidor esté corriendo

### Problema 2: No recibo mensajes
**Solución**:
- Verifica que hayas suscrito el campo "messages" en el webhook
- Verifica que el número esté en la lista de números de prueba
- Revisa los logs de Meta Developer Console

### Problema 3: Lysandra no responde
**Solución**:
- Verifica que `WHATSAPP_TOKEN` sea válido
- Verifica que `GEMINI_API_KEY` sea válido
- Revisa los logs del servidor

### Problema 4: Error 429 (Too Many Requests)
**Solución**:
- Espera 1-2 minutos
- Verifica tu cuota de Gemini API
- Considera usar un tier de pago si haces muchas pruebas

---

## ✅ Checklist Final

Antes de considerar la integración completa:

- [ ] Variables de entorno configuradas
- [ ] App creada en Meta for Developers
- [ ] Número de WhatsApp Business configurado
- [ ] Números de prueba añadidos
- [ ] Webhook verificado (✅ en Meta Console)
- [ ] Campo "messages" suscrito
- [ ] Mensaje de prueba enviado y respondido
- [ ] Fecha actual correcta en respuestas
- [ ] Citas agendadas correctamente
- [ ] Mensajes guardados en Firestore

---

## 🎯 Próximos Pasos Después de Probar

1. **Obtener Token Permanente**:
   - El token temporal expira en 24h
   - Necesitarás crear un "System User" en Meta Business
   - Generar un token permanente

2. **Añadir Más Números**:
   - Para producción, necesitarás verificar tu negocio con Meta
   - Esto te permite enviar mensajes a cualquier número

3. **Configurar Rate Limiting**:
   - Implementar límites para evitar spam
   - Configurar cooldowns entre mensajes

4. **Monitoreo en Producción**:
   - Configurar alertas para errores
   - Dashboard de métricas
   - Logs centralizados

---

**Creado por**: Antigravity AI
**Fecha**: 5 de enero de 2026
**Versión**: 1.0.0

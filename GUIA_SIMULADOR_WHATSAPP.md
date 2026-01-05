# 📱 SIMULADOR DE WHATSAPP - Guía Rápida

## 🎯 ¿Qué es?

El **Simulador de WhatsApp** es una interfaz que te permite probar Lysandra **sin necesidad de configurar Meta, WhatsApp Business API, ni ningún servicio externo**.

Funciona **exactamente igual** que WhatsApp real, pero todo es local.

## ✅ Ventajas

- ✅ **Sin configuración externa**: No necesitas Meta, tokens, ni webhooks
- ✅ **100% local**: Todo funciona en tu máquina
- ✅ **Pruebas instantáneas**: Escribe y recibe respuestas inmediatamente
- ✅ **Mismo comportamiento**: Usa el mismo código que WhatsApp real
- ✅ **Debugging fácil**: Ves los logs en tiempo real
- ✅ **Gratis**: Sin costos de API ni mensajes

## 🚀 Cómo Usar

### 1. Iniciar el Servidor
```bash
npm run dev
```

### 2. Abrir el Simulador
1. Ve a **Dashboard**
2. Haz clic en **"Simulador WhatsApp"** en el menú lateral
3. ¡Listo! Ya puedes empezar a chatear

### 3. Enviar Mensajes
- Escribe en el campo de texto
- Presiona Enter o haz clic en el botón de enviar
- Lysandra responderá automáticamente

## 🧪 Casos de Prueba Recomendados

### Prueba 1: Saludo Básico
**Tú**: "Hola"
**Lysandra**: Debe presentarse y ofrecer ayuda

### Prueba 2: Consultar Fecha Actual (IMPORTANTE)
**Tú**: "¿Qué día es hoy?"
**Lysandra**: Debe responder "5 de enero de 2026" (fecha actual correcta)

### Prueba 3: Agendar Cita con Fecha Relativa
**Tú**: "Quiero una cita para el próximo lunes"
**Lysandra**: 
- Debe calcular correctamente: próximo lunes = 13 de enero de 2026
- Debe preguntar la hora
- Debe confirmar la cita

### Prueba 4: Consultar Información
**Tú**: "¿Cuánto cuesta una consultoría?"
**Lysandra**: Debe buscar en la base de conocimiento y responder

### Prueba 5: Escalamiento
**Tú**: "Necesito hablar con un humano"
**Lysandra**: Debe activar el escalamiento a agente humano

## 📊 Monitoreo

### Ver Logs en Tiempo Real
Abre la consola del navegador (F12) y ve a la pestaña "Console" para ver:
- Mensajes enviados
- Respuestas recibidas
- Llamadas a herramientas (getCurrentDateTime, checkAvailability, etc.)

### Ver en Firestore
1. Abre Firebase Console
2. Ve a Firestore Database
3. Busca la colección `conversations`
4. Verás los mensajes guardados con el número simulado

## 🔍 Diferencias con WhatsApp Real

| Característica | Simulador | WhatsApp Real |
|----------------|-----------|---------------|
| Configuración | ❌ No requiere | ✅ Requiere Meta |
| Costo | 🆓 Gratis | 💰 Pago por mensaje |
| Velocidad | ⚡ Instantáneo | 🐌 Depende de red |
| Debugging | 🔍 Fácil (logs visibles) | 🔒 Difícil |
| Número | 📱 Simulado | 📱 Real |
| Respuestas | ✅ Idénticas | ✅ Idénticas |

## 🎨 Características del Simulador

- **Interfaz WhatsApp**: Diseño similar a WhatsApp real
- **Indicador de escritura**: Muestra cuando Lysandra está "escribiendo"
- **Timestamps**: Cada mensaje tiene hora
- **Markdown**: Soporta formato markdown en respuestas
- **Botones rápidos**: Mensajes de ejemplo para pruebas rápidas
- **Limpiar chat**: Botón para reiniciar la conversación
- **Panel de info**: Estadísticas en tiempo real

## 🐛 Troubleshooting

### Problema: No recibo respuestas
**Solución**:
1. Verifica que el servidor esté corriendo (`npm run dev`)
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que Firebase esté configurado correctamente

### Problema: Error "Failed to fetch"
**Solución**:
1. Asegúrate de que el servidor esté en `http://localhost:3000`
2. Recarga la página
3. Verifica que no haya errores en la terminal del servidor

### Problema: Lysandra da fecha incorrecta
**Solución**:
1. Ve a Settings > General > Configuración Regional
2. Verifica que la zona horaria sea correcta
3. Ejecuta: `npx tsx src/scripts/test-datetime-tool.ts`

## 📝 Notas Importantes

1. **Número Simulado**: El simulador usa el número `+52 55 1234 5678`
2. **Persistencia**: Las conversaciones se guardan en Firestore
3. **Herramientas**: Todas las herramientas funcionan igual que en WhatsApp real
4. **Límites**: No hay límite de mensajes (es local)

## 🚀 Próximos Pasos

Una vez que hayas probado todo en el simulador:

1. **Configura WhatsApp Real** (cuando estés listo):
   - Sigue la guía en `GUIA_WHATSAPP.md`
   - Usa Ngrok o despliega a Vercel
   - Configura el webhook en Meta

2. **Monitorea en Producción**:
   - Usa Vercel logs
   - Configura alertas
   - Revisa métricas en Firestore

## ✅ Checklist de Pruebas

Antes de ir a producción, verifica que en el simulador:

- [ ] Lysandra responde a saludos
- [ ] Lysandra da la fecha actual correcta (5 de enero de 2026)
- [ ] Lysandra calcula fechas relativas correctamente (próximo lunes = 13 de enero)
- [ ] Lysandra agenda citas correctamente
- [ ] Lysandra consulta la base de conocimiento
- [ ] Lysandra escala a humano cuando se solicita
- [ ] Los mensajes se guardan en Firestore
- [ ] Las citas se guardan en Firestore

---

**¡Disfruta probando Lysandra sin complicaciones!** 🎉

**Creado por**: Antigravity AI
**Fecha**: 5 de enero de 2026
**Versión**: 1.0.0

# 🔧 Configuración de WhatsApp Business para RinoEstoma Agent

## Descripción General

Esta guía te ayudará a configurar WhatsApp Business API para que RinoEstoma Agent pueda conversar con pacientes directamente en WhatsApp.

**Flujo completo:**
```
Paciente escribe en WhatsApp → Webhook recibe → Agente procesa (RAG + tools) → Respuesta enviada a WhatsApp
```

---

## Paso 1: Obtener Credenciales de Meta (Facebook Developers)

### 1.1 Crear o acceder a tu aplicación Meta

1. Ve a https://developers.facebook.com/
2. Inicia sesión o crea cuenta
3. Ve a "Mis Aplicaciones"
4. Click en "Crear aplicación"
5. Selecciona "Empresa" como tipo
6. Llena los datos:
   - **Nombre de la app:** `RinoEstoma Agent`
   - **Email de contacto:** tu@email.com
   - **App purpose:** `Herramientas de negocio`
7. Click "Crear aplicación"

### 1.2 Agregar WhatsApp a tu aplicación

1. En el dashboard de tu app, ve a "Agregar producto"
2. Busca "WhatsApp"
3. Click "Configurar"
4. Selecciona "WhatsApp Business Platform"

### 1.3 Obtener Phone ID y Access Token

**Para testing (teléfono de prueba):**
1. Ve a "Configuración" → "Números de teléfono"
2. Deberías ver un número de prueba
3. Copy: **PHONE_ID** (número 16 dígitos)
4. Ve a "Tokens de acceso"
5. Copy: **ACCESS_TOKEN** (comienza con `EAAxx`)

**Para producción (tu número real):**
1. Necesitas vincular tu número de WhatsApp Business
2. Ve a "Números de teléfono"
3. Click "Agregar número"
4. Sigue el proceso de verificación
5. Copy: **PHONE_ID** y **ACCESS_TOKEN**

### 1.4 Crear Webhook Token

Necesitas un token secreto para verificar que los webhooks vienen de Meta.

1. Abre una terminal y ejecuta:
   ```bash
   openssl rand -hex 32
   ```
   Esto genera un token aleatorio, por ejemplo: `a3c5e7b9d2f4g6h8i0j1k2l3m4n5o6p7`

2. Este será tu: **WEBHOOK_TOKEN**

---

## Paso 2: Configurar Variables de Entorno en Vercel

### 2.1 Agregar env vars en Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Selecciona proyecto `v0-rinoestoma-app-plan`
3. Ve a "Settings" → "Environment Variables"
4. Agrega las siguientes variables:

```
WHATSAPP_PHONE_ID = <tu-phone-id>
WHATSAPP_ACCESS_TOKEN = <tu-access-token>
WHATSAPP_WEBHOOK_TOKEN = <tu-webhook-token>
```

5. Click "Save"

### 2.2 Re-deployar la aplicación

1. Ve a "Deployments"
2. Click los 3 puntitos en el deployment actual
3. Click "Redeploy"

Vercel redesplegará con las nuevas env vars.

---

## Paso 3: Configurar Webhook en Meta

### 3.1 Obtener URL del webhook

Tu URL será:
```
https://v0-rinoestoma-app-plan-facundotravelers-projects.vercel.app/api/webhooks/whatsapp
```

(O tu dominio actual en Vercel)

### 3.2 Configurar en Meta Developers

1. Ve a tu app en https://developers.facebook.com
2. Ve a "Configuración" → "Webhooks"
3. Click "Editar"
4. Rellena:
   - **URL de devolución de llamada:** `https://tu-url-vercel.com/api/webhooks/whatsapp`
   - **Token de verificación:** `<tu-webhook-token>`
5. Click "Verificar e Guardar"

### 3.3 Suscribirse a eventos

1. Permanece en "Configuración" → "Webhooks"
2. En la sección "Campos de webhook", selecciona:
   - ✅ `messages`
   - ✅ `message_status`
3. Click "Guardar"

---

## Paso 4: Probar la Integración

### 4.1 Enviar mensaje de prueba

1. Abre WhatsApp en tu teléfono
2. Encuentra el número de RinoEstoma (que está en tu cuenta de WhatsApp Business)
3. Envía un mensaje: `Hola, ¿cómo estás?`

### 4.2 Verificar respuesta del agente

El agente debería:
1. Recibir el mensaje en el webhook
2. Procesarlo con RAG
3. Generar una respuesta
4. Enviarla de vuelta a WhatsApp en ~2-5 segundos

Si no recibe respuesta:
- Revisa los logs en Vercel Dashboard → "Logs"
- Verifica que las env vars estén correctas
- Verifica que el webhook esté verificado en Meta

---

## Paso 5: Personalizar Respuestas del Agente (Opcional)

Puedes personalizar cómo responde el agente editando:

**Ubicación:** `/lib/agent/agent-config.ts`

**Variables clave:**
- `SYSTEM_PROMPT` - Instrucciones al agente
- `AGENT_TOOLS` - Herramientas disponibles
- Mensajes de bienvenida, error, etc.

---

## Troubleshooting

### El webhook no responde

```
❌ Error: Webhook verification failed
```

**Solución:**
- Verifica que `WHATSAPP_WEBHOOK_TOKEN` sea exactamente igual en Vercel y Meta
- Asegúrate que no haya espacios en blanco

### Mensajes no se envían a WhatsApp

```
❌ Error: Failed to send WhatsApp message
```

**Solución:**
- Verifica que `WHATSAPP_ACCESS_TOKEN` sea válido (no expirado)
- Verifica que `WHATSAPP_PHONE_ID` sea correcto
- Revisa los logs en Vercel

### El agente no responde

```
❌ Error: Agent processing failed
```

**Solución:**
- Verifica que las credenciales de Supabase estén correctas
- Verifica que la API key de OpenAI/Anthropic sea válida
- Revisa los logs de función en Vercel

---

## URLs Importantes

- **Meta Developers:** https://developers.facebook.com/
- **Tu App:** https://developers.facebook.com/apps/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **WhatsApp API Docs:** https://developers.facebook.com/docs/whatsapp/cloud-api/

---

## Resumen de Credenciales Necesarias

| Variable | Dónde obtener | Ejemplo |
|----------|---------------|---------|
| WHATSAPP_PHONE_ID | Meta Developers → WhatsApp → Números | `110123456789012` |
| WHATSAPP_ACCESS_TOKEN | Meta Developers → Tokens | `EAABsbCS1234567...` |
| WHATSAPP_WEBHOOK_TOKEN | Lo generas tú (openssl rand) | `a3c5e7b9d2f4...` |

---

## ¿Necesitas Ayuda?

- **Documentación Meta:** https://developers.facebook.com/docs/whatsapp
- **Contacto Meta Support:** https://www.facebook.com/business/help
- **Logs de tu app:** Vercel Dashboard → Logs

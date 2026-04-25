# WhatsApp Business Integration Guide

## Requisitos

1. **Meta Business Account** (Facebook)
2. **WhatsApp Business Phone Number** registrado en Meta
3. **API Credentials**:
   - Phone ID
   - Business Account ID
   - Access Token (con permisos `whatsapp_business_messaging`, `messages_read`, `messages_manage`)

---

## Paso 1: Obtener Credenciales de WhatsApp

### 1.1 Ir a Meta Business Dashboard
- Acceder a [business.facebook.com](https://business.facebook.com)
- Navegar a "Apps & Assets" → "Apps"

### 1.2 Crear o Seleccionar App WhatsApp
- Clic en "My Apps" → "Create App"
- Seleccionar "Business" como tipo
- Agregar "WhatsApp" como producto

### 1.3 Obtener Credenciales
- Ir a "WhatsApp" → "Getting Started"
- Copiar:
  - **Phone Number ID**
  - **Business Account ID**
  - **Temporary Access Token** (o generar uno permanente)

---

## Paso 2: Configurar Variables de Entorno

En `.env.local`, agregar:

```env
# WhatsApp Business
WHATSAPP_PHONE_ID=123456789101112  # Tu Phone Number ID
WHATSAPP_ACCESS_TOKEN=EAABs...    # Token de acceso
WHATSAPP_WEBHOOK_TOKEN=my_secure_webhook_token  # Token seguro que defines tú

# RinoEstoma
WHATSAPP_BUSINESS_ACCOUNT_ID=12345678901234
```

---

## Paso 3: Configurar Webhook en Meta

### 3.1 Obtener URL de Webhook
Tu URL de webhook es:
```
https://[your-vercel-domain]/api/webhooks/whatsapp
```

### 3.2 Configurar en Meta
1. Ir a "WhatsApp" → "Configuration" en Meta Dashboard
2. En "Webhook", hacer clic en "Edit"
3. Agregar:
   - **Callback URL**: `https://[tu-dominio]/api/webhooks/whatsapp`
   - **Verify Token**: El valor de `WHATSAPP_WEBHOOK_TOKEN` que defines

4. Seleccionar eventos a suscribirse:
   - ✅ `messages`
   - ✅ `message_template_status_update`
   - ✅ `message_template_quality_update`

5. Hacer clic en "Verify and Save"

---

## Paso 4: Configurar Números Telefónicos

### 4.1 Verificar Número de Prueba
- En "Phone Number Management", verifica tu número
- Sigue los pasos de verificación SMS

### 4.2 Agregar Números Permitidos
- Inicialmente, solo números de prueba pueden recibir mensajes
- Para producción, solicitar aprobación en Meta

---

## Paso 5: Testear Webhook

### 5.1 Probar Conexión
```bash
# Desde terminal, probar verificación
curl "https://[tu-dominio]/api/webhooks/whatsapp?hub.verify_token=my_secure_webhook_token&hub.challenge=test_challenge"

# Debería responder con: test_challenge
```

### 5.2 Enviar Mensaje de Prueba
1. Usar WhatsApp Business API Test Message
2. O enviar mensaje desde número de prueba al bot

---

## Paso 6: Monitorear Logs

Una vez enviado un mensaje:

1. Ir a Vercel Dashboard
2. Ver logs en tiempo real
3. Verificar que el webhook recibe los datos

---

## Estructura de Mensajes Soportados

### Texto
```json
{
  "from": "551199999999",
  "type": "text",
  "text": {
    "body": "Hola, quiero agendar una cita"
  }
}
```

### Botones
```json
{
  "from": "551199999999",
  "type": "interactive",
  "interactive": {
    "button_reply": {
      "id": "1",
      "title": "Sí"
    }
  }
}
```

---

## Troubleshooting

### Webhook no verifica
- Verificar `WHATSAPP_WEBHOOK_TOKEN` es correcto
- Asegurar que la URL es pública y accesible

### No llegan mensajes
- Verificar que el número está en la lista de números permitidos (en desarrollo)
- Verificar que la app tiene permiso de `messages_read`
- Revisar logs de Vercel

### Respuestas no se envían
- Verificar `WHATSAPP_ACCESS_TOKEN` es válido
- Verificar `WHATSAPP_PHONE_ID` es correcto
- Revisar respuesta de API en logs

---

## Límites de Rate Limiting

- Meta limita a 1000 mensajes/hora por número por defecto
- Para producción, solicitar aumento de límites en Meta

---

## Recursos

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Webhook Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/subscribe-to-messages)
- [Meta Business Dashboard](https://business.facebook.com)

---

## Soporte

Para problemas con WhatsApp Business API:
- Contactar a [Meta Support](https://www.facebook.com/help)
- Revisar [WhatsApp API Status](https://www.facebook.com/support/)

Para problemas con la integración en RinoEstoma Agent:
- Revisar logs en Vercel
- Crear issue en GitHub

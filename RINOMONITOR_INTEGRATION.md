# RinoMONITOR Integration Guide

## Descripción General

RinoMONITOR es la plataforma de telemonitoreo clínico inteligente de RinoEstomatología. Esta integración permite que el agente acceda a datos de sesiones de monitoreo en tiempo real y proporcione análisis y recomendaciones basadas en datos clínicos.

---

## Configuración Inicial

### 1. Variables de Entorno

Agregar a `.env.local`:

```env
# RinoMONITOR API
RINOMONITOR_API_URL=https://api.rinomonitor.com  # O tu endpoint
RINOMONITOR_API_KEY=your_api_key_here
```

**Obtener credenciales:**
1. Acceder a [RinoMONITOR Dashboard](https://app.rinomonitor.com)
2. Ir a Settings → API Keys
3. Generar nueva clave (scope: `read:sessions`, `read:analysis`)
4. Copiar clave y asignar a `RINOMONITOR_API_KEY`

### 2. Verificar Conexión

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.rinomonitor.com/health
# Response: { "status": "ok" }
```

---

## Componentes Implementados

### 1. RinoMonitor Client (`lib/monitoring/rinomonitor-client.ts`)

Cliente para interactuar con API de RinoMONITOR:

```typescript
import { getRinoMonitorClient } from '@/lib/monitoring/rinomonitor-client'

const client = getRinoMonitorClient()

// Obtener sesión
const session = await client.getSession('session_id')

// Obtener análisis
const analysis = await client.getSessionAnalysis('session_id', 'general_report')

// Obtener métricas en tiempo real
const metrics = await client.getRealtimeMetrics('session_id')

// Crear nueva sesión
const newSession = await client.createSession('patient_id', 'respiratory')

// Completar sesión
await client.completeSession('session_id')
```

### 2. API Endpoints

#### GET `/api/monitoring/sessions`

Obtener sesiones de monitoreo:

```bash
# Una sesión específica
GET /api/monitoring/sessions?session_id=ABC123&include_analysis=true

# Sesiones de un paciente
GET /api/monitoring/sessions?patient_id=USER_ID
```

Response:
```json
{
  "session": {
    "id": "session_123",
    "patient_id": "user_456",
    "monitor_type": "respiratory",
    "status": "completed",
    "started_at": "2026-04-24T10:00:00Z",
    "ended_at": "2026-04-24T10:30:00Z",
    "duration_seconds": 1800,
    "metrics": {
      "respiratory_rate": 18,
      "nasal_patency": 85
    }
  },
  "analysis": { ... }
}
```

#### POST `/api/monitoring/sessions`

Crear o gestionar sesiones:

```bash
# Crear nueva sesión
POST /api/monitoring/sessions
{
  "patient_id": "user_123",
  "monitor_type": "functional",
  "action": "create"
}

# Completar sesión
POST /api/monitoring/sessions
{
  "session_id": "session_123",
  "action": "complete"
}
```

#### GET `/api/monitoring/analysis`

Obtener análisis detallado:

```bash
GET /api/monitoring/analysis?session_id=session_123&type=general_report&include_metrics=true
```

Response:
```json
{
  "session_id": "session_123",
  "analysis": {
    "findings": "Patología respiratoria detectada...",
    "recommendations": [
      "Iniciar tratamiento de rinitis alérgica",
      "Seguimiento en 2 semanas"
    ],
    "severity_level": "moderate"
  },
  "metrics": { ... }
}
```

### 3. Componente MonitoringDisplay

Visualizar sesiones y análisis:

```tsx
import { MonitoringDisplay } from '@/components/monitoring-display'

// Mostrar sesión específica
<MonitoringDisplay 
  sessionId="session_123" 
  includeAnalysis={true}
/>

// Mostrar sesiones del paciente
<MonitoringDisplay 
  patientId="user_456" 
/>
```

---

## Flujo de Integración con Agent

El agente automáticamente puede:

1. **Iniciar sesión**: Crear nueva sesión de monitoreo
2. **Acceder a datos**: Obtener métricas de sesión activa
3. **Generar análisis**: Crear análisis basado en datos
4. **Proporcionar recomendaciones**: Dar sugerencias clínicas

### Ejemplo: Agent con RinoMONITOR

```typescript
// User pregunta: "¿Cómo está mi última sesión de monitoreo?"
// Agent:
1. Obtiene patient_id del usuario
2. Llama: client.getPatientSessions(patient_id)
3. Obtiene sesión más reciente
4. Llama: client.getSessionAnalysis(session_id)
5. Integra análisis en respuesta contextualizada

Response: "Según tu última sesión de monitoreo del 24/04:
- Tasa respiratoria: 18 rpm (normal)
- Permeabilidad nasal: 85% (leve disminución)
- Hallazgos: Posible rinitis alérgica

Recomendaciones:
- Iniciar antihistamínico
- Control en 2 semanas"
```

---

## Tipos de Monitoreo Disponibles

### 1. Respiratory (Respiratorio)
Evalúa:
- Tasa respiratoria
- Permeabilidad nasal
- Resistencia de vías aéreas
- Patrones respiratorios

### 2. Functional (Funcional)
Evalúa:
- Calidad vocal
- Claridad del habla
- Puntuación de articulación
- Rango de movilidad

### 3. General
Evaluación completa combinando:
- Datos respiratorios
- Datos funcionales
- Score de cumplimiento
- Observaciones generales

---

## Niveles de Severidad

Los análisis incluyen clasificación:
- **normal**: Sin hallazgos significativos
- **mild**: Hallazgos leves, no requiere intervención inmediata
- **moderate**: Hallazgos moderados, requiere seguimiento
- **severe**: Hallazgos graves, requiere intervención inmediata

---

## Sincronización con Database Local

Las sesiones se sincroniza automáticamente:

```typescript
// Cuando se obtiene una sesión de RinoMONITOR:
const session = await client.getSession(sessionId)

// Se guarda en DB local:
await supabase.from('monitoring_sessions').update({
  external_session_id: session.id,
  status: session.status,
  data: session.metrics,
  analysis_results: analysis
}).eq('id', localSessionId)
```

**Ventajas:**
- Acceso rápido a datos históricos
- Búsqueda local sin latencia
- Análisis offline disponible
- Sincronización de cambios

---

## Casos de Uso

### 1. Evaluación Post-Sesión
```
User: "¿Qué dicen los resultados de mi monitoreo?"
Agent: 
- Obtiene últimas 3 sesiones
- Compila análisis
- Proporciona resumen con tendencias
```

### 2. Seguimiento de Progreso
```
User: "¿He mejorado con el tratamiento?"
Agent:
- Compara sesiones anteriores vs actual
- Analiza tendencias de métricas
- Proporciona feedback personalizado
```

### 3. Recomendaciones Clínicas
```
User: "¿Qué debo hacer ahora?"
Agent:
- Revisa análisis de última sesión
- Consulta Knowledge Base para protocolo
- Proporciona recomendaciones basadas en datos
- Sugiere próxima cita
```

---

## Error Handling

El cliente maneja errores automáticamente:

```typescript
const session = await client.getSession('invalid_id')
// Retorna: null

const sessions = await client.getPatientSessions('patient_id')
// Retorna: [] (vacío si hay error)

// Logs automáticos:
// [v0] Error fetching RinoMONITOR session: HTTP 404
```

---

## Rate Limiting

RinoMONITOR API tiene límites:
- **100 requests/minuto** por API key
- **1000 requests/hora**
- **10,000 requests/día**

Implementamos caché para optimizar:

```typescript
// Caché automático en memoria
// Evita requests duplicados en corto plazo
```

---

## Troubleshooting

### Error: "API Key not configured"
```
Solución:
1. Verificar RINOMONITOR_API_KEY en .env.local
2. Confirmar que es válida en RinoMONITOR Dashboard
3. Reiniciar dev server
```

### Error: "Session not found"
```
Solución:
1. Verificar session_id es correcto
2. Confirmar que sesión existe en RinoMONITOR
3. Revisar que patient_id coincide
```

### Análisis no disponible
```
Posibles razones:
- Sesión aún en progreso (esperar a completar)
- Falta procesamiento de análisis en RinoMONITOR
- Error en API de análisis

Solución:
- Esperar a completación de sesión
- Verificar status en dashboard
- Contactar soporte RinoMONITOR
```

---

## Próximos Pasos

1. **Streaming en tiempo real**: WebSocket para métricas live
2. **Exportación de reportes**: PDF/Excel con análisis
3. **Alertas automáticas**: Notificar si severidad es alta
4. **Machine Learning**: Predicción de resultados basada en histórico
5. **Integración con RinoEstomaDAO**: Blockchain para registros inmutables

---

## Documentación Externa

- [RinoMONITOR API Docs](https://docs.rinomonitor.com/api)
- [RinoMONITOR Dashboard](https://app.rinomonitor.com)
- [RinoEstoma Support](https://support.rinoestoma.com)


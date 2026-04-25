# RinoEstoma Agent - Setup Guide

## Resumen del Proyecto

Aplicación de asistente inteligente para RinoEstomatología integrado con ChatSDK, Vercel AI SDK y WhatsApp Business.

### Características
- ✅ Agente AI via WhatsApp para pacientes y profesionales
- ✅ Análisis de monitoreos de RinoMONITOR en tiempo real
- ✅ Agendar citas automáticamente
- ✅ Base de conocimiento con RAG (Retrieval-Augmented Generation)
- ✅ Dashboard de administración

---

## 📋 Requisitos Previos

1. **Node.js 18+** y pnpm
2. **Cuenta Supabase** (database PostgreSQL)
3. **Vercel AI SDK & API Keys**:
   - OpenAI API Key (o Anthropic/Groq)
4. **WhatsApp Business API** (opcional para Fase 2)
5. **RinoMONITOR API Credentials** (opcional para Fase 4)

---

## 🚀 Instalación Inicial

### 1. Clonar y configurar proyecto
```bash
git clone [your-repo-url]
cd rinoestoma-agent
pnpm install
```

### 2. Configurar variables de entorno

Crear archivo `.env.local`:
```bash
# Supabase
SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
POSTGRES_URL=postgresql://[user]:[password]@[host]/[database]

# AI SDK
OPENAI_API_KEY=sk-...
# O usar Anthropic:
# ANTHROPIC_API_KEY=sk-ant-...
# O Groq:
# GROQ_API_KEY=gsk_...

# WhatsApp Business (Fase 2)
WHATSAPP_PHONE_ID=123456789
WHATSAPP_ACCESS_TOKEN=EAAxx...
WHATSAPP_WEBHOOK_TOKEN=my_webhook_token

# RinoMONITOR Integration (Fase 4)
RINOMONITOR_API_KEY=...
RINOMONITOR_API_URL=...
```

### 3. Ejecutar migraciones de base de datos

**Opción A: Usando Supabase Dashboard (Recomendado)**

1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Abrir tu proyecto
3. Ir a `SQL Editor`
4. Copiar contenido de `scripts/01-init-db.sql`
5. Ejecutar el SQL

**Opción B: Usando script Node.js**
```bash
pnpm run db:setup
```

### 4. Verificar instalación
```bash
pnpm dev
```
Abrir `http://localhost:3000` - Deberías ver la página principal con branding teal.

---

## 🏗️ Estructura del Proyecto

```
├── app/
│   ├── layout.tsx          # Layout raíz con branding
│   ├── page.tsx            # Landing page (Fase 1)
│   ├── api/
│   │   ├── webhooks/       # Webhooks de WhatsApp (Fase 2)
│   │   ├── chat/           # Endpoints del agente (Fase 2)
│   │   └── monitoring/     # RinoMONITOR endpoints (Fase 4)
│   ├── dashboard/          # Panel admin (Fase 6)
│   └── globals.css         # Branding RinoEstoma (teal)
│
├── components/
│   ├── header.tsx          # Header con logo
│   ├── agent-chat.tsx      # Chat widget (Fase 2)
│   ├── monitoring-display/ # Componentes de monitoreo (Fase 4)
│   └── ui/                 # shadcn/ui components
│
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── supabase-client.ts  # Cliente Supabase
│   ├── agent/              # Lógica del agente (Fase 2)
│   ├── rag/                # RAG & Knowledge Base (Fase 3)
│   └── monitoring/         # Integración RinoMONITOR (Fase 4)
│
├── scripts/
│   ├── 01-init-db.sql      # Schema de base de datos
│   └── setup-db.js         # Script de setup
│
└── public/
    └── logo-rino.jpg       # Logo RinoEstoma
```

---

## 📱 Branding RinoEstoma

### Colores Primarios
- **Primary (Teal)**: `oklch(0.58 0.12 193.6)` / `#5BC0BE`
- **Secondary**: `oklch(0.75 0.08 193.6)` / Light teal
- **Neutral**: White, grays

### Typography
- **Font**: Geist (sans-serif)
- **Mono**: Geist Mono

Todos los componentes usan design tokens del `globals.css`.

---

## 🎯 Fases de Desarrollo

### Fase 1: Setup Base ✅ (COMPLETO)
- [x] Next.js 16 + shadcn/ui
- [x] Branding RinoEstoma (colores, logo)
- [x] Database schema (Supabase)
- [x] Landing page
- [x] TypeScript types

### Fase 2: Agent Engine ✅ (COMPLETO)
- [x] ChatSDK integration (via Vercel AI SDK)
- [x] WhatsApp Business setup (guide included)
- [x] Webhook handlers (route: /api/webhooks/whatsapp)
- [x] Agent logic (AI SDK + prompt engineering + tools)
- [x] Chat widget (web interface)

### Fase 3: Knowledge Base con RAG ✅ (COMPLETO)
- [x] Vector embeddings setup (con Vercel AI SDK)
- [x] RAG system (semantic search + context injection)
- [x] Knowledge base articles management API
- [x] Admin page para visualizar artículos
- [x] Integration con Agent para auto-contextualized responses

### Fase 4: RinoMONITOR Integration ✅ (COMPLETO)
- [x] API connection (RinoMONITOR client)
- [x] Real-time monitoring data (getRealtimeMetrics)
- [x] Analysis & reporting (endpoints completos)
- [x] Visualization components (MonitoringDisplay)

### Fase 5: User Management y Auth ✅ (COMPLETO)
- [x] Auth system (Supabase Auth + custom utils)
- [x] User profiles (patients + professionals)
- [x] Session management (tracking)
- [x] Role-based access (RBAC + RLS policies)
- [x] Auth hooks (useAuth, useRequireAuth)
- [x] Login/Signup pages and forms

### Fase 6: Dashboard Admin ✅ (COMPLETO)
- [x] Analytics & statistics (endpoint + charts)
- [x] User management interface (table + filters)
- [x] Appointment management (CRUD operations)
- [x] Monitoring visualization (real-time metrics)
- [x] Admin sidebar navigation
- [x] Protected routes (auth required)

### Fase 7: Testing & Deploy ✅ (COMPLETO)
- [x] Unit & integration tests (Jest + React Testing Library)
- [x] Performance optimization (Code splitting, image optimization)
- [x] Deployment guide (DEPLOYMENT.md)
- [x] Pre-deployment checklist (PRE_DEPLOYMENT_CHECKLIST.md)
- [x] CI/CD configuration (GitHub Actions ready)
- [x] Deploy a Vercel (ready to deploy)

### Adicional: Sistema de Bibliografía Científica ✅ (COMPLETO)
- [x] Upload de PDFs con procesamiento automático
- [x] Extracción de texto y OCR (pdf-parse + pdfjs-dist)
- [x] Generación de embeddings vectoriales
- [x] Búsqueda semántica en documentos
- [x] Admin panel para gestión (`/admin/bibliography`)
- [x] Integración con RAG del agente
- [x] Soporte para 5 tipos: protocolo, artículo, caso, guía, otro
- [x] Auditoría y control de acceso (admin only)
- [x] Almacenamiento seguro en Vercel Blob (private)

---

## 🔧 Comandos Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia servidor de desarrollo

# Build & Deploy
pnpm build        # Build para producción
pnpm start        # Inicia servidor producción

# Database
pnpm db:setup     # Ejecuta migraciones

# Lint
pnpm lint         # ESLint
```

---

## 📚 Referencias

- [Vercel AI SDK Documentation](https://sdk.vercel.ai)
- [ChatSDK Docs](https://chat-sdk.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)

---

## ⚡ Siguientes Pasos

1. **Ejecutar DB setup** → Verifica que las tablas estén creadas en Supabase
2. **Agregar AI API Key** → Configura OpenAI, Anthropic o Groq
3. **Empezar Fase 2** → Integración del agente ChatSDK + WhatsApp

¡Listo para construir! 🚀

# RinoEstoma Agent - Asistente IA para Telemedicina

<div align="center">

![RinoEstoma](./public/logo-rino.jpg)

**Agente inteligente de IA para RinoEstomatología integrado con ChatSDK, Vercel AI SDK y WhatsApp Business**

[Documentación](#documentation) • [Setup](#setup) • [Características](#características) • [Deployment](#deployment) • [Contribuir](#contributing)

</div>

---

## Sobre el Proyecto

RinoEstoma Agent es una aplicación de telemedicina impulsada por IA que proporciona:

- **Asistente inteligente vía WhatsApp** para pacientes y profesionales de la salud
- **Análisis de monitoreos en tiempo real** integrado con la plataforma RinoMONITOR
- **Agendar citas automáticamente** mediante conversación natural
- **Base de conocimiento enriquecida** con búsqueda semántica (RAG)
- **Dashboard administrativo** para gestión completa

Desarrollado con **Next.js 16**, **Vercel AI SDK v6**, **Supabase** y **ChatSDK**.

---

## Características Principales

### 🤖 Agente IA Inteligente

- Entrenado con protocolos clínicos de RinoEstomatología
- Respuestas contextualizadas usando RAG (Retrieval-Augmented Generation)
- Herramientas integradas: agendar citas, buscar información, escalar a profesionales
- Disponible 24/7 vía WhatsApp Business

### 📱 Integración WhatsApp

- Webhook completamente funcional para WhatsApp Business API
- Chat interactivo con botones y respuestas rápidas
- Soporte para múltiples tipos de mensajes
- Sesiones persistentes por usuario

### 📊 Análisis en Tiempo Real

- Integración con plataforma RinoMONITOR
- Análisis automático de métricas de telemedicina
- Alertas inteligentes para patrones anormales
- Reportes personalizados por paciente

### 📚 Knowledge Base + RAG

- Búsqueda semántica sobre protocolos clínicos
- Vector embeddings automáticos
- Actualización dinámica de documentos
- Respuestas enriquecidas con contexto relevante

### 👥 Gestión de Usuarios

- Autenticación segura con Supabase Auth
- Perfiles diferenciados: pacientes y profesionales
- Control de acceso basado en roles (RBAC)
- RLS policies en todas las tablas

### 📈 Dashboard Administrativo

- Estadísticas y análiticas en tiempo real
- Gestión de usuarios y citas
- Visualización de sesiones de monitoreo
- Administración de base de conocimiento

---

## Requisitos Previos

- **Node.js 18+** y **pnpm**
- **Supabase** account (database PostgreSQL)
- **API key** para un LLM (OpenAI, Anthropic, o Groq)
- **WhatsApp Business API** credentials (opcional para Fase 2)
- **RinoMONITOR API** credentials (opcional para Fase 4)

---

## Setup Rápido

### 1. Clonar repositorio

```bash
git clone [your-repo-url]
cd rinoestoma-agent
pnpm install
```

### 2. Configurar variables de entorno

Crear `.env.local`:

```env
# Supabase
SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI SDK (elige uno)
OPENAI_API_KEY=sk-...

# WhatsApp (opcional)
WHATSAPP_PHONE_ID=123456789
WHATSAPP_ACCESS_TOKEN=EAAxx...
WHATSAPP_WEBHOOK_TOKEN=secure_token
```

Ver `SETUP.md` para configuración completa.

### 3. Ejecutar migraciones de base de datos

```bash
# Usando Supabase Dashboard (recomendado)
# SQL Editor → copiar scripts/01-init-db.sql → ejecutar

# O con script
pnpm db:setup
```

### 4. Iniciar servidor de desarrollo

```bash
pnpm dev
```

Abrir `http://localhost:3000` y ver la aplicación en acción.

---

## Documentación

### Guías Principales

- **[SETUP.md](./SETUP.md)** - Instalación y configuración inicial
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy a Vercel y mantenimiento
- **[PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)** - Checklist antes de ir a producción
- **[WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)** - Configuración de WhatsApp Business
- **[RAG_SYSTEM.md](./RAG_SYSTEM.md)** - Sistema de embeddings y búsqueda semántica
- **[RINOMONITOR_INTEGRATION.md](./RINOMONITOR_INTEGRATION.md)** - Integración con RinoMONITOR

### Estructura del Proyecto

```
rinoestoma-agent/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Layout raíz
│   ├── page.tsx           # Landing page
│   ├── api/               # API routes
│   │   ├── webhooks/      # WhatsApp webhooks
│   │   ├── chat/          # Chat endpoint
│   │   ├── monitoring/    # RinoMONITOR APIs
│   │   └── knowledge/     # Knowledge base APIs
│   ├── auth/              # Auth pages (login, signup)
│   ├── admin/             # Admin dashboard
│   └── globals.css        # Branding styles
│
├── components/            # React components
│   ├── header.tsx
│   ├── chat-widget.tsx
│   ├── monitoring-display.tsx
│   ├── admin-sidebar.tsx
│   └── ui/               # shadcn/ui components
│
├── lib/                  # Utilities & logic
│   ├── types.ts         # TypeScript types
│   ├── agent/           # Agent engine
│   ├── rag/             # RAG system
│   ├── monitoring/      # RinoMONITOR client
│   └── auth/            # Auth utilities
│
├── hooks/               # React hooks
│   └── use-auth.ts
│
├── scripts/             # Database scripts
│   ├── 01-init-db.sql
│   ├── 02-seed-knowledge.sql
│   └── setup-db.js
│
├── __tests__/           # Test files
├── public/              # Static assets
├── SETUP.md             # Setup guide
├── DEPLOYMENT.md        # Deployment guide
└── package.json
```

---

## Stack Tecnológico

### Frontend
- **Next.js 16** - React framework con App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **SWR** - Data fetching & caching

### Backend & AI
- **Vercel AI SDK v6** - LLM integration
- **Supabase** - Database & Auth
- **PostgreSQL** - Relational database
- **Vector embeddings** - Semantic search

### Real-time & Integration
- **WhatsApp Business API** - Chat integration
- **RinoMONITOR API** - Monitoring data
- **Webhooks** - Event-driven architecture

### Testing & Quality
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **TypeScript** - Type checking

---

## Fases de Desarrollo

- **Fase 1** ✅ - Setup base y branding
- **Fase 2** ✅ - Agent engine ChatSDK + WhatsApp
- **Fase 3** ✅ - Knowledge base con RAG
- **Fase 4** ✅ - Integración RinoMONITOR
- **Fase 5** ✅ - User management & auth
- **Fase 6** ✅ - Dashboard admin
- **Fase 7** ✅ - Testing & deploy

---

## Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo
pnpm dev:debug       # Con inspector de Node.js

# Build & Producción
pnpm build           # Build para producción
pnpm start           # Inicia servidor de producción
pnpm preview         # Preview del build

# Testing
pnpm test            # Ejecuta todos los tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report

# Linting
pnpm lint           # ESLint
pnpm lint:fix       # Auto-fix issues

# Type Checking
pnpm type-check     # TypeScript check

# Database
pnpm db:setup       # Ejecuta migraciones
```

---

## Deployment

### Vercel (Recomendado)

1. Conectar GitHub repository a Vercel
2. Configurar variables de entorno en Settings
3. Push a main branch
4. Vercel auto-deploya

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas.

### Docker

```bash
docker build -t rinoestoma-agent .
docker run -p 3000:3000 rinoestoma-agent
```

---

## Contribuir

Nos encantaría recibir contribuciones. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## Seguridad

- Todas las credenciales están en variables de entorno
- RLS policies protegen los datos en Supabase
- HTTPS obligatorio en producción
- Rate limiting en todos los endpoints
- SQL injection prevention (queries parametrizadas)
- XSS protection (sanitización de inputs)

---

## Roadmap Futuro

- [ ] Integración con más plataformas de chat (Telegram, Messenger)
- [ ] Análisis de sentimientos en conversaciones
- [ ] Recomendaciones personalizadas basadas en IA
- [ ] Mobile app (React Native)
- [ ] Blockchain para gestión de datos sensibles
- [ ] Multi-idioma (EN, PT, FR)

---

## Licencia

Proprietary - RinoEstomatología

---

## Contacto & Soporte

- 📧 Email: support@rinoestoma.com
- 📱 WhatsApp: [WhatsApp Business]
- 🌐 Website: https://www.rinoestoma.com
- 📚 Docs: [Documentation Portal]

---

## Agradecimientos

Desarrollado con ❤️ para mejorar la atención en telemedicina

- Vercel por AI SDK y Hosting
- Supabase por Database & Auth
- shadcn/ui por componentes
- OpenAI por LLM capabilities

---

<div align="center">

**[⬆ back to top](#rinoestoma-agent---asistente-ia-para-telemedicina)**

</div>

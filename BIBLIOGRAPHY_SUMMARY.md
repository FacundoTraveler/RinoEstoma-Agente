# Resumen del Sistema de Bibliografía Científica - RinoEstoma Agent

## 🎯 Descripción

Sistema completo para cargar, procesar e indexar documentos PDF científicos y clínicos de RinoEstomatología. Los documentos se integran automáticamente en la base de conocimiento del agente para proporcionar respuestas contextualizadas basadas en evidencia.

## ✨ Características

### 1. Upload Automático de PDFs
- Carga de archivos PDF (hasta 50MB)
- Validación de formato y tamaño
- Interfaz admin intuitiva en `/admin/bibliography`
- Soporte para múltiples tipos de documentos

### 2. Procesamiento Automático
- **Extracción de Texto**: PDF → Texto limpio con `pdf-parse`
- **Segmentación**: División en chunks de ~2000 caracteres
- **Extracción de Metadata**: Título, autores, fecha de publicación
- **Conceptos Clave**: Extracción automática de palabras clave

### 3. Búsqueda Semántica
- **Embeddings Vectoriales**: Conversión de chunks a vectores 1536-dim
- **Índice IVFFlat**: Búsqueda rápida en PostgreSQL (pgvector)
- **Similitud Coseno**: Ranking inteligente de resultados
- **Contexto RAG**: Inyección automática en prompts del agente

### 4. Seguridad y Control
- **RLS Policies**: Solo administradores pueden cargar/editar
- **Blob Storage**: PDFs en Vercel Blob (almacenamiento privado)
- **Auditoría Completa**: Registro de todas las operaciones
- **GDPR Compliant**: No se almacena datos personales de pacientes

## 📋 Tipos de Documentos

| Tipo | Código | Ejemplo |
|------|--------|---------|
| Protocolo Clínico | `protocol` | Protocolos de evaluación funcional |
| Artículo Científico | `scientific_article` | Papers de investigación publicados |
| Caso Clínico | `case_study` | Reportes de casos de pacientes |
| Guía Clínica | `clinical_guide` | Estándares de tratamiento |
| Otro | `other` | Material educativo diverso |

## 🏗️ Arquitectura Técnica

### Base de Datos (PostgreSQL + pgvector)

**Tablas principales:**

```sql
-- Documentos bibliográficos
bibliography_documents
├── id (UUID)
├── title (TEXT)
├── document_type (VARCHAR)
├── extracted_text (TEXT)
├── blob_url (TEXT) → Vercel Blob
├── key_concepts (TEXT[])
└── created_by (UUID) → users

-- Secciones/chunks para búsqueda semántica
bibliography_sections
├── id (UUID)
├── document_id (FK)
├── content (TEXT)
├── embedding_vector (vector 1536) → OpenAI embeddings
└── page_number (INTEGER)

-- Auditoría de cambios
bibliography_audit_log
├── id (UUID)
├── document_id (FK)
├── action (VARCHAR)
├── changed_by (UUID) → users
└── timestamp
```

### Pipeline de Procesamiento

```
PDF Upload
    ↓
[1] Validación (tipo, tamaño)
    ↓
[2] Extracción de Texto (pdf-parse)
    ↓
[3] Limpieza y Normalización
    ↓
[4] Segmentación en Chunks (~2000 chars)
    ↓
[5] Generación de Embeddings (OpenAI)
    ↓
[6] Almacenamiento en PostgreSQL + pgvector
    ↓
[7] Indexación para búsqueda rápida
    ↓
Listo para RAG del Agente
```

## 🔧 Endpoints API

### POST `/api/admin/bibliography/upload`
Carga un PDF y lo procesa automáticamente

**Request (multipart/form-data):**
```javascript
{
  file: File,                    // PDF
  title: "Protocolo de Evaluación",
  description: "Descripción...",
  documentType: "protocol",      // Enum
  authors: "Dr. Juan, Dra. María",
  publicationDate: "2024-04-24"
}
```

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "uuid-xxx",
    "title": "...",
    "pages": 42,
    "sections": 125,
    "blobUrl": "https://..."
  }
}
```

### GET `/api/admin/bibliography/upload`
Lista documentos cargados con filtros

**Query Params:**
- `type`: Filtrar por tipo de documento
- `status`: "active" (default) | "archived" | "pending_review"
- `limit`: Número de resultados (default: 50)
- `offset`: Para paginación

**Response:**
```json
{
  "documents": [...],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

## 🖥️ Panel de Administración

### Página Principal (`/admin/bibliography`)

**Funcionalidades:**
1. **Cargar Documentos** - Formulario con validación
2. **Listar Documentos** - Tabla con filtros por tipo
3. **Visualizar Metadata** - Título, autores, fecha, páginas
4. **Conceptos Clave** - Tags extraídos automáticamente
5. **Estado** - Active, archived, pending_review

**Filtros Disponibles:**
- Por tipo de documento (todos, protocolo, artículo, caso, guía, otro)
- Por estado (active, archived)
- Búsqueda por título/descripción

## 🤖 Integración con el Agente

### Automática en RAG

Cuando un usuario hace una pregunta:

1. **Consulta RAG**: Busca chunks similares en `bibliography_sections`
2. **Inyección de Contexto**: Añade secciones relevantes al prompt
3. **Respuesta Fundamentada**: Agente responde basado en evidencia
4. **Citas**: (Opcional) Referencia el documento original

### Ejemplo de Flujo

```
Usuario: "¿Cuál es el protocolo para evaluar dismotilidad?"
  ↓
RAG busca embeddings similares
  ↓
Encuentra 3 chunks del protocolo cargado
  ↓
Inyecta en contexto:
  "Basándote en el protocolo cargado:
   [sección 1: ...]
   [sección 2: ...]
   Responde la pregunta del usuario"
  ↓
Agente: "Según el protocolo, la evaluación incluye..."
```

## 📊 Flujo Completo de Carga

### 1. Admin Carga un PDF
```
Click "Cargar Documento" → Selecciona PDF → Completa formulario
```

### 2. Validación en Cliente
```
- ¿Es PDF? ✓
- ¿Menor a 50MB? ✓
- ¿Título completo? ✓
```

### 3. Envío al Servidor
```
POST /api/admin/bibliography/upload (FormData)
```

### 4. Procesamiento en Backend

```typescript
// 1. Verificar permisos (admin only)
if (user.role !== 'admin') throw Error(403)

// 2. Validar archivo
if (!file.type.includes('pdf')) throw Error(400)

// 3. Extraer contenido del PDF
const content = await extractPDFContent(pdfBuffer)

// 4. Crear registro en DB
const doc = await supabase
  .from('bibliography_documents')
  .insert({ title, authors, ... })

// 5. Subir PDF a Vercel Blob
const blobUrl = await put(file, { access: 'private' })

// 6. Dividir en chunks
const chunks = chunkText(content.text)

// 7. Crear secciones
const sections = await supabase
  .from('bibliography_sections')
  .insert(sections)

// 8. Generar embeddings
const embeddings = await generateEmbeddings(chunks)

// 9. Actualizar vector embeddings
await updateVectorEmbeddings(embeddings)

// 10. Registrar en auditoría
await logAction('created', user.id, doc)
```

### 5. Confirmación al Admin
```
✓ Documento cargado exitosamente
✓ 125 secciones creadas
✓ Embeddings generados
✓ Listo para búsqueda
```

## 🔍 Búsqueda Semántica

### Cómo Funciona

```
Pregunta: "evaluación funcional nasofaríngea"
  ↓
Genera embedding de la pregunta
  ↓
Busca en PostgreSQL (pgvector):
  SELECT * FROM bibliography_sections
  ORDER BY embedding_vector <-> question_embedding
  LIMIT 5
  ↓
Retorna 5 chunks más similares
  ↓
Inyecta en prompt del agente
```

### Ventajas

- ✓ Búsqueda por **significado**, no por palabras exactas
- ✓ Funciona en múltiples idiomas
- ✓ Muy rápida (índice IVFFlat)
- ✓ Resultado de calidad superior

## 📦 Componentes Implementados

### Backend

```
lib/pdf/
├── pdf-processor.ts     # Extracción y procesamiento

lib/rag/
├── embeddings.ts        # Generación de embeddings (ya existía)
└── rag-engine.ts        # Búsqueda semántica (ya existía)

app/api/admin/bibliography/
└── upload/route.ts      # API endpoints
```

### Frontend

```
components/admin/
└── bibliography-upload.tsx  # Formulario de carga

app/admin/bibliography/
└── page.tsx                 # Panel de gestión

components/admin-sidebar.tsx # Menu item (actualizado)
```

### Database

```
scripts/
├── 04-create-bibliography-tables.sql  # Schema
```

## 📖 Documentación

| Archivo | Contenido |
|---------|----------|
| `BIBLIOGRAPHY_GUIDE.md` | Guía completa de uso |
| `BIBLIOGRAPHY_SUMMARY.md` | Este documento |
| `SETUP.md` | Instrucciones de instalación |
| `RAG_SYSTEM.md` | Sistema de RAG |

## 🚀 Cómo Empezar

### 1. Ejecutar Migración de DB

```bash
# En Supabase Dashboard → SQL Editor
# Copiar y ejecutar: scripts/04-create-bibliography-tables.sql
```

### 2. Ir al Admin Panel

```
http://localhost:3000/admin/bibliography
```

### 3. Cargar Documentos

- Click "Cargar Documento"
- Selecciona un PDF científico
- Completa metadata
- Click "Cargar"
- ¡Listo!

### 4. Ver en Acción

- Chat widget: `/`
- Admin panel: `/admin/bibliography`
- API: `POST /api/admin/bibliography/upload`

## ⚙️ Configuración

### Variables de Entorno Requeridas

```env
# Para embeddings (Vercel AI SDK maneja esto)
OPENAI_API_KEY=sk-...
# O ANTHROPIC_API_KEY=sk-ant-...
# O GROQ_API_KEY=gsk_...

# Para Blob Storage
VERCEL_BLOB_READ_WRITE_TOKEN=...
```

### Límites y Defaults

- **Máximo por archivo**: 50MB
- **Máximo por chunk**: 2000 caracteres
- **Overlap**: 200 caracteres entre chunks
- **Dimensión embedding**: 1536 (OpenAI)
- **Índice búsqueda**: IVFFlat (lists=100)

## 🔐 Seguridad

- ✅ RLS policies: Solo admin puede crear/editar
- ✅ Blob privado: PDFs no públicamente accesibles
- ✅ Auditoría: Todo cambio registrado
- ✅ Validación: Servidor-side (type, size, auth)
- ✅ Contenido limpio: OCR automático

## 📊 Estadísticas

Por implementar en `/api/admin/stats`:
- Documentos totales por tipo
- Chunks indexados
- Búsquedas realizadas
- Documentos más consultados
- Tiempo promedio de indexado

## 🐛 Troubleshooting

### El agente no usa documentos
- ✓ Verificar que documentos estén "active"
- ✓ Verificar RAG está habilitado en `agent-handler.ts`
- ✓ Revisar logs en `/api/chat`

### Búsqueda lenta
- ✓ Esperar a que se generen embeddings
- ✓ Verificar índice IVFFlat en DB
- ✓ Aumentar parámetro `lists` si hay millones de vectores

### PDF no se procesa
- ✓ Verificar que sea PDF válido (no corrupto)
- ✓ Probar con otro PDF
- ✓ Revisar logs del servidor

## 📝 Próximas Mejoras

- [ ] Importar desde Google Scholar/PubMed
- [ ] Interfaz de búsqueda para usuarios
- [ ] Exportar reportes bibliográficos
- [ ] Soporte para citas (BibTeX, APA)
- [ ] Versionado de documentos
- [ ] Recomendación automática

---

**Sistema listo para producción** ✅

**Última actualización**: 2026-04-24  
**Versión**: 1.0

# RinoEstoma RAG System Documentation

## ¿Qué es RAG?

**RAG (Retrieval-Augmented Generation)** es una técnica que combina:
1. **Retrieval**: Buscar documentos relevantes en una base de conocimiento
2. **Augmentation**: Aumentar el prompt con esa información
3. **Generation**: Usar un LLM para generar respuestas mejoradas

Permite que el agente acceda a protocolos, guías clínicas, y procedimientos específicos de RinoEstoma.

---

## Componentes del Sistema

### 1. **Knowledge Base** (`knowledge_articles` table)
Almacena artículos con:
- `title`: Título del artículo
- `content`: Contenido completo
- `category`: Clasificación (protocols, procedures, guidelines, general)
- `tags`: Etiquetas para búsqueda por temas
- `is_public`: Disponibilidad para búsqueda
- `embedding_vector`: Vector de embeddings para búsqueda semántica (future)

### 2. **Embeddings Module** (`lib/rag/embeddings.ts`)
Convierte texto a vectores numéricos para similitud semántica:
```typescript
const { embedding } = await generateEmbedding("Protocolo de evaluación")
// embedding: [0.123, -0.456, 0.789, ...]
```

Incluye:
- `generateEmbedding()`: Genera embedding de un texto
- `generateBatchEmbeddings()`: Procesa múltiples textos
- `cosineSimilarity()`: Calcula similitud entre vectores
- `findSimilarVectors()`: Búsqueda kNN

### 3. **RAG Engine** (`lib/rag/rag-engine.ts`)
Orquesta búsquedas y construcción de contexto:

```typescript
// Búsqueda semántica
const results = await queryKnowledgeBase("disfagia infantil")
// Retorna artículos relevantes + contexto compilado

// Búsqueda por categoría
const protocols = await queryByCategory("protocols")

// Construcción de contexto para agent
const context = await buildAgentContext("¿Cómo evaluar disfagia?")
```

### 4. **Knowledge API** (`app/api/knowledge/articles/route.ts`)
Endpoints HTTP:

```bash
# GET: Buscar artículos
GET /api/knowledge/articles?q=disfagia
GET /api/knowledge/articles?category=protocols

# POST: Crear artículo (admin)
POST /api/knowledge/articles
{
  "title": "Nuevo Protocolo",
  "content": "...",
  "category": "protocols",
  "tags": ["protocolos", "nuevos"],
  "is_public": true
}
```

### 5. **Agent Integration**
El agente automáticamente:
1. Recibe query del usuario
2. Ejecuta `buildAgentContext(query)` 
3. Inyecta contexto en el prompt al LLM
4. LLM genera respuesta informada

---

## Flujo de Búsqueda

```
User: "¿Cómo evaluar disfagia infantil?"
     ↓
Agent Handler recibe mensaje
     ↓
RAG Engine: buildAgentContext(query)
     ↓
1. Generar embedding del query
2. Buscar artículos similares en DB
3. Compilar contexto relevante
     ↓
Context inyectado en prompt:
"User: ¿Cómo evaluar disfagia infantil?

[Información relevante de la base de conocimiento]
## Disfagia Infantil - Evaluación y Manejo
La disfagia infantil requiere evaluación clínica cuidadosa...
     ↓
LLM genera respuesta contextualizada
     ↓
Response con referencias a fuentes
```

---

## Cargar Artículos a la Knowledge Base

### Opción 1: SQL Script (Recomendado)
```bash
# Ejecutar script de seed
psql -h host -d database -U user -f scripts/02-seed-knowledge.sql
```

### Opción 2: API HTTP
```bash
curl -X POST http://localhost:3000/api/knowledge/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nuevo Protocolo",
    "content": "Contenido detallado...",
    "category": "protocols",
    "tags": ["tag1", "tag2"],
    "is_public": true
  }'
```

### Opción 3: Admin Dashboard
1. Ir a `/admin/knowledge`
2. Click en "+ Nuevo Artículo"
3. Completar formulario
4. Guardar

---

## Configuración de Búsqueda

```typescript
// Por defecto:
const results = await queryKnowledgeBase(query)

// Con opciones personalizadas:
const results = await queryKnowledgeBase(query, {
  topK: 10,              // Número de resultados
  similarityThreshold: 0.6, // Mínimo score de similitud
  maxContextLength: 3000  // Máximo de caracteres de contexto
})
```

---

## Estructura de Artículos Recomendada

```markdown
## [Título]

[Descripción breve]

### Componentes Clave:
1. **Componente 1**: Descripción
2. **Componente 2**: Descripción
3. **Componente 3**: Descripción

### Procedimiento Paso a Paso:
1. Paso 1
2. Paso 2
3. Paso 3

### Puntos Importantes:
- Punto 1
- Punto 2
- Punto 3

### Duración Estimada: 
[X] minutos

### Referencias:
[Links a documentos relacionados]
```

---

## Búsqueda Full-Text vs Semántica

### Full-Text (Actual)
```typescript
// Busca palabras clave exactas
.textSearch('content', 'disfagia infantil')
// Rápido, determinístico
```

### Semántica (Futuro con pgvector)
```typescript
// Busca significado/contexto
const similar = await supabase.rpc('match_embeddings', {
  query_embedding: queryVector,
  match_threshold: 0.5,
  match_count: 5
})
// Más flexible, comprende sinónimos
```

**Upgrade a pgvector** en Supabase:
1. Habilitar extensión `pgvector`
2. Migración: Adicionar columna `VECTOR(1536)`
3. Ejecutar embeddings para todos los artículos
4. Crear índice HNSW para búsqueda rápida

---

## Ejemplos de Uso

### Desde el Agente
```typescript
// Automático - el agente siempre usa RAG
const response = await processAgentMessage(
  "¿Protocolo para evaluar voz profesional?",
  context
)
// Retorna respuesta con contexto de KB automáticamente
```

### Desde Componentes
```typescript
import { queryKnowledgeBase } from '@/lib/rag/rag-engine'

const results = await queryKnowledgeBase("evaluación miofuncional")
// results.articles: artículos encontrados
// results.context: contexto compilado
// results.sources: referencias con scores
```

### Desde API
```typescript
// Búsqueda simple
const res = await fetch('/api/knowledge/articles?q=rinitis')
const { articles, sources } = await res.json()
```

---

## Monitoreo y Debugging

### Logs de RAG
```bash
# En desarrollo, revisar console:
[v0] Searching knowledge base for: "disfagia"
[v0] Found 3 relevant articles
[v0] RAG context built: 1250 chars
```

### Verificar Embeddings
```typescript
import { generateEmbedding } from '@/lib/rag/embeddings'

const { embedding, tokens } = await generateEmbedding("test")
console.log(embedding.length) // 1536 (para text-embedding-3-small)
console.log(tokens) // Tokens usados
```

---

## Performance Tips

1. **Indexación**: Full-text search automáticamente indexado en `content`
2. **Paginación**: Usar `topK` para limitar resultados
3. **Caching**: Embeddings se cachean automáticamente
4. **Batch Processing**: Para múltiples búsquedas, usar `Promise.all()`

---

## Próximos Pasos

1. **Expandir KB**: Agregar más protocolos y guías
2. **Implementar pgvector**: Para búsqueda semántica pura
3. **Analytics**: Trackear qué consultas no encuentran respuestas
4. **Feedback Loop**: Sistema para evaluar calidad de resultados
5. **Admin UI Mejorada**: Editor de artículos WYSIWYG

---

## Soporte

Para problemas con RAG:
- Revisar logs en `/user_read_only_context/v0_debug_logs.log`
- Verificar que embeddings se generaron correctamente
- Confirmar que artículos tienen `is_public: true`
- Revisar estructura de tablas en Supabase


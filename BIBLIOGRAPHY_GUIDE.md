# Guía de Carga de Bibliografía Científica - RinoEstoma Agent

## 📚 Descripción General

El sistema de carga de bibliografía permite a administradores cargar documentos PDF científicos y clínicos de RinoEstomatología. Estos documentos se procesan automáticamente y se integran en la base de conocimiento del agente para proporcionar respuestas contextualizadas basadas en evidencia.

## 🎯 Tipos de Documentos Soportados

1. **Protocolos Clínicos** (`protocol`)
   - Guías de procedimientos clínicos
   - Protocolos de evaluación funcional
   - Criterios de diagnóstico

2. **Artículos Científicos** (`scientific_article`)
   - Papers de investigación
   - Estudios publicados en revistas
   - Metaanálisis y revisiones sistemáticas

3. **Casos Clínicos** (`case_study`)
   - Reportes de casos
   - Estudios de pacientes
   - Ejemplos clínicos ilustrativos

4. **Guías Clínicas** (`clinical_guide`)
   - Guías de buenas prácticas
   - Estándares de tratamiento
   - Recomendaciones profesionales

5. **Otros** (`other`)
   - Documentos diversos
   - Material educativo
   - Recursos adicionales

## 📖 Cómo Cargar Documentos

### Paso 1: Acceder al Panel de Administración

1. Inicia sesión como administrador
2. Ve a `/admin/bibliography`
3. Click en botón "Cargar Documento"

### Paso 2: Completar el Formulario

#### Campos Requeridos:
- **Archivo PDF**: El documento científico (máx. 50MB)
- **Título**: Título del documento
- **Tipo de Documento**: Selecciona la categoría

#### Campos Opcionales:
- **Descripción/Resumen**: Resumen breve del contenido
- **Autores**: Nombres separados por comas
- **Fecha de Publicación**: Fecha ISO (YYYY-MM-DD)

### Paso 3: Procesar y Guardar

1. Click en "Cargar Documento"
2. El sistema procesará el PDF:
   - Extrae el texto automáticamente
   - Genera embeddings vectoriales
   - Indexa para búsqueda semántica
3. Recibirás confirmación cuando se complete

## ⚙️ Proceso de Procesamiento Automático

Cuando cargas un PDF, el sistema realiza automáticamente:

### 1. Extracción de Texto
```
PDF → OCR/Extractor → Texto limpio
```
- Extrae todo el texto del documento
- Limpia formato y espacios
- Preserva estructura de párrafos

### 2. Segmentación en Chunks
```
Texto completo → Dividir en secciones → Chunks (2000 chars c/u)
```
- Divide en fragmentos de ~2000 caracteres
- Mantiene solapamiento (overlap) para contexto
- Crea ~50-100 chunks por documento típico

### 3. Generación de Embeddings
```
Chunks → OpenAI Embeddings → Vectores (1536 dims)
```
- Convierte cada chunk a vector 1536-dimensional
- Almacena en PostgreSQL con extension pgvector
- Habilita búsqueda semántica inteligente

### 4. Indexación
```
Vectores → Índice IVFFlat → Búsqueda Rápida
```
- Crea índice para búsqueda O(1) en millones de vectores
- Almacena en tabla `bibliography_sections`
- Listo para búsqueda en tiempo real

## 🔍 Búsqueda Semántica

### En el Agente
El agente utiliza automáticamente los documentos cargados:

```
Usuario: "¿Cuál es el protocolo para evaluar la función nasofaríngea?"
↓
Sistema RAG busca en bibliografía
↓
Encuentra secciones relevantes con similitud vectorial
↓
Inyecta contexto en el prompt del agente
↓
Agente responde basado en evidencia
```

### En el Admin
1. Ve a `/admin/bibliography`
2. Usa filtros por tipo de documento
3. Busca por:
   - Título
   - Autores
   - Conceptos clave
   - Fecha de publicación

## 📋 Ejemplos de Documentos Recomendados

### Protocolos Clínicos
- Protocolos de evaluación funcional en RinoEstomatología
- Criterios de diagnóstico de dismotilidad nasofaríngea
- Protocolos de telemedicina en RinoEstomatología

### Artículos Científicos
- Estudios sobre función nasofaríngea
- Investigaciones en RinoEstomatología Pediátrica
- Papers sobre telemonitoreo clínico

### Casos Clínicos
- Casos de pacientes con dismotilidad
- Respuestas al tratamiento documentadas
- Evoluciones clínicas detalladas

## 🔐 Seguridad y Privacidad

### Control de Acceso
- Solo administradores pueden cargar documentos
- Los documentos pendientes de revisión no son visibles públicamente
- Row Level Security (RLS) en todas las tablas

### Almacenamiento
- PDFs se almacenan en Vercel Blob (private)
- URLs de blob son seguras y no directamente accesibles
- Auditoría completa de todas las cargas y cambios

### GDPR/Privacidad
- No se extrae información personal de pacientes
- Los documentos deben ser públicos/publicados
- Auditoría de acceso registrada

## 📊 Estadísticas y Monitoreo

El sistema registra:
- Número total de documentos
- Documentos por tipo
- Chunks indexados
- Embeddings generados
- Búsquedas realizadas (opcional)
- Cambios en documentos

Accesible en:
```
/api/admin/stats?section=bibliography
```

## 🐛 Solución de Problemas

### Error: "File must be a PDF"
- Verifica que el archivo sea PDF válido
- Asegúrate que no esté corrupto

### Error: "File size exceeds limit"
- El archivo es mayor a 50MB
- Divide el documento o comprime

### El agente no usa los documentos
1. Verifica que los documentos estén con status "active"
2. Asegúrate que el RAG está habilitado en agent-handler.ts
3. Revisa logs en `/api/chat` para debugging

### La búsqueda semántica es lenta
- Espera a que se completen todos los embeddings
- Verifica índices en PostgreSQL
- Contacta support si el problema persiste

## 📝 API Endpoints

### Cargar Documento
```
POST /api/admin/bibliography/upload
Content-Type: multipart/form-data

{
  "file": File (PDF),
  "title": string,
  "description": string,
  "documentType": "protocol" | "scientific_article" | "case_study" | "clinical_guide" | "other",
  "authors": "author1, author2",
  "publicationDate": "2024-04-24"
}

Response:
{
  "success": true,
  "document": {
    "id": "uuid",
    "title": "string",
    "pages": number,
    "sections": number,
    "blobUrl": "string"
  }
}
```

### Listar Documentos
```
GET /api/admin/bibliography/upload?type=protocol&limit=50&offset=0

Response:
{
  "documents": [ ... ],
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number,
    "hasMore": boolean
  }
}
```

## 🚀 Mejores Prácticas

1. **Metadatos Completos**
   - Siempre incluye autores si es posible
   - Proporciona fecha de publicación
   - Escribe un resumen en la descripción

2. **Nomenclatura Clara**
   - Usa títulos descriptivos
   - Incluye versión/año si es relevante
   - Estandariza formatos de títulos

3. **Organización**
   - Agrupa documentos relacionados
   - Mantén protocolos actualizados
   - Archiva documentos obsoletos

4. **Validación**
   - Verifica que PDFs tengan OCR si es necesario
   - Comprueba que la extracción sea legible
   - Revisa que los embeddings se hayan generado

## 📞 Soporte

Para reportar problemas o sugerencias:
1. Revisa la sección de "Solución de Problemas"
2. Consulta los logs del servidor
3. Contacta al equipo de soporte con detalles del error

---

**Versión**: 1.0  
**Última actualización**: 2026-04-24  
**Estado**: Producción

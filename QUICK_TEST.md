# PRUEBA RÁPIDA DEL SISTEMA DE BIBLIOGRAFÍA

## 🚀 Pasos para Cargar tu Primer PDF

### Paso 1: Verificar Servidor
```bash
# El servidor debe estar corriendo en:
http://localhost:3000
```

### Paso 2: Acceder al Panel Admin
```
URL: http://localhost:3000/admin/bibliography
```

**Nota:** Si te redirecciona a login, primero ejecuta:
```bash
# 1. Ve a http://localhost:3000/auth/sign-up
# 2. Crea una cuenta (cualquier email de prueba)
# 3. Usa esa cuenta para ingresar a /admin/bibliography
```

### Paso 3: Cargar tu PDF

El formulario pide:

| Campo | Ejemplo |
|-------|---------|
| **Archivo PDF** | protocolo-rinoestomatologia.pdf |
| **Título** | Protocolo de Evaluación Funcional en RinoEstomatología |
| **Descripción** | Guía clínica completa con procedimientos diagnósticos y terapéuticos |
| **Tipo** | Protocolo Clínico (o Scientific Article / Case Study / Clinical Guide / Other) |
| **Autores** | Dr. Juan Pérez, Dra. María García |
| **Fecha** | 2024-01-15 |

### Paso 4: Procesamiento Automático

El sistema automáticamente:
1. ✓ Extrae el texto del PDF
2. ✓ Divide en fragmentos (chunks)
3. ✓ Genera embeddings vectoriales
4. ✓ Indexa en la base de datos
5. ✓ Registra en auditoría

Tiempo aproximado: **2-5 segundos**

---

## 📚 Si No Tienes PDF Real...

### Opción A: Crear PDF de Prueba Simple
```bash
# Guardar este contenido en un archivo .pdf
# (Usa Google Docs → Exportar como PDF)

PROTOCOLO CLÍNICO DE EVALUACIÓN FUNCIONAL EN RINOESTOMATOLOGÍA
Versión 2.0 - 2024

CAPÍTULO 1: EVALUACIÓN INICIAL
- Historia clínica completa
- Evaluación miofuncional
- Análisis intraoral

CAPÍTULO 2: TECNOLOGÍAS DE MONITOREO
Sistema RinoMONITOR para telemonitoreo inteligente:
- Sensores de presión nasofaríngea
- Análisis de imagen endoscópica
- Evaluación de patrones de flujo aéreo

CAPÍTULO 3: DIAGNÓSTICOS COMUNES
3.1 Respiración Bucal
- Definición y hallazgos
- Consecuencias sistémicas

3.2 Disfunción Velofaríngea
- Evaluación clínica
- Métodos de diagnóstico

CAPÍTULO 4: PLANES DE TRATAMIENTO
- Intervención miofuncional
- Tratamiento combinado
- Seguimiento y evolución
```

### Opción B: Descargar Ejemplos Reales
Busca en Google Académico:
- "Rhinoestomatology protocols"
- "Orofacial myofunctional disorders"
- "Velopharyngeal insufficiency evaluation"

Y descarga PDFs de ResearchGate, PubMed Central, etc.

---

## ✅ Verificar que Funcionó

Después de cargar:

1. **En el Panel Admin:**
   - Aparece el documento en la tabla
   - Estado: "Procesado"
   - Puedes hacer búsquedas por título/descripción

2. **En el Chat Widget:**
   - Abre http://localhost:3000
   - Click botón chat (abajo a la derecha)
   - Prueba preguntar sobre contenido del PDF
   - Ej: "¿Cuál es el protocolo de evaluación?"

3. **En Base de Datos:**
   - Tabla: `bibliography_documents`
   - Tabla: `bibliography_sections` (chunks + embeddings)
   - Visualiza en Supabase Dashboard

---

## 🔍 Búsqueda Semántica en Acción

Ejemplo de consulta inteligente:

**Pregunta del Usuario:**
```
¿Cuál es el procedimiento para evaluar la función nasofaríngea?
```

**Qué hace el sistema:**
1. Genera embedding de la pregunta
2. Busca en `bibliography_sections` (índice vectorial)
3. Encuentra 3-5 fragmentos más similares
4. Inyecta en contexto del agente
5. El agente responde basado en protocolo

**Respuesta del Agente:**
```
Según el Protocolo de Evaluación Funcional en RinoEstomatología:

La evaluación nasofaríngea incluye:
1. [Extracto del protocolo cargado]
2. [Extracto del protocolo cargado]
3. [Extracto del protocolo cargado]

Recomendamos monitoreo con RinoMONITOR...
```

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| "File is required" | Selecciona un archivo PDF primero |
| "Processing failed" | Verifica que el PDF no esté corrupto |
| "Upload size exceeded" | Máximo 50MB por archivo |
| No aparece en búsqueda | Espera 5 segundos después de cargar |
| Error de autenticación | Ejecuta migración de auth primero |

---

## 📝 Próximos Pasos Después del Testing

1. **Cargar más documentos:**
   - 5-10 protocolos clínicos
   - 10-20 artículos científicos
   - Casos de estudio relevantes

2. **Probar con el agente:**
   - Via chat widget en localhost
   - Via WhatsApp (cuando esté configurado)
   - Validar que las respuestas usan bibliografía

3. **Ir a Producción:**
   - Ejecutar `git push origin main`
   - Vercel auto-deploya
   - Configurar environment vars
   - Cargar documentos en producción

---

## 🎯 Resumen Rápido

**Para cargar tu primer PDF:**
1. Abre http://localhost:3000/admin/bibliography
2. Click "Cargar Documento"
3. Selecciona tu PDF + completa formulario
4. Click "Cargar"
5. Listo! Sistema procesa automáticamente

**Para probar que funciona:**
1. Abre chat en http://localhost:3000
2. Pregunta sobre contenido del PDF
3. Verifica que el agente responde con información del protocolo cargado

¡Eso es todo! 🎉

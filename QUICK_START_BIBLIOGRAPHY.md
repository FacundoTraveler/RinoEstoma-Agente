# Guía Rápida - Cargar Bibliografía Científica en RinoEstoma Agent

## 🚀 5 Pasos para Cargar Documentos Científicos

### Paso 1: Acceder al Panel Admin
```
1. Inicia sesión como ADMIN en http://localhost:3000/auth/sign-in
2. Ve a http://localhost:3000/admin/bibliography
```

### Paso 2: Click en "Cargar Documento"
```
Verás un formulario con:
- Selector de archivo PDF
- Campo de título
- Campo de descripción
- Tipo de documento (dropdown)
- Autores (opcional)
- Fecha de publicación (opcional)
```

### Paso 3: Completa el Formulario

**Ejemplo para Protocolo Clínico:**
```
Archivo PDF:        protocolos-evaluacion.pdf
Título:             Protocolos de Evaluación Funcional en RinoEstomatología
Descripción:        Guía completa de procedimientos de evaluación nasofaríngea
Tipo:               Protocolo Clínico
Autores:            Dr. Juan Pérez, Dra. María García
Fecha Publicación:  2024-01-15
```

**Ejemplo para Artículo Científico:**
```
Archivo PDF:        estudio-dismotilidad.pdf
Título:             Dismotilidad Nasofaríngea: Un Análisis Longitudinal
Descripción:        Estudio de 150 pacientes seguidos por 2 años
Tipo:               Artículo Científico
Autores:            Dr. Carlos López, Dr. Roberto Fernández, Dra. Ana Martínez
Fecha Publicación:  2023-06-30
```

### Paso 4: Cargar Archivo
```
Click en botón "Cargar Documento"
Espera a que veas: ✓ Documento cargado exitosamente
```

### Paso 5: Verificar en Panel
```
El documento aparece en la lista:
- Muestra título, tipo, autores
- Número de páginas
- Conceptos clave extraídos
- Fecha de carga
```

---

## 🎯 Tipos de Documentos - Qué Cargar

### 1️⃣ Protocolo Clínico
**Qué incluir:**
- Procedimientos paso a paso
- Criterios diagnósticos
- Protocolos de evaluación
- Estándares de práctica

**Ejemplos:**
- Protocolo de evaluación funcional
- Protocolo de telemedicina
- Criterios de derivación

### 2️⃣ Artículo Científico
**Qué incluir:**
- Papers de investigación
- Estudios publicados
- Metaanálisis
- Revisiones sistemáticas

**Ejemplos:**
- "Dismotilidad nasofaríngea en población pediátrica"
- "Efectividad de telemedicina en RinoEstomatología"
- "Análisis de patrones respiratorios"

### 3️⃣ Caso Clínico
**Qué incluir:**
- Reportes de casos reales
- Evolución clínica
- Resultados de tratamiento
- Lecciones aprendidas

**Ejemplos:**
- Caso de dismotilidad severa tratada con éxito
- Evolución de paciente con síndrome respiratorio
- Respuesta a tratamiento innovador

### 4️⃣ Guía Clínica
**Qué incluir:**
- Recomendaciones profesionales
- Buenas prácticas
- Algoritmos de decisión
- Estándares de atención

**Ejemplos:**
- Guía de manejo de apnea del sueño
- Guía de evaluación miofuncional
- Recomendaciones SMMR (o similar)

### 5️⃣ Otro
**Para documentos que no encajen en categorías anteriores**

---

## ✨ Qué Sucede Automáticamente

Cuando cargas un documento:

### 🔄 Procesamiento Automático (2-5 segundos)
```
1. ✓ Extrae texto del PDF
2. ✓ Divide en fragmentos (~125 chunks típicamente)
3. ✓ Genera vectores de búsqueda semántica
4. ✓ Indexa en base de datos
5. ✓ Registra en auditoría
```

### 📚 Disponible para el Agente
```
Ahora el agente puede:
- Buscar información en los documentos
- Responder preguntas con evidencia
- Citar el documento en respuestas
- Mantener contexto clínico
```

### 🔍 Búsqueda Semántica Activa
```
Usuario pregunta:  "¿Cómo se evalúa la función nasofaríngea?"
Sistema busca:     En todos los documentos cargados
Encuentra:         Secciones relevantes del protocolo
Agente responde:   Basado en el protocolo cargado
```

---

## 📋 Checklist de Carga

Antes de cargar cada documento:

- [ ] PDF es válido y legible
- [ ] Título es claro y descriptivo
- [ ] Incluyo autores si es disponible
- [ ] Descripción es informativa
- [ ] Tipo de documento es correcto
- [ ] Archivo no excede 50MB
- [ ] Tengo acceso como ADMIN

Después de cargar:

- [ ] Veo el documento en la lista
- [ ] Muestra correctamente metadatos
- [ ] Conceptos clave son relevantes
- [ ] El agente puede usarlo (prueba con /chat)

---

## 🎓 Ejemplo: Protocolo de RinoEstomatología

### Documento a Cargar
**Archivo:** `protocolo-evaluacion-funcional-v2.pdf`

### Formulario Completado
```
Título:
"Protocolo de Evaluación Funcional de Cavidad Nasal y Faringe 
en Pacientes Pediátricos - RinoEstomatología v2.0"

Descripción:
"Protocolo actualizado 2024 de la Sociedad Médica de 
RinoEstomatología. Incluye procedimientos de evaluación 
funcional, criterios diagnósticos, protocolos de telemedicina 
y algoritmos de decisión clínica. Dirigido a fonoaudiólogos, 
otorrinolaringólogos y profesionales afines."

Tipo: Protocolo Clínico

Autores: 
"Dr. Juan Carlos Rodríguez, Dra. María Alejandra González, 
Dra. Patricia Martínez, Lic. Francisco López"

Fecha Publicación: 2024-01-20
```

### Lo que Pasa Internamente
```
1. Se extrae todo el texto del PDF
2. Se divide en 89 secciones
3. Se generan 89 embeddings vectoriales
4. Se indexan en PostgreSQL
5. Está listo para búsqueda inmediata

Total: ~15MB de contenido procesado en 3 segundos
```

### Cómo lo Usa el Agente
```
Usuario: "¿Cuáles son los criterios para diagnosticar 
dismotilidad nasofaríngea?"

Sistema busca: Chunked relevante en el protocolo

Agente responde: "Según el Protocolo de Evaluación 
Funcional de RinoEstomatología, los criterios incluyen:

1. [Extrae del protocolo cargado]
2. [Extrae del protocolo cargado]
3. [Extrae del protocolo cargado]

Ref: Protocolo de Evaluación Funcional v2.0 (2024)"
```

---

## 💡 Tips y Mejores Prácticas

### ✅ DO (Haz)
- ✓ Carga documentos que sean públicos/publicados
- ✓ Incluye metadatos completos
- ✓ Usa títulos claros y descriptivos
- ✓ Agrupa documentos relacionados
- ✓ Actualiza documentos obsoletos
- ✓ Verifica que PDFs tengan OCR

### ❌ DON'T (No Hagas)
- ✗ No cargues documentos privados
- ✗ No incluyas datos personales de pacientes
- ✗ No cargues PDFs con imágenes solamente (sin OCR)
- ✗ No cargues documentos no relacionados a RinoEstomatología
- ✗ No duplicar documentos

---

## 🔗 URLs Importantes

| Página | URL |
|--------|-----|
| Panel Bibliografía | `/admin/bibliography` |
| Dashboard Admin | `/admin/dashboard` |
| Chat con Agente | `/` (botón flotante) |
| API Upload | `POST /api/admin/bibliography/upload` |

---

## 📞 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| No puedo acceder | ¿Eres ADMIN? Inicia sesión correctamente |
| PDF no se carga | ¿Es PDF válido? ¿Menor a 50MB? |
| El documento no aparece | Recarga la página o espera 5 segundos |
| El agente no usa el documento | Verifica que esté "active" en el panel |

---

## 🎉 ¡Listo!

Tu documentación científica está ahora:
- ✅ Cargada en la base de datos
- ✅ Procesada y indexada
- ✅ Disponible para búsqueda semántica
- ✅ Integrada con el agente
- ✅ Accesible en todo el sistema

**Próximo paso:** Prueba hacer una pregunta en el chat widget y verifica que el agente usa tu documentación. 🚀

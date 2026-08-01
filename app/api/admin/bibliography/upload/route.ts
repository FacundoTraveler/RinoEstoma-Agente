h39
  import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { supabase } from '@/lib/supabase-client'
import { extractTextFromPDF, cleanExtractedText, chunkText } from '@/lib/pdf/pdf-processor'
import { generateBatchEmbeddings } from '@/lib/rag/embeddings'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * POST /api/admin/bibliography/upload
 * Carga un PDF científico y lo procesa para la knowledge base
 * 
 * Body: FormData con:
 * - file: File (PDF)
 * - title: string
 * - description: string
 * - documentType: 'protocol' | 'scientific_article' | 'case_study' | 'clinical_guide' | 'other'
 * - authors: string (comma-separated)
 * - publicationDate: string (ISO date, optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Validar usuario es admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar rol de usuario
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!userData || userData.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can upload bibliographic documents' },
        { status: 403 }
      )
    }

    // Parsear FormData
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const documentType = formData.get('documentType') as string
    const authorsStr = formData.get('authors') as string
    const publicationDate = formData.get('publicationDate') as string

    // Validaciones
    if (!file || !title || !documentType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, title, documentType' },
        { status: 400 }
      )
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    console.log('[v0] Processing PDF upload:', { title, documentType, fileSize: file.size })

    // Convertir a Buffer
    const pdfBuffer = Buffer.from(await file.arrayBuffer())

    // Extraer contenido del PDF
    const extractedContent = await extractTextFromPDF(pdfBuffer)
    console.log('[v0] PDF content extracted:', {
      pages: extractedContent.metadata.pages,
      sections: extractedContent.sections.length,
      textLength: extractedContent.text.length,
    })

    // Limpiar texto
    const cleanedText = cleanExtractedText(extractedContent.text)

    // Preparar datos del documento
    const authors = authorsStr
      ?.split(',')
      .map((a) => a.trim())
      .filter((a) => a) || []

    // Subir PDF a Vercel Blob
    const blobFileName = `bibliography/${Date.now()}-${file.name}`
    const blobResponse = await put(blobFileName, pdfBuffer, {
      access: 'private',
      contentType: 'application/pdf',
    })

    console.log('[v0] PDF uploaded to Blob:', blobResponse.url)

    // Extraer conceptos clave del título y descripción
    const keyConceptsStr = `${title} ${description || ''}`
    const keyConceptsArray = keyConceptsStr
      .split(/[\s,]+/)
      .filter((word) => word.length > 4)
      .slice(0, 20)

    // Crear documento en base de datos
    const { data: docData, error: docError } = await supabase
      .from('bibliography_documents')
      .insert({
        title,
        description,
        document_type: documentType,
        authors,
        publication_date: publicationDate || null,
        blob_url: blobResponse.url,
        file_size_bytes: file.size,
        mime_type: file.type,
        pages_count: extractedContent.metadata.pages,
        extracted_text: cleanedText,
        key_concepts: keyConceptsArray,
        abstract: description || extractedContent.text.substring(0, 500),
        created_by: user.id,
        status: 'active',
      })
      .select()
      .single()

    if (docError) {
      console.error('[v0] Error creating document record:', docError)
      throw new Error(`Failed to create document record: ${docError.message}`)
    }

    console.log('[v0] Document created:', docData.id)

    // Dividir en chunks y crear secciones
    const chunks = chunkText(cleanedText)
    const sections = []

    for (let i = 0; i < chunks.length; i++) {
      sections.push({
        document_id: docData.id,
        page_number: Math.floor(i / 3) + 1, // Aproximado: 3 chunks por página
        section_number: i + 1,
        content: chunks[i],
      })
    }

    // Insertar secciones
    const { error: sectionsError } = await supabase
      .from('bibliography_sections')
      .insert(sections)

    if (sectionsError) {
      console.error('[v0] Error creating sections:', sectionsError)
      throw new Error(`Failed to create sections: ${sectionsError.message}`)
    }

    console.log('[v0] Sections created:', sections.length)

    // Generar embeddings para cada sección
    try {
      const embeddingsResults = await generateBatchEmbeddings(
        chunks.map((chunk) => `${title}\n\n${chunk}`)
      )

      if (embeddingsResults && Array.isArray(embeddingsResults)) {
        // Actualizar secciones con embeddings
        for (let i = 0; i < sections.length && i < embeddingsResults.length; i++) {
          await supabase
            .from('bibliography_sections')
            .update({ embedding_vector: embeddingsResults[i].embedding })
            .eq('section_number', i + 1)
            .eq('document_id', docData.id)
        }
        console.log('[v0] Embeddings generated and saved')
      }
    } catch (embeddingError) {
      console.warn('[v0] Warning: Could not generate embeddings:', embeddingError)
      // No fallar si no hay embeddings, el documento se creó correctamente
    }

    // Registrar en audit log
    await supabase.from('bibliography_audit_log').insert({
      document_id: docData.id,
      action: 'created',
      changed_by: user.id,
      new_values: docData,
    })

    console.log('[v0] Bibliography upload completed successfully')

    return NextResponse.json({
      success: true,
      document: {
        id: docData.id,
        title: docData.title,
        pages: docData.pages_count,
        sections: sections.length,
        blobUrl: docData.blob_url,
      },
    })
  } catch (error) {
    console.error('[v0] Bibliography upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/bibliography/upload
 * Lista documentos bibliográficos
 */
export async function GET(request: NextRequest) {
  try {
    // Validar usuario es admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!userData || userData.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can view documents' },
        { status: 403 }
      )
    }

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams
    const documentType = searchParams.get('type')
    const status = searchParams.get('status') || 'active'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir query
    let query = supabase
      .from('bibliography_documents')
      .select(
        `
        id, title, description, document_type, authors,
        publication_date, pages_count, created_at, updated_at,
        status, created_by, key_concepts
      `,
        { count: 'exact' }
      )
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (documentType) {
      query = query.eq('document_type', documentType)
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      documents: data,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      },
    })
  } catch (error) {
    console.error('[v0] Error listing documents:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list documents' },
      { status: 500 }
    )
  }
}

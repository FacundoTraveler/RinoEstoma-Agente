import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { generateEmbedding } from '@/lib/rag/embeddings'

export const runtime = 'nodejs'
export const maxDuration = 60

const CHUNK_SIZE = 1500
const CHUNK_OVERLAP = 150

function splitIntoChunks(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  const chunks: string[] = []
  let start = 0
  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length)
    const chunk = clean.slice(start, end).trim()
    if (chunk.length > 50) chunks.push(chunk)
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }
  return chunks
}

async function insertChunkToKB(params: {
  title: string
  content: string
  category: string
  tags: string[]
  metadata: Record<string, unknown>
}) {
  let embedding: number[] | undefined
  try {
    const result = await generateEmbedding(params.title + ' ' + params.content)
    embedding = result.embedding
  } catch (_) {}

  const { data, error } = await supabase
    .from('knowledge_articles')
    .insert([{ ...params, is_public: true, ...(embedding ? { embedding_vector: embedding } : {}) }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const customTitle = (formData.get('title') as string) || ''
    const category = (formData.get('category') as string) || 'pdf'
    const tagsRaw = (formData.get('tags') as string) || ''
    const extraTags = tagsRaw
      ? tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean)
      : []

    if (!file) return NextResponse.json({ error: 'No se subio ningun archivo' }, { status: 400 })
    if (!file.name.toLowerCase().endsWith('.pdf'))
      return NextResponse.json({ error: 'El archivo debe ser un PDF' }, { status: 400 })
    if (file.size > 15 * 1024 * 1024)
      return NextResponse.json({ error: 'El PDF no puede superar 15MB' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const pdfParse = (await import('pdf-parse')).default
    const pdfData = await pdfParse(buffer)
    const fullText = pdfData.text

    if (!fullText || fullText.trim().length < 20) {
      return NextResponse.json({
        error: 'No se pudo extraer texto. Asegurate de que el PDF contenga texto seleccionable.',
      }, { status: 400 })
    }

    const pageCount = pdfData.numpages
    const baseTitle = customTitle || file.name.replace(/\.pdf$/i, '')
    const baseName = file.name.replace(/\.pdf$/i, '').toLowerCase().replace(/\s+/g, '-')
    const allTags = ['pdf', baseName, ...extraTags]
    const chunks = splitIntoChunks(fullText)

    let insertedCount = 0
    for (let i = 0; i < chunks.length; i++) {
      try {
        const chunkTitle =
          chunks.length === 1
            ? baseTitle
            : baseTitle + ' — parte ' + (i + 1) + ' de ' + chunks.length
        await insertChunkToKB({
          title: chunkTitle,
          content: chunks[i],
          category,
          tags: allTags,
          metadata: {
            source_pdf: file.name,
            chunk_index: i,
            total_chunks: chunks.length,
            page_count: pageCount,
          },
        })
        insertedCount++
      } catch (_) {}
    }

    if (insertedCount === 0)
      return NextResponse.json(
        { error: 'No se pudo insertar el contenido en la base de conocimiento.' },
        { status: 500 }
      )

    return NextResponse.json({
      success: true,
      filename: file.name,
      pageCount,
      chunksCreated: insertedCount,
      totalChunks: chunks.length,
    })
  } catch (error) {
    console.error('[v0] PDF upload error:', error)
    return NextResponse.json({ error: 'Error al procesar el PDF' }, { status: 500 })
  }
}

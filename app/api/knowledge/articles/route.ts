import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { insertArticle, queryKnowledgeBase } from '@/lib/rag/rag-engine'
import { z } from 'zod'

const articleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
})

// GET: listar todos los articulos, o buscar por query/categoria
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const sourcePdf = searchParams.get('source_pdf')

    // Sin filtros: devolver todos los articulos ordenados por fecha
    if (!query && !category && !sourcePdf) {
      const { data: articles, error } = await supabase
        .from('knowledge_articles')
        .select('id, title, content, category, tags, is_public, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return NextResponse.json({ articles: articles || [] })
    }

    // Busqueda por source_pdf (listar chunks de un PDF especifico)
    if (sourcePdf && !query) {
      const { data: articles, error } = await supabase
        .from('knowledge_articles')
        .select('id, title, content, category, tags, is_public, metadata, created_at')
        .contains('metadata', { source_pdf: sourcePdf })
        .order('created_at', { ascending: false })
      if (error) throw error
      return NextResponse.json({ articles: articles || [] })
    }

    // Busqueda semantica por query
    if (query) {
      const ragResult = await queryKnowledgeBase(query, { topK: 10 })
      return NextResponse.json({ articles: ragResult.articles, sources: ragResult.sources })
    }

    // Busqueda por categoria
    const { data: articles, error } = await supabase
      .from('knowledge_articles')
      .select('id, title, content, category, tags, is_public, metadata, created_at')
      .eq('category', category!)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return NextResponse.json({ articles: articles || [] })
  } catch (error) {
    console.error('[v0] Error in GET /api/knowledge/articles:', error)
    return NextResponse.json({ error: 'Failed to search knowledge base' }, { status: 500 })
  }
}

// DELETE: eliminar articulo por id
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })
    const { error } = await supabase.from('knowledge_articles').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting article:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}

// POST: crear articulo manualmente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = articleSchema.parse(body)
    const article = await insertArticle(validatedData)
    if (!article) return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in POST /api/knowledge/articles:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}

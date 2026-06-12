import { NextRequest, NextResponse } from 'next/server'
import { insertArticle, queryKnowledgeBase } from '@/lib/rag/rag-engine'
import { z } from 'zod'

/**
 * Knowledge Base API
 * GET: Buscar artículos
 * POST: Crear nuevos artículos (requiere autenticación)
 */

const articleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
})

// GET: Buscar artículos por query
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const category = searchParams.get('category')

    if (!query && !category) {
      return NextResponse.json(
        { error: 'Query or category parameter required' },
        { status: 400 }
      )
    }

    let results

    if (query) {
      const ragResult = await queryKnowledgeBase(query, {
        topK: 10,
      })
      results = {
        articles: ragResult.articles,
        sources: ragResult.sources,
      }
    } else {
      // Búsqueda por categoría
      const { data: articles, error } = await (
        await import('@/lib/supabase-client')
      ).supabase
        .from('knowledge_articles')
        .select('*')
        .eq('category', category)
        .eq('is_public', true)
        .limit(20)

      if (error) throw error

      results = {
        articles,
        sources: [],
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('[v0] Error in GET /api/knowledge/articles:', error)
    return NextResponse.json(
      { error: 'Failed to search knowledge base' },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo artículo
export async function POST(request: NextRequest) {
  try {
    // TODO: Agregar validación de autenticación (admin only)
    // if (!user || user.user_type !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()

    // Validar schema
    const validatedData = articleSchema.parse(body)

    // Insertar artículo
    const article = await insertArticle(validatedData)

    if (!article) {
      return NextResponse.json(
        { error: 'Failed to create article' },
        { status: 500 }
      )
    }

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in POST /api/knowledge/articles:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}

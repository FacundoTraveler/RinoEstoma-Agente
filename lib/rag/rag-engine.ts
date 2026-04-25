import { supabase } from '@/lib/supabase-client'
import { generateEmbedding } from './embeddings'
import { KnowledgeArticle } from '@/lib/types'

/**
 * RAG Engine - Retrieval Augmented Generation
 * Busca artículos relevantes de la base de conocimiento para contextualizar respuestas del agente
 */

export interface RAGResult {
  articles: KnowledgeArticle[]
  context: string
  sources: Array<{ id: string; title: string; score: number }>
}

export interface RAGConfig {
  topK?: number
  similarityThreshold?: number
  maxContextLength?: number
}

const DEFAULT_CONFIG: RAGConfig = {
  topK: 5,
  similarityThreshold: 0.5,
  maxContextLength: 3000,
}

/**
 * Busca artículos relevantes por query semántica
 */
export async function queryKnowledgeBase(
  query: string,
  config: RAGConfig = {}
): Promise<RAGResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  try {
    console.log(`[v0] Searching knowledge base for: "${query}"`)

    // 1. Generar embedding del query
    const { embedding: queryEmbedding } = await generateEmbedding(query)

    // 2. Buscar artículos similares usando búsqueda de similitud
    // Nota: Para producción, usar pgvector con Supabase
    // Por ahora, usar búsqueda de texto simple
    const { data: articles, error } = await supabase
      .from('knowledge_articles')
      .select('id, title, content, category, tags, is_public, metadata')
      .eq('is_public', true)
      .textSearch('content', query) // búsqueda full-text
      .limit(finalConfig.topK!)

    if (error) {
      console.error('[v0] Error querying knowledge base:', error)
      throw error
    }

    if (!articles || articles.length === 0) {
      console.log('[v0] No articles found for query')
      return {
        articles: [],
        context: '',
        sources: [],
      }
    }

    // 3. Compilar contexto
    let context = ''
    const sources: Array<{ id: string; title: string; score: number }> = []

    for (const article of articles) {
      const sourceEntry = {
        id: article.id,
        title: article.title,
        score: 0.8, // Placeholder score
      }

      sources.push(sourceEntry)

      // Agregar contenido al contexto hasta alcanzar limite
      const articleText = `## ${article.title}\n${article.content}\n\n`

      if ((context + articleText).length <= finalConfig.maxContextLength!) {
        context += articleText
      }
    }

    console.log(`[v0] Found ${articles.length} relevant articles`)

    return {
      articles: articles as KnowledgeArticle[],
      context,
      sources,
    }
  } catch (error) {
    console.error('[v0] RAG engine error:', error)
    throw error
  }
}

/**
 * Busca por categoría específica
 */
export async function queryByCategory(
  category: string,
  limit: number = 10
): Promise<KnowledgeArticle[]> {
  try {
    const { data: articles, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('category', category)
      .eq('is_public', true)
      .limit(limit)

    if (error) throw error

    return (articles as KnowledgeArticle[]) || []
  } catch (error) {
    console.error('[v0] Error querying by category:', error)
    return []
  }
}

/**
 * Obtiene un artículo por ID
 */
export async function getArticleById(id: string): Promise<KnowledgeArticle | null> {
  try {
    const { data: article, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single()

    if (error) {
      console.error('[v0] Error fetching article:', error)
      return null
    }

    return article as KnowledgeArticle
  } catch (error) {
    console.error('[v0] Error getting article:', error)
    return null
  }
}

/**
 * Busca artículos por tags
 */
export async function queryByTags(
  tags: string[],
  limit: number = 10
): Promise<KnowledgeArticle[]> {
  try {
    // Nota: Esto requiere soporte para arrays en Supabase
    // Alternativa: usar full-text search
    const { data: articles, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('is_public', true)
      .limit(limit)

    if (error) throw error

    // Filtrar por tags en memoria
    const filtered = (articles as KnowledgeArticle[]).filter((article) =>
      article.tags?.some((tag) => tags.includes(tag))
    )

    return filtered
  } catch (error) {
    console.error('[v0] Error querying by tags:', error)
    return []
  }
}

/**
 * Obtiene todas las categorías disponibles
 */
export async function getAvailableCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('category')
      .eq('is_public', true)
      .distinct()

    if (error) throw error

    const categories = Array.from(
      new Set((data as any[]).map((row) => row.category).filter(Boolean))
    )

    return categories as string[]
  } catch (error) {
    console.error('[v0] Error getting categories:', error)
    return []
  }
}

/**
 * Inserta un nuevo artículo en la knowledge base
 * (Requiere autenticación de administrador)
 */
export async function insertArticle(
  article: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at'>
): Promise<KnowledgeArticle | null> {
  try {
    // Generar embedding para el artículo
    const { embedding } = await generateEmbedding(
      `${article.title} ${article.content}`
    )

    const { data: inserted, error } = await supabase
      .from('knowledge_articles')
      .insert([
        {
          ...article,
          embedding_vector: embedding,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return inserted as KnowledgeArticle
  } catch (error) {
    console.error('[v0] Error inserting article:', error)
    return null
  }
}

/**
 * Actualiza un artículo existente
 */
export async function updateArticle(
  id: string,
  updates: Partial<KnowledgeArticle>
): Promise<KnowledgeArticle | null> {
  try {
    const { data: updated, error } = await supabase
      .from('knowledge_articles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return updated as KnowledgeArticle
  } catch (error) {
    console.error('[v0] Error updating article:', error)
    return null
  }
}

/**
 * Elimina un artículo
 */
export async function deleteArticle(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('knowledge_articles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return true
  } catch (error) {
    console.error('[v0] Error deleting article:', error)
    return false
  }
}

/**
 * Contexto para el agente: proporciona información relevante como contexto
 */
export async function buildAgentContext(query: string): Promise<string> {
  try {
    const ragResult = await queryKnowledgeBase(query, {
      topK: 3,
      maxContextLength: 2000,
    })

    if (!ragResult.context) {
      return 'No relevant information found in knowledge base.'
    }

    return `
Información relevante de la base de conocimiento de RinoEstoma:

${ragResult.context}

Fuentes:
${ragResult.sources.map((s) => `- ${s.title} (relevancia: ${(s.score * 100).toFixed(0)}%)`).join('\n')}
`.trim()
  } catch (error) {
    console.error('[v0] Error building agent context:', error)
    return ''
  }
}

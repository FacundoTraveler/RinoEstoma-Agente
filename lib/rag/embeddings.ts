import { embed, EmbeddingModel } from 'ai'

/**
 * Embeddings Management for RinoEstoma Knowledge Base
 * Handles text-to-vector conversion for semantic search
 */

// Configurar modelo de embeddings (usando Vercel AI Gateway)
const EMBEDDING_MODEL: EmbeddingModel = 'openai/text-embedding-3-small'

export interface EmbeddingResult {
  text: string
  embedding: number[]
  tokens: number
}

/**
 * Genera embedding para un texto
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    const { embedding, usage } = await embed({
      model: EMBEDDING_MODEL,
      value: text,
    })

    return {
      text,
      embedding,
      tokens: usage?.tokens || 0,
    }
  } catch (error) {
    console.error('[v0] Error generating embedding:', error)
    throw error
  }
}

/**
 * Genera embeddings para múltiples textos
 */
export async function generateBatchEmbeddings(
  texts: string[]
): Promise<EmbeddingResult[]> {
  try {
    const results: EmbeddingResult[] = []

    for (const text of texts) {
      const result = await generateEmbedding(text)
      results.push(result)

      // Rate limiting para no sobrecargar la API
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return results
  } catch (error) {
    console.error('[v0] Error generating batch embeddings:', error)
    throw error
  }
}

/**
 * Calcula similitud coseno entre dos vectores
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimension')
  }

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }

  norm1 = Math.sqrt(norm1)
  norm2 = Math.sqrt(norm2)

  if (norm1 === 0 || norm2 === 0) {
    return 0
  }

  return dotProduct / (norm1 * norm2)
}

/**
 * Busca artículos similares por semantic search
 */
export function findSimilarVectors(
  queryVector: number[],
  candidateVectors: Array<{ id: string; embedding: number[] }>,
  topK: number = 5,
  threshold: number = 0.5
): Array<{ id: string; score: number }> {
  const results = candidateVectors
    .map((candidate) => ({
      id: candidate.id,
      score: cosineSimilarity(queryVector, candidate.embedding),
    }))
    .filter((result) => result.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return results
}

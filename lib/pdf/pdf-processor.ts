import * as pdfParseModule from 'pdf-parse'
const pdfParse = pdfParseModule.default || pdfParseModule

export interface PDFExtractedContent {
  text: string
  metadata: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producedDate?: string
    modifiedDate?: string
    pages: number
  }
  sections: PDFSection[]
}

export interface PDFSection {
  pageNumber: number
  content: string
  headings?: string[]
}

/**
 * Extrae contenido completo de un PDF
 */
export async function extractPDFContent(pdfBuffer: Buffer): Promise<PDFExtractedContent> {
  try {
    const data = await pdfParse(pdfBuffer)

    console.log('[v0] PDF parsed successfully')

    const metadata = {
      title: data.info?.Title || undefined,
      author: data.info?.Author || undefined,
      subject: data.info?.Subject || undefined,
      creator: data.info?.Creator || undefined,
      producedDate: data.info?.CreationDate || undefined,
      modifiedDate: data.info?.ModDate || undefined,
      pages: data.numpages,
    }

    const text = data.text

    const sections: PDFSection[] = []

    if (data.pages && Array.isArray(data.pages)) {
      data.pages.forEach((page: any, index: number) => {
        sections.push({
          pageNumber: index + 1,
          content: page.text || '',
        })
      })
    } else {
      sections.push({
        pageNumber: 1,
        content: text,
        headings: extractHeadings(text),
      })
    }

    return {
      text,
      metadata,
      sections,
    }
  } catch (error) {
    console.error('[v0] Error extracting PDF content:', error)
    throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Extrae títulos/headings del texto
 */
function extractHeadings(text: string): string[] {
  const headings: string[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    if (
      trimmed.length > 3 &&
      trimmed.length < 100 &&
      (trimmed === trimmed.toUpperCase() || /^[A-Z][^a-z]*$/.test(trimmed))
    ) {
      headings.push(trimmed)
    }
  }

  return [...new Set(headings)].slice(0, 10)
}

/**
 * Limpia y normaliza el texto
 */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
}

/**
 * Divide el texto en chunks para embeddings
 */
export function chunkText(text: string, chunkSize: number = 2000, overlapSize: number = 200): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length)

    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end)
      if (lastSpace > start) {
        end = lastSpace
      }
    }

    chunks.push(text.substring(start, end).trim())
    start = end - overlapSize
  }

  return chunks.filter((chunk) => chunk.length > 100)
}

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BibliographyUpload } from '@/components/admin/bibliography-upload'

interface BibliographyDocument {
  id: string
  title: string
  description: string
  document_type: string
  authors: string[]
  pages_count: number
  created_at: string
  status: string
  key_concepts: string[]
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  protocol: 'Protocolo',
  scientific_article: 'Artículo Científico',
  case_study: 'Caso Clínico',
  clinical_guide: 'Guía Clínica',
  other: 'Otro',
}

export default function BibliographyPage() {
  const [documents, setDocuments] = useState<BibliographyDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const url = new URL('/api/admin/bibliography/upload', window.location.origin)
      if (filterType !== 'all') {
        url.searchParams.append('type', filterType)
      }

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error('Error loading documents')
      }

      const data = await response.json()
      setDocuments(data.documents)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar documentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [filterType])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Base de Conocimiento - Bibliografía</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona documentos científicos y protocolos clínicos
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-primary text-primary-foreground"
        >
          {showUpload ? 'Cancelar' : 'Cargar Documento'}
        </Button>
      </div>

      {showUpload && (
        <BibliographyUpload onSuccess={() => {
          setShowUpload(false)
          loadDocuments()
        }} />
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filterType === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border'
            }`}
          >
            Todos
          </button>
          {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilterType(value)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterType === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando documentos...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No hay documentos cargados. {showUpload === false && 'Haz click en "Cargar Documento" para comenzar.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {doc.description}
                  </p>
                </div>
                <span className="ml-4 px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                  {DOCUMENT_TYPE_LABELS[doc.document_type]}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                <div>
                  <p className="text-muted-foreground">Páginas</p>
                  <p className="font-semibold">{doc.pages_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Autores</p>
                  <p className="font-semibold">
                    {doc.authors?.length > 0 ? doc.authors.length : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Concepto Clave</p>
                  <p className="font-semibold">
                    {doc.key_concepts?.length > 0 ? doc.key_concepts.length : 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha Carga</p>
                  <p className="font-semibold">
                    {new Date(doc.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              {doc.authors && doc.authors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Autores:</p>
                  <p className="text-sm">
                    {doc.authors.join(', ')}
                  </p>
                </div>
              )}

              {doc.key_concepts && doc.key_concepts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {doc.key_concepts.slice(0, 5).map((concept, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 rounded text-xs bg-secondary/10 text-secondary-foreground"
                    >
                      {concept}
                    </span>
                  ))}
                  {doc.key_concepts.length > 5 && (
                    <span className="inline-block px-2 py-1 text-xs text-muted-foreground">
                      +{doc.key_concepts.length - 5} más
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold mb-2">Información de Carga</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✓ Los PDFs se procesan automáticamente</li>
          <li>✓ Se extrae texto y se generan embeddings</li>
          <li>✓ Los documentos son indexables por búsqueda semántica</li>
          <li>✓ Solo administradores pueden cargar documentos</li>
          <li>✓ Máximo 50MB por archivo</li>
        </ul>
      </div>
    </div>
  )
}

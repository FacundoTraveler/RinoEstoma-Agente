'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

interface BibliographyUploadProps {
  onSuccess?: (documentId: string) => void
}

const DOCUMENT_TYPES = [
  { value: 'protocol', label: 'Protocolo Clínico' },
  { value: 'scientific_article', label: 'Artículo Científico' },
  { value: 'case_study', label: 'Caso Clínico' },
  { value: 'clinical_guide', label: 'Guía Clínica' },
  { value: 'other', label: 'Otro' },
]

export function BibliographyUpload({ onSuccess }: BibliographyUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [documentType, setDocumentType] = useState('protocol')
  const [authors, setAuthors] = useState('')
  const [publicationDate, setPublicationDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('El archivo debe ser un PDF')
        setFile(null)
        return
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('El archivo no puede exceder 50MB')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validar campos requeridos
    if (!file || !title || !documentType) {
      setError('Por favor completa los campos requeridos')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('documentType', documentType)
      formData.append('authors', authors)
      if (publicationDate) {
        formData.append('publicationDate', publicationDate)
      }

      const response = await fetch('/api/admin/bibliography/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar el documento')
      }

      const result = await response.json()

      setSuccess(true)
      setFile(null)
      setTitle('')
      setDescription('')
      setDocumentType('protocol')
      setAuthors('')
      setPublicationDate('')

      if (onSuccess) {
        onSuccess(result.document.id)
      }

      // Resetear form después de 2 segundos
      setTimeout(() => {
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border border-border">
      <div className="space-y-2">
        <label htmlFor="file" className="block text-sm font-medium">
          Archivo PDF *
        </label>
        <Input
          id="file"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={loading}
          required
        />
        {file && (
          <p className="text-sm text-muted-foreground">
            Archivo seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">
          Título *
        </label>
        <Input
          id="title"
          type="text"
          placeholder="Ej: Protocolos de evaluación funcional en RinoEstomatología"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Descripción/Resumen
        </label>
        <textarea
          id="description"
          placeholder="Resumen breve del contenido..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows={4}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="type" className="block text-sm font-medium">
            Tipo de Documento *
          </label>
          <select
            id="type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={loading}
            required
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="block text-sm font-medium">
            Fecha de Publicación
          </label>
          <Input
            id="date"
            type="date"
            value={publicationDate}
            onChange={(e) => setPublicationDate(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="authors" className="block text-sm font-medium">
          Autores (separados por comas)
        </label>
        <Input
          id="authors"
          type="text"
          placeholder="Dr. Juan Pérez, Dra. María García"
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm">
          Documento cargado exitosamente. Se está procesando...
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Procesando...
          </>
        ) : (
          'Cargar Documento'
        )}
      </Button>

      <p className="text-xs text-muted-foreground">
        * Campos requeridos. El archivo será procesado automáticamente con extracción de texto,
        embeddings y búsqueda semántica.
      </p>
    </form>
  )
}

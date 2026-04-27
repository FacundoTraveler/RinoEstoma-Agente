'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Search, Trash2, FileText, Upload, CheckCircle, AlertCircle, X } from 'lucide-react'

interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  is_public: boolean
  metadata?: Record<string, unknown>
  created_at: string
}

interface UploadResult {
  filename: string
  pageCount: number
  chunksCreated: number
  totalChunks: number
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // PDF Upload state
  const [isDragging, setIsDragging] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadCategory, setUploadCategory] = useState('pdf')
  const [uploadTags, setUploadTags] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadArticles = async () => {
    setIsLoading(true)
    try {
      const url = new URL((process.env.NEXT_PUBLIC_BASE_PATH ?? '') + '/api/knowledge/articles', window.location.origin)
      if (searchQuery) url.searchParams.set('q', searchQuery)
      if (selectedCategory) url.searchParams.set('category', selectedCategory)
      const res = await fetch(url)
      const data = await res.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('[v0] Error loading articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadArticles, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory])

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.toLowerCase().endsWith('.pdf')) {
      setUploadFile(file)
      setUploadError(null)
      setUploadResult(null)
    } else {
      setUploadError('Solo se aceptan archivos PDF')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadFile(file)
      setUploadError(null)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) return
    setIsUploading(true)
    setUploadError(null)
    setUploadResult(null)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      if (uploadTitle) formData.append('title', uploadTitle)
      formData.append('category', uploadCategory)
      if (uploadTags) formData.append('tags', uploadTags)

      const res = await fetch((process.env.NEXT_PUBLIC_BASE_PATH ?? '') + '/api/knowledge/upload-pdf', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || 'Error al procesar el PDF')
      } else {
        setUploadResult(data)
        setUploadFile(null)
        setUploadTitle('')
        setUploadTags('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        loadArticles()
      }
    } catch (_) {
      setUploadError('Error de conexion. Por favor intenta nuevamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este fragmento de la base de conocimiento?')) return
    try {
      await fetch((process.env.NEXT_PUBLIC_BASE_PATH ?? '') + '/api/knowledge/articles', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      setArticles((prev) => prev.filter((a) => a.id !== id))
    } catch (_) {}
  }

  const isPdfArticle = (article: KnowledgeArticle) =>
    article.metadata && typeof article.metadata === 'object' && 'source_pdf' in article.metadata

  const pdfSources = [...new Set(
    articles
      .filter(isPdfArticle)
      .map((a) => (a.metadata as Record<string, unknown>)?.source_pdf as string)
      .filter(Boolean)
  )]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Base de Conocimiento</h1>
            <p className="text-muted-foreground mt-1">
              Sube PDFs especializados para alimentar las respuestas del agente con conocimiento medico experto
            </p>
          </div>

          {/* PDF Upload Card */}
          <Card className="p-6 space-y-4 border-2 border-dashed border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Subir PDF</h2>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              {uploadFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{uploadFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="ml-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Arrastra un PDF aqui o <span className="text-primary font-medium">haz clic para seleccionar</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Maximo 15MB · Solo archivos PDF con texto seleccionable</p>
                </div>
              )}
            </div>

            {/* Options */}
            {uploadFile && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Titulo (opcional)</label>
                  <Input
                    placeholder={uploadFile.name.replace('.pdf', '')}
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="pdf">PDF</option>
                    <option value="protocols">Protocolos</option>
                    <option value="procedures">Procedimientos</option>
                    <option value="guidelines">Guias Clinicas</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Etiquetas (separadas por coma)</label>
                  <Input
                    placeholder="rinoestoma, protocolo..."
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                  />
                </div>
              </div>
            )}

            {uploadFile && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90 w-full md:w-auto"
              >
                {isUploading ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Procesando PDF...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir y procesar PDF
                  </>
                )}
              </Button>
            )}

            {/* Success */}
            {uploadResult && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">PDF procesado exitosamente</p>
                  <p className="text-sm">
                    {uploadResult.filename} &middot; {uploadResult.pageCount} paginas &middot;{' '}
                    <strong>{uploadResult.chunksCreated} fragmentos</strong> agregados a la base de conocimiento
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {uploadError && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{uploadError}</p>
              </div>
            )}
          </Card>

          {/* PDFs cargados */}
          {pdfSources.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">PDFs en la base de conocimiento</h2>
              <div className="flex flex-wrap gap-2">
                {pdfSources.map((src) => (
                  <Badge key={src} variant="outline" className="gap-1 py-1 px-3">
                    <FileText className="h-3 w-3" />
                    {src}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="flex gap-3 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en la base de conocimiento..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Todas las categorias</option>
              <option value="pdf">PDF</option>
              <option value="protocols">Protocolos</option>
              <option value="procedures">Procedimientos</option>
              <option value="guidelines">Guias</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Articles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">
                {isLoading ? 'Cargando...' : articles.length + ' fragmentos en la base de conocimiento'}
              </h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : articles.length === 0 ? (
              <Card className="p-10 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">La base de conocimiento esta vacia</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sube tu primer PDF para que el agente tenga conocimiento especializado
                </p>
              </Card>
            ) : (
              articles.map((article) => (
                <Card key={article.id} className="p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-medium text-foreground truncate">{article.title}</h3>
                        {isPdfArticle(article) && (
                          <Badge variant="secondary" className="text-xs gap-1 flex-shrink-0">
                            <FileText className="h-3 w-3" />
                            PDF
                          </Badge>
                        )}
                        {article.category && article.category !== 'pdf' && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">{article.category}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{article.content}</p>
                      {isPdfArticle(article) && (
                        <p className="text-xs text-muted-foreground">
                          Fuente: {String((article.metadata as Record<string, unknown>)?.source_pdf || '')} &middot;
                          Fragmento {Number((article.metadata as Record<string, unknown>)?.chunk_index ?? 0) + 1} de{' '}
                          {String((article.metadata as Record<string, unknown>)?.total_chunks || '?')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Stats */}
          {articles.length > 0 && (
            <Card className="p-4 bg-muted/40">
              <div className="flex gap-6 text-sm flex-wrap">
                <div><span className="text-muted-foreground">Total fragmentos: </span><strong>{articles.length}</strong></div>
                <div><span className="text-muted-foreground">PDFs cargados: </span><strong>{pdfSources.length}</strong></div>
                <div><span className="text-muted-foreground">Publicos: </span><strong>{articles.filter((a) => a.is_public).length}</strong></div>
              </div>
            </Card>
          )}

        </div>
      </main>
    </div>
  )
                      }

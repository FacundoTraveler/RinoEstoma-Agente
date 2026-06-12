'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Search, Plus, Trash2 } from 'lucide-react'

interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  is_public: boolean
  created_at: string
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Cargar artículos
  const loadArticles = async () => {
    setIsLoading(true)
    try {
      const url = new URL('/api/knowledge/articles', window.location.origin)
      if (searchQuery) {
        url.searchParams.set('q', searchQuery)
      }
      if (selectedCategory) {
        url.searchParams.set('category', selectedCategory)
      }

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
    loadArticles()
  }, [searchQuery, selectedCategory])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 px-4 py-8 md:px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">
                Base de Conocimiento
              </h1>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Artículo
              </Button>
            </div>
            <p className="text-muted-foreground">
              Gestiona artículos, protocolos y guías clínicas para RinoEstoma
            </p>
          </div>

          {/* Search Section */}
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artículos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="">Todas las categorías</option>
              <option value="protocols">Protocolos</option>
              <option value="procedures">Procedimientos</option>
              <option value="guidelines">Guías</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : articles.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No se encontraron artículos
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primer artículo
                </Button>
              </Card>
            ) : (
              articles.map((article) => (
                <Card
                  key={article.id}
                  className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.content}
                      </p>
                      <div className="flex gap-2 flex-wrap pt-2">
                        {article.category && (
                          <Badge variant="outline">{article.category}</Badge>
                        )}
                        {article.tags?.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                        {article.is_public && (
                          <Badge variant="default">Público</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground pt-2">
                        Creado:{' '}
                        {new Date(article.created_at).toLocaleDateString(
                          'es-ES'
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Stats */}
          {articles.length > 0 && (
            <Card className="p-6 bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de artículos
                  </p>
                  <p className="text-2xl font-bold">{articles.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Públicos</p>
                  <p className="text-2xl font-bold">
                    {articles.filter((a) => a.is_public).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categorías</p>
                  <p className="text-2xl font-bold">
                    {new Set(articles.map((a) => a.category)).size}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Etiquetas</p>
                  <p className="text-2xl font-bold">
                    {new Set(articles.flatMap((a) => a.tags || [])).size}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

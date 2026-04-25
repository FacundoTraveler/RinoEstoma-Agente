-- Tabla para documentos bibliográficos (PDFs)
CREATE TABLE IF NOT EXISTS bibliography_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('protocol', 'scientific_article', 'case_study', 'clinical_guide', 'other')),
  authors TEXT[] DEFAULT '{}',
  publication_date DATE,
  url TEXT,
  blob_url TEXT NOT NULL COMMENT 'URL en Vercel Blob',
  file_size_bytes INTEGER,
  mime_type VARCHAR(50) DEFAULT 'application/pdf',
  pages_count INTEGER,
  
  -- Extracted content
  extracted_text TEXT,
  key_concepts TEXT[] DEFAULT '{}',
  abstract TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'pending_review')),
  
  -- Indexing
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('spanish', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('spanish', array_to_string(COALESCE(key_concepts, '{}'), ' ')), 'C')
  ) STORED
);

-- Índices para búsqueda
CREATE INDEX idx_bibliography_search ON bibliography_documents USING gin(search_vector);
CREATE INDEX idx_bibliography_type ON bibliography_documents(document_type);
CREATE INDEX idx_bibliography_created_by ON bibliography_documents(created_by);
CREATE INDEX idx_bibliography_status ON bibliography_documents(status);

-- Tabla para secciones/párrafos extraídos de PDFs (para RAG granular)
CREATE TABLE IF NOT EXISTS bibliography_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES bibliography_documents(id) ON DELETE CASCADE,
  page_number INTEGER,
  section_number INTEGER,
  content TEXT NOT NULL,
  
  -- Para embeddings en RAG
  embedding_vector vector(1536), -- OpenAI embedding dimension
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsqueda semántica
CREATE INDEX idx_bibliography_sections_document ON bibliography_sections(document_id);
CREATE INDEX idx_bibliography_sections_embedding ON bibliography_sections USING ivfflat (embedding_vector vector_cosine_ops) 
  WITH (lists = 100);

-- Tabla de auditoría para cambios de documentos
CREATE TABLE IF NOT EXISTS bibliography_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES bibliography_documents(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'archived', 'deleted', 'embedding_generated')),
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bibliography_audit_document ON bibliography_audit_log(document_id);
CREATE INDEX idx_bibliography_audit_action ON bibliography_audit_log(action);

-- Row Level Security (RLS)
ALTER TABLE bibliography_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bibliography_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bibliography_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Solo admins pueden ver/editar documentos en revisión
CREATE POLICY "bibliography_documents_select" ON bibliography_documents
  FOR SELECT USING (
    -- Documentos activos: visible a todos
    status = 'active'
    -- Documentos en revisión/archivados: solo para quien lo creó y admins
    OR (auth.uid() = created_by)
    OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "bibliography_documents_insert" ON bibliography_documents
  FOR INSERT WITH CHECK (
    -- Solo admins pueden insertar
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "bibliography_documents_update" ON bibliography_documents
  FOR UPDATE USING (
    -- Solo admins pueden actualizar
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Secciones heredan visibilidad del documento
CREATE POLICY "bibliography_sections_select" ON bibliography_sections
  FOR SELECT USING (
    -- Si el documento es visible, sus secciones también
    EXISTS (
      SELECT 1 FROM bibliography_documents 
      WHERE id = bibliography_sections.document_id 
      AND (
        status = 'active'
        OR (auth.uid() = created_by)
        OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
      )
    )
  );

-- Audit log es visible solo para admins
CREATE POLICY "bibliography_audit_select" ON bibliography_audit_log
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_bibliography_documents_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bibliography_documents_updated_at
BEFORE UPDATE ON bibliography_documents
FOR EACH ROW
EXECUTE FUNCTION update_bibliography_documents_timestamp();

CREATE TRIGGER bibliography_sections_updated_at
BEFORE UPDATE ON bibliography_sections
FOR EACH ROW
EXECUTE FUNCTION update_bibliography_documents_timestamp();

# RinoEstoma Agent - Deployment Guide

## Despliegue a Vercel

La aplicación está optimizada para desplegarse en Vercel. Aquí está la guía completa.

### Prerrequisitos

- Cuenta de Vercel (https://vercel.com)
- GitHub repository conectado
- Todas las variables de entorno configuradas en Supabase

---

## 1. Preparación Previa

### 1.1 Verificar que todo funciona localmente

```bash
pnpm install
pnpm dev
```

Acceder a `http://localhost:3000` y verificar:
- Landing page se carga correctamente
- Chat widget funciona
- Login/signup están disponibles

### 1.2 Ejecutar tests

```bash
pnpm test
pnpm test:coverage
```

Verificar que la cobertura sea >= 80%:
- Components: 80%+
- Utils: 85%+
- API routes: 75%+

### 1.3 Build local

```bash
pnpm build
pnpm start
```

Verificar que el build sea exitoso y sin warnings.

---

## 2. Configuración en Vercel

### 2.1 Conectar GitHub

1. Ir a https://vercel.com/new
2. Importar el repositorio de GitHub
3. Seleccionar el framework: **Next.js**
4. Vercel detectará automáticamente la configuración

### 2.2 Configurar variables de entorno

En el dashboard de Vercel, ir a **Settings → Environment Variables** y agregar:

#### Producción (production)
```env
SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI SDK (choose one)
OPENAI_API_KEY=sk-...
# O:
# ANTHROPIC_API_KEY=sk-ant-...
# O:
# GROQ_API_KEY=gsk_...

# WhatsApp Business
WHATSAPP_PHONE_ID=123456789
WHATSAPP_ACCESS_TOKEN=EAAxx...
WHATSAPP_WEBHOOK_TOKEN=secure_token_here

# RinoMONITOR API
RINOMONITOR_API_KEY=...
RINOMONITOR_API_URL=...

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=...
```

#### Preview (preview environments)
Incluir las mismas variables para testing en preview deployments.

### 2.3 Configurar el proyecto

En **Settings → Build & Development Settings**:

- **Build Command**: `pnpm run build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Node.js Version**: 20.x (recomendado)

---

## 3. Desplegar

### 3.1 Deploy automático

El deployment es automático cuando haces push a la rama principal:

```bash
git add .
git commit -m "feat: Fase 7 - Testing & Deploy completada"
git push origin main
```

Vercel detectará el push y empezará el deployment automáticamente.

### 3.2 Monitorear deployment

1. Ir al dashboard de Vercel
2. Ver la sección "Deployments"
3. Esperar a que el build termine (3-5 minutos típicamente)
4. Una vez completo, acceder a la URL generada

### 3.3 Dominio personalizado

En **Settings → Domains**:

1. Agregar dominio: `rinoestoma-agent.com` (o tu dominio)
2. Verificar DNS records (Vercel proporciona instrucciones)
3. Esperar propagación (5-30 minutos)

---

## 4. Post-Deployment

### 4.1 Verificaciones

- [ ] Landing page se carga en `https://[your-domain]`
- [ ] Chat widget funciona en el sitio
- [ ] Login/signup funcionan
- [ ] Admin dashboard es accesible
- [ ] WhatsApp webhook funciona (test con mensaje de prueba)

### 4.2 Configurar webhooks de WhatsApp

En el dashboard de WhatsApp Business, ir a **Webhook Settings**:

- **Webhook URL**: `https://[your-domain]/api/webhooks/whatsapp`
- **Verify Token**: El token que configuraste en env vars
- **Subscribe to messages**: Activar

### 4.3 Monitoreo

Configurar alertas en Vercel:

1. **Settings → Monitoring**
2. Activar alertas para:
   - Build failures
   - Deployment issues
   - Performance degradation

---

## 5. CI/CD Pipeline

### GitHub Actions (opcional)

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Run linter
        run: pnpm lint
      
      - name: Build
        run: pnpm build
        
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 6. Optimización de Performance

### 6.1 Image Optimization

Vercel optimiza automáticamente imágenes. Verificar en:
- **Analytics → Web Vitals**
- **Settings → Performance**

### 6.2 Caching

Configurar caching headers en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=10, stale-while-revalidate=59"
        }
      ]
    }
  ]
}
```

### 6.3 Analytics

Habilitar Web Analytics en Vercel para monitorear:
- Core Web Vitals
- User interactions
- Performance metrics

---

## 7. Troubleshooting

### Build fails con "Module not found"

```bash
# Limpiar y reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Variables de entorno no funcionan

1. Verificar en **Settings → Environment Variables**
2. Redeploy después de agregar variables:
   ```bash
   git commit --allow-empty -m "redeploy"
   git push origin main
   ```

### Webhook de WhatsApp no funciona

1. Verificar que la URL sea correcta: `https://[domain]/api/webhooks/whatsapp`
2. Verificar que el token sea exacto
3. Revisar logs en Vercel: **Deployments → Logs → Function logs**

### Database queries lentas

1. Ir a Supabase Dashboard
2. Revisar **Database → Performance**
3. Crear índices si es necesario en las columnas de búsqueda frecuente

---

## 8. Rollback

Si algo sale mal en producción:

### Rollback a versión anterior

En Vercel Dashboard:
1. Ir a **Deployments**
2. Encontrar un deployment anterior exitoso
3. Click en el menú "..." → **Promote to Production**

### O mediante git:

```bash
git revert [commit-hash]
git push origin main
```

---

## 9. Mantenimiento

### Updates de dependencias

```bash
# Revisar updates
pnpm outdated

# Actualizar
pnpm update

# Verificar que todo sigue funcionando
pnpm test
pnpm build

# Deploy
git add .
git commit -m "chore: dependency updates"
git push origin main
```

### Backups de Database

Supabase automáticamente:
- Realiza backups diarios
- Retiene 7 días de backups
- Permite download manual desde Dashboard

---

## 10. Security

### Verificar configuración de seguridad

- [ ] HTTPS habilitado (automático en Vercel)
- [ ] Rate limiting en APIs (/api routes)
- [ ] CORS configurado correctamente
- [ ] Secrets no están en el repo
- [ ] RLS policies en Supabase están habilitadas
- [ ] WAF (Web Application Firewall) habilitado en Vercel

### Secrets Management

Usar Vercel Secrets para credenciales sensibles:

```bash
vercel env add SENSITIVE_KEY
```

---

## Referencias

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Supabase Deployment](https://supabase.com/docs/guides/platforms/vercel)
- [WhatsApp Business API](https://www.whatsapp.com/business/downloads/WhatsApp-Business-API-White-Paper.pdf)

---

**¡Listo para producción!** 🚀

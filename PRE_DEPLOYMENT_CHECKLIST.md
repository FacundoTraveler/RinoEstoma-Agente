# Pre-Deployment Checklist - RinoEstoma Agent

Usar esta checklist antes de deployar a producción.

## 🔍 Code Quality

- [ ] Todos los tests pasan: `pnpm test`
- [ ] No hay errores de linting: `pnpm lint`
- [ ] Build es exitoso: `pnpm build`
- [ ] No hay console.log debug statements
- [ ] No hay TODO o FIXME comentarios
- [ ] TypeScript sin errores: `pnpm type-check`

## 📦 Dependencies

- [ ] Todas las dependencias están actualizadas
- [ ] No hay security vulnerabilities: `pnpm audit`
- [ ] package-lock.yaml/pnpm-lock.yaml está committeado
- [ ] Tamaño del bundle es aceptable

## 🗄️ Database

- [ ] Migraciones están ejecutadas: `pnpm db:setup`
- [ ] RLS policies están habilitadas en Supabase
- [ ] Índices están creados en tablas de búsqueda frecuente
- [ ] Respaldos automáticos están configurados
- [ ] Conexión a database es exitosa

## 🔐 Environment Variables

### En Vercel (Settings → Environment Variables)

- [ ] `SUPABASE_URL` está configurada
- [ ] `NEXT_PUBLIC_SUPABASE_URL` está configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` está configurada
- [ ] AI SDK key (OpenAI/Anthropic/Groq) está configurada
- [ ] `WHATSAPP_PHONE_ID` está configurada
- [ ] `WHATSAPP_ACCESS_TOKEN` está configurada
- [ ] `WHATSAPP_WEBHOOK_TOKEN` está configurada
- [ ] `RINOMONITOR_API_KEY` está configurada (si aplica)
- [ ] `RINOMONITOR_API_URL` está configurada (si aplica)

**NO** están en el repo (`.env.local` en .gitignore):
- [ ] API keys
- [ ] Tokens de webhook
- [ ] Service role keys

## 🌐 API & Webhooks

- [ ] Todos los endpoints están documentados
- [ ] Error handling está implementado en todos los endpoints
- [ ] Rate limiting está configurado
- [ ] CORS está configurado correctamente
- [ ] Webhooks de WhatsApp están testeados localmente

## 👥 Authentication & Security

- [ ] Login/signup funcionan correctamente
- [ ] Password reset está implementado
- [ ] Session management está seguro (HTTP-only cookies)
- [ ] RBAC (Role-Based Access Control) está funcionando
- [ ] Admin routes requieren autenticación

## 📱 Frontend

- [ ] Landing page funciona en desktop y mobile
- [ ] Chat widget funciona en todas las páginas
- [ ] Formularios validan correctamente
- [ ] Mensajes de error son útiles
- [ ] Loading states están en todos los async operations
- [ ] Dark mode (si aplica) funciona

## 📊 Admin Dashboard

- [ ] Dashboard carga datos correctamente
- [ ] Gráficos se renderizan sin errores
- [ ] Tablas de usuarios/citas están paginadas
- [ ] Filtros funcionan correctamente
- [ ] Exports están testeados

## 🧪 Testing

- [ ] Cobertura de tests >= 80%
- [ ] Todos los tests pasan localmente
- [ ] E2E tests pasan (si existen)
- [ ] Casos edge están testeados
- [ ] Tests pasan en CI/CD pipeline

## 📈 Performance

- [ ] Lighthouse score >= 90
- [ ] Web Vitals están dentro de límites
- [ ] Imágenes están optimizadas
- [ ] Code splitting está habilitado
- [ ] Bundling es correcto

## 🔒 Security Audit

- [ ] No hay secrets hardcodeados
- [ ] SQL injection está prevenida (queries parametrizadas)
- [ ] XSS está prevenida (sanitización de inputs)
- [ ] CSRF tokens están implementados (si aplicable)
- [ ] Rate limiting está activo

## 📚 Documentation

- [ ] README.md está actualizado
- [ ] SETUP.md está actualizado
- [ ] DEPLOYMENT.md está actualizado
- [ ] API endpoints están documentados
- [ ] Comments en código complejo están presentes

## 🚀 Vercel Configuration

- [ ] Vercel project está creado
- [ ] GitHub está conectado
- [ ] Build settings están correctos
- [ ] Dominio está configurado (si aplica)
- [ ] SSL/HTTPS está habilitado

## 📞 WhatsApp Integration

- [ ] WhatsApp Business account está creado
- [ ] Phone number está verificado
- [ ] Webhook URL es correcta: `https://[domain]/api/webhooks/whatsapp`
- [ ] Webhook token está seguro
- [ ] Mensaje de prueba funciona

## 🔄 Monitoring & Logging

- [ ] Error tracking está configurado (Sentry/Vercel)
- [ ] Logs están siendo capturados
- [ ] Alertas están configuradas
- [ ] Analytics están habilitadas

## ✅ Final Checks

- [ ] Todos los items anteriores están completados
- [ ] Code review fue aprobado
- [ ] Product owner aprobó los cambios
- [ ] Se tiene un plan de rollback en caso de error
- [ ] Team está notificado del deployment

## 🚀 Deployment Steps

1. ```bash
   # Verificar una última vez
   pnpm test
   pnpm build
   ```

2. ```bash
   # Push a main branch
   git push origin main
   ```

3. Verificar en Vercel Dashboard que el deployment inició

4. Esperar a que termine (3-5 minutos típicamente)

5. Test en production:
   - Visitar dominio
   - Probar login
   - Probar chat widget
   - Probar WhatsApp webhook con mensaje de prueba

6. Monitor logs por 30 minutos después del deployment

---

**Deployment completado! 🎉**

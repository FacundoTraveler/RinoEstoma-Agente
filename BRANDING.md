# RinoEstoma Branding Guidelines

## Logo

### Logo Principal
- **Archivo:** `/public/logo-rino.jpg` o `/public/logo-rino.png`
- **Color:** Teal/Turquoise (#5BC0BE)
- **Fondo:** Transparente u Blanco
- **Formato:** Circle con letras "FE" (Estomatología)
- **Proporción:** 1:1 (Cuadrado perfecto)

### Ubicaciones del Logo

1. **Header Navigation**
   - Ubicación: Lado izquierdo superior
   - Tamaño: 40x40px
   - Archivo: `components/header.tsx`
   - Junto con texto "RinoEstoma Agent AI"

2. **Favicon**
   - Ubicación: Pestaña del navegador
   - Tamaño: 32x32px
   - Archivo: `app/layout.tsx` (metadata)

3. **OpenGraph / Social Media**
   - Tamaño: 1200x1200px
   - Archivo: `app/layout.tsx` (metadata)

4. **Landing Page**
   - Ubicación: Sección hero
   - Tamaño: Variable (recomendado 200x200px)
   - Archivo: `app/page.tsx`

5. **Admin Dashboard**
   - Ubicación: Sidebar
   - Tamaño: 48x48px
   - Archivo: `components/admin-sidebar.tsx`

6. **Chat Widget**
   - Ubicación: Botón flotante
   - Tamaño: 40x40px
   - Archivo: `components/chat-widget.tsx`

---

## Color Palette

### Primary Colors
- **Primary (Teal):** `oklch(0.58 0.12 193.6)` ≈ #5BC0BE
  - Uso: Buttons, links, focus states, accents
  - Contraste: Blanco para texto (WCAG AAA)

- **Primary Light:** `oklch(0.75 0.08 193.6)` ≈ #8DDDD6
  - Uso: Hover states, backgrounds secundarios
  - Contraste: Gris oscuro para texto

### Neutral Colors
- **Background:** `oklch(0.98 0 0)` ≈ #FAFAFA (casi blanco)
- **Foreground:** `oklch(0.25 0 0)` ≈ #404040 (casi negro)
- **Muted:** `oklch(0.92 0 0)` ≈ #EBEBEB (gris claro)

### Accent Colors
- **Success/Check:** Verde (similar al teal)
- **Warning/Alert:** Naranja
- **Destructive:** Rojo #EF4444

---

## Typography

### Fonts
- **Heading Font:** Geist Sans (Bold, SemiBold)
- **Body Font:** Geist Sans (Regular)
- **Monospace:** Geist Mono (para código)

### Sizes
- **H1:** 2.25rem (36px) - Landing hero
- **H2:** 1.875rem (30px) - Section titles
- **H3:** 1.5rem (24px) - Card titles
- **Body:** 1rem (16px) - Párrafos
- **Small:** 0.875rem (14px) - Etiquetas, helpers

### Line Heights
- **Headings:** 1.2
- **Body:** 1.6 (leading-relaxed)
- **Small:** 1.4

---

## Components Branded

### Button (Primary)
- Background: Primary teal
- Text: White
- Hover: Primary darker
- Border Radius: 8px

### Cards
- Background: White
- Border: 1px solid border color
- Padding: 1.5rem
- Border Radius: 8px
- Shadow: Subtle drop shadow

### Inputs
- Border: 1px solid border color
- Focused: 2px solid primary teal
- Padding: 0.75rem 1rem
- Border Radius: 8px

### Header
- Background: Opaque white with backdrop blur
- Logo: 40x40px, teal
- Text: "RinoEstoma Agent AI"

### Admin Sidebar
- Background: Teal primary
- Text: White
- Logo: 48x48px
- Links: White text, hover: light teal

---

## Usage Examples

### In Pages
```tsx
import Image from 'next/image'

<Image
  src="/logo-rino.jpg"
  alt="RinoEstoma Logo"
  width={200}
  height={200}
  className="rounded-lg"
/>
```

### In Components
```tsx
<div className="flex items-center gap-2">
  <Image
    src="/logo-rino.jpg"
    alt="Logo"
    width={40}
    height={40}
    className="rounded-full"
  />
  <span className="text-primary font-bold">RinoEstoma</span>
</div>
```

---

## Design Principles

1. **Consistency:** Logo siempre en teal, nunca manipular colores
2. **Clear Space:** Mínimo 20px de espacio alrededor del logo
3. **Minimum Size:** No usar logo más pequeño de 32x32px
4. **Accessibility:** Siempre incluir `alt` text descriptivo
5. **Responsiveness:** Logo escala correctamente en móvil/desktop

---

## Files Modified

- ✅ `/public/logo-rino.jpg` - Logo principal en JPG
- ✅ `/public/logo-rino.png` - Logo en PNG (alternative)
- ✅ `app/layout.tsx` - Metadata con logo
- ✅ `components/header.tsx` - Logo en navegación
- ✅ `app/globals.css` - Variables de color teal
- ✅ `components/admin-sidebar.tsx` - Logo en sidebar admin
- ✅ `components/chat-widget.tsx` - Logo en widget chat

---

## Testing Branding

Para verificar que el branding esté correcto:

1. **Verificar Logo:**
   - [ ] Logo visible en header
   - [ ] Logo correcto en favicon (pestaña)
   - [ ] Logo aparece en preview de redes sociales
   - [ ] Logo en admin sidebar

2. **Verificar Colores:**
   - [ ] Teal consistente en buttons
   - [ ] Links en teal
   - [ ] Hover effects funcionan
   - [ ] Contraste accesible (WCAG AA mínimo)

3. **Verificar Typography:**
   - [ ] Fonts cargan correctamente
   - [ ] Headings y body diferenciados
   - [ ] Espaciado consistente

---

## Future Updates

- Crear versión SVG del logo para máxima escalabilidad
- Agregar logo variante en blanco/negro para usos especiales
- Crear style guide interactivo con Storybook
- Agregar animaciones sutiles del logo en landing page

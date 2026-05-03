# Checklist de QA — Prode Mundial 2026

Smoke tests por página + criterios de aceptación. Ejecutar en **dark + light**, en **desktop (≥1280px)** y **mobile (375px)**.

## Convenciones

- ✅ = pasa | ⚠️ = pasa con observaciones | ❌ = bloqueante
- "Smoke" = ruta carga sin errores en consola, sin layout roto, sin contenido placeholder.
- Verificar siempre: sin errores en consola, sin warnings de hidratación, navegación con teclado funciona.

---

## 🏠 Home (`/`)

### Smoke

- [ ] Carga en <2s, sin errores rojos en consola.
- [ ] Hero visible con título "EL PRODE DEL MUNDIAL 2026".
- [ ] Countdown muestra días/horas/min/seg y se actualiza cada segundo.
- [ ] Stats (48 / 104 / 1) visibles.

### Criterios de aceptación

- [ ] CTA "Sumate al prode" → `/registro`.
- [ ] CTA "Ver fixture" → `/fixture`.
- [ ] Sección "Próximos partidos" muestra 3 `MatchCard` con banderas SVG (no siglas, no emojis rotos en Windows).
- [ ] Sección AlbumPreview con 6 banderas top, click → `/equipos/$id`.
- [ ] Top 3 ranking con primer puesto destacado.
- [ ] CTA final "Crear mi cuenta gratis" → `/registro`.
- [ ] Meta `<title>` único de home.

---

## 🛡 Equipos (`/equipos` y `/equipos/$equipoId`)

### Smoke listado

- [ ] 12 grupos (A–L) visibles, cada uno con 4 selecciones.
- [ ] Cada card tiene bandera SVG + nombre + confederación.
- [ ] Hover resalta borde.

### Smoke detalle

- [ ] `/equipos/ger` (y otros) carga sin pantalla blanca.
- [ ] Header con bandera grande, nombre, grupo, confederación.
- [ ] Álbum de figuritas visible **por defecto** (sin necesidad de hover).
- [ ] Stagger de aparición rápido y suave (<1s total).

### Criterios de aceptación

- [ ] Click en figurita abre `PlayerModal` con datos del jugador.
- [ ] Modal cierra con ESC y con click fuera.
- [ ] Sección "Próximos partidos del equipo" debajo del álbum.
- [ ] Breadcrumb / link "← Equipos" funciona.
- [ ] Meta title incluye nombre del equipo.
- [ ] Equipo inexistente (`/equipos/xxx`) muestra `notFoundComponent`.

---

## 📅 Fixture (`/fixture`)

### Smoke

- [ ] 12 botones de grupo (A–L) sticky en el top.
- [ ] Tabla de posiciones del grupo activo visible.
- [ ] Lista de partidos del grupo a la derecha (md+) o debajo (mobile).

### Criterios de aceptación

- [ ] Click en grupo cambia tabla **y** lista de partidos.
- [ ] Selector activo destacado con `bg-gradient-pitch` y `scale-110`.
- [ ] Scroll suave al top al cambiar de grupo.
- [ ] Fechas de `MatchCard` en hora local (es-AR), sin warning de hydration.
- [ ] Banderas SVG en tabla y cards.
- [ ] `aria-selected` correcto en tabs.

---

## 🎯 Mis Pronósticos (`/mis-pronosticos`)

### Smoke (logueado)

- [ ] Resumen con total de puntos calculado dinámicamente (no "0" hardcoded).
- [ ] Lista de partidos próximos con inputs editables.
- [ ] Lista de partidos finalizados con puntos por partido.

### Criterios de aceptación

- [ ] Inputs de score: rango 0–20, bloquean `e`, `+`, `-`.
- [ ] `onWheel` no cambia el valor accidentalmente.
- [ ] "Guardar" persiste a Supabase y muestra "Guardado ✓".
- [ ] Empty state "no hay partidos jugados" si corresponde.
- [ ] Sin sesión: redirect a `/login`.

---

## 📊 Insights (`/insights`)

### Smoke

- [ ] Stats del usuario logueado (aciertos exactos, parciales, racha).
- [ ] Sin `as any` ni errores de tipos en consola.

### Criterios de aceptación

- [ ] Banderas SVG en cards de equipos predichos.
- [ ] Si el usuario no tiene predicciones: empty state claro.
- [ ] Cálculos coinciden con `scoring.ts` (1 punto resultado, 3 ganador).

---

## 👤 Perfil (`/perfil`)

### Smoke

- [ ] Avatar con color actual visible.
- [ ] Username editable.
- [ ] Equipo favorito seleccionable (select nativo muestra `CODE — Nombre`, no emojis).

### Criterios de aceptación

- [ ] Cambio de color de avatar persiste a `profiles.avatar_color`.
- [ ] Toast de confirmación al guardar.
- [ ] Logout funciona y redirige a `/`.

---

## 🌐 Layout global (header / footer / theme)

- [ ] Header sticky con logo + 6 links de navegación.
- [ ] ThemeToggle alterna `dark` ↔ `light` sin FOUC (boot script en `__root`).
- [ ] Mobile: menú hamburguesa incluye ThemeToggle y link a `/perfil` con username.
- [ ] Footer presente en todas las rutas.
- [ ] `<html lang="es">`.
- [ ] 404 global muestra "Page Not Found" con link a home.

---

## ♿ Accesibilidad

- [ ] Navegación completa con `Tab`, foco visible.
- [ ] `aria-label` en botones icon-only (theme toggle, menú, etc.).
- [ ] Contraste AA en ambos temas (texto principal vs background).
- [ ] Inputs con `<label>` o `aria-label`.
- [ ] Modales atrapan el foco y se cierran con ESC.

---

## 🚀 Performance & SEO

- [ ] Lighthouse Performance ≥85 desktop / ≥70 mobile.
- [ ] Cada ruta tiene `<title>` único <60 chars y `meta description` <160.
- [ ] `og:title` + `og:description` por ruta (sin pisarse desde el root).
- [ ] Imágenes con `alt`. Banderas decorativas con `aria-hidden`.
- [ ] Sin warnings de hidratación en consola.

---

## 🤖 Smoke automatizado

Script: `scripts/smoke-tests.mjs` (Playwright + Chromium).

```bash
# Contra dev local
BASE_URL=http://localhost:3000 node scripts/smoke-tests.mjs

# Contra preview / producción
BASE_URL=https://tu-app.lovable.app node scripts/smoke-tests.mjs
```

- Recorre 10 rutas críticas en desktop (1280x800) **y** mobile (390x844).
- Captura screenshot fullpage por ruta + viewport en `./smoke-report/`.
- Registra: errores de consola, warnings, page errors, requests fallidos, HTTP status, tiempo de carga.
- Genera `smoke-report/report.md` (humano) y `report.json` (CI).
- Sale con `exit 1` si hay errores → integrable en CI/PR checks.
- Filtra ruido conocido (`[vite]`, RESET_BLANK_CHECK, React DevTools).

Pre-requisito: `npx playwright install chromium` la primera vez.

---

## 🐛 Smoke regresiones recurrentes

- [ ] **Hydration timezone**: `MatchCard` no debe mostrar diff server/cliente en la fecha.
- [ ] **Banderas en Windows**: en select nativo y donde no se pueda usar `<Flag />`, mostrar `CODE — Nombre`.
- [ ] **Álbum sin hover**: figuritas visibles al cargar la página.
- [ ] **Outlet en `/equipos`**: `/equipos/$id` no debe quedar en blanco.
- [ ] **Theme FOUC**: al recargar en light mode, no parpadea oscuro.

# Deploy del Prode 2026 a Cloudflare Workers

Esto te da una URL pública 24/7 (`https://prode-mundial-2026.<tu-cuenta>.workers.dev`) gratis y para siempre. Sin tu PC prendida. Familia y amigos entran desde su teléfono o PC en cualquier red.

**Tiempo total**: ~10 minutos la primera vez, 30 segundos cada redeploy.

---

## Pre-requisitos

- Cuenta de Cloudflare (gratis, 100k requests/día) ✓
- `npm install` corrido en el proyecto ✓
- `.env` con las VITE\_\* completas (las del cliente) ✓
- Acceso al **Supabase Dashboard** del proyecto `avaodjczivuopxdgwcyq` para sacar el service role key. Si Lovable creó la DB y no podés entrar, escribí desde [supabase.com/dashboard](https://supabase.com/dashboard) y mirá si ya estás como owner/admin. Si no, el flujo de "Claim project" te lo deja transferir.

> **Nada que instalar global.** `wrangler` viene bundled con `@cloudflare/vite-plugin` que ya está en deps. Todos los comandos usan `npx wrangler ...`.

---

## Paso 1 — Login en Cloudflare

```bash
npx wrangler login
```

Abre tu navegador y te pide autorizar. Hacés clic en "Allow", listo. Esto guarda credenciales en tu home (`~/.wrangler`) y no las vas a tener que volver a tocar.

Verificá:

```bash
npx wrangler whoami
```

Te tiene que mostrar tu email + el account ID.

---

## Paso 2 — Setear los 3 secrets

Las **anon/publishable keys** de Supabase ya están en `wrangler.jsonc` (son públicas por diseño, no son secretos). Lo que sí es secreto y nunca va a git:

### 2a — `SUPABASE_SERVICE_ROLE_KEY` (obligatorio)

Sin esto, todas las admin actions del panel `/admin` fallan.

1. Andá a [supabase.com/dashboard](https://supabase.com/dashboard) → proyecto `avaodjczivuopxdgwcyq` → Settings → API
2. Copiá el valor de `service_role` (NO el anon)
3. Corré:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Te pide pegar el valor → pegás → Enter → queda guardado encriptado en Cloudflare.

### 2b — `API_FOOTBALL_KEY` (recomendado)

Es la misma key que tenés en `.env`:

```bash
npx wrangler secret put API_FOOTBALL_KEY
```

Pegás `ca5696003ed5f99465ef91fd8ae15a36`.

### 2c — `WC2026_API_KEY` (opcional)

Si no la tenés, salteá. Los endpoints WC2026 van a tirar error explícito si los invocan, el resto de la app funciona normal.

```bash
npx wrangler secret put WC2026_API_KEY
```

### Verificación

```bash
npx wrangler secret list
```

Tienen que aparecer los nombres de los 2 (o 3) secrets.

---

## Paso 3 — Deploy

```bash
npm run deploy
```

Esto ejecuta `vite build && wrangler deploy`. Tarda ~30 segundos. Al final te imprime algo así:

```
Deployed prode-mundial-2026 triggers (X.YYs)
  https://prode-mundial-2026.<tu-cuenta>.workers.dev
Current Version ID: ...
```

**Esa URL es la que mandás por WhatsApp.** Ya está live.

> El primer deploy a un nombre nuevo te puede pedir confirmar la creación del worker. Decile que sí.

### Probar antes de deployar (opcional)

```bash
npm run deploy:dry
```

Hace todo el proceso de build pero NO sube nada. Útil para ver que no haya errores.

---

## Paso 4 — Configurar Supabase Auth para la URL pública

Esto es **importante**: si no lo hacés, los emails de confirmación de signup van a apuntar a `localhost:8080` y no van a funcionar para usuarios externos.

1. Supabase Dashboard → tu proyecto → Authentication → URL Configuration
2. **Site URL**: poné tu URL de workers (`https://prode-mundial-2026.<tu-cuenta>.workers.dev`)
3. **Redirect URLs**: agregá la misma URL + `http://localhost:8080` (para que sigas pudiendo testear local)
4. Guardar

Si te olvidás de esto, los signups nuevos no van a poder confirmar email.

---

## Paso 5 — Compartir

Mandá la URL por WhatsApp. La familia/amigos:

1. Abren el link en su teléfono o PC
2. Click "Sumate" → crean cuenta con email + password
3. Confirman email (Supabase manda mail automático)
4. Empiezan a pronosticar

**Para instalar como app en el teléfono:**

- **Android (Chrome)**: menú ⋮ → "Instalar app"
- **iOS (Safari)**: botón compartir → "Agregar a pantalla de inicio"

Queda con ícono propio y abre en pantalla completa, como cualquier app.

---

## Operación

### Redeployar después de cambios

Cualquier cambio que hagas al código:

```bash
npm run deploy
```

30 segundos. La URL es la misma, los usuarios no notan el deploy (cero downtime, edge global).

### Ver logs en vivo

```bash
npm run cf:logs
```

Te muestra requests entrantes en tiempo real. Bueno para debuggear errores de producción.

### Rollback a versión anterior

Cloudflare guarda historial de versiones. En caso de un deploy que rompe algo:

```bash
npx wrangler rollback
```

Te pregunta a qué versión anterior volver. Instantáneo.

### Cambiar un secret

Si rotás la service role key o cualquier otro secret:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY  # mismo comando, lo sobreescribe
```

### Borrar el worker (apagar todo)

```bash
npx wrangler delete
```

Sale del aire. Los usuarios no pueden entrar más. Reversible con un nuevo `npm run deploy`.

---

## Custom domain (opcional, si tenés un dominio)

Si tenés un dominio en Cloudflare, podés bindear `prode.tudominio.com` en vez del subdomain `.workers.dev`:

1. Cloudflare Dashboard → Workers & Pages → tu worker → Settings → Triggers
2. Add Custom Domain → poné `prode.tudominio.com`
3. Cloudflare maneja DNS + SSL automático

Para uso casero, el `.workers.dev` está perfecto.

---

## Google OAuth (estado actual + cómo activarlo)

El repo tiene cableado el botón "Continuar con Google" vía `@lovable.dev/cloud-auth-js`. Eso requiere infraestructura de Lovable cloud (que vos no estás usando porque salimos de Lovable).

**Estado actual**: el botón existe pero al hacer click puede tirar error o no funcionar.

**Opciones**:

1. **Sacar el botón** (rápido, 5 min). Email/contraseña es suficiente para uso familiar.
2. **Conectar a OAuth nativo de Supabase** (15 min). Supabase soporta Google OAuth out-of-the-box, hay que:
   - Crear OAuth credentials en Google Cloud Console
   - Pegarlos en Supabase Dashboard → Authentication → Providers → Google
   - Cambiar `lovable.auth.signInWithOAuth("google")` por `supabase.auth.signInWithOAuth({ provider: "google" })`

Decime después si querés que haga 1 o 2.

---

## Troubleshooting

### "Error: Not authenticated" al deployar

Falta `wrangler login`. Volvé al Paso 1.

### El deploy funciona pero la app tira "Missing Supabase server environment variables"

Falta setear `SUPABASE_SERVICE_ROLE_KEY` como secret. Volvé al Paso 2a.

### Los usuarios reciben mail de confirmación con link a localhost

Falta configurar Site URL en Supabase. Volvé al Paso 4.

### El admin panel tira 401/403

Tu usuario `martinmunoz.rrhh@gmail.com` se asigna como admin automáticamente al registrarte (hay un trigger SQL en una migración). Si usás otro email, tenés que insertar manualmente en `user_roles`:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<tu-uuid>', 'admin');
```

(Lo corrés desde Supabase Dashboard → SQL Editor)

### Quiero ver qué versión del código está deployada

```bash
npx wrangler deployments list
```

Te muestra los últimos N deploys con IDs y timestamps.

---

## Costos

- **Cloudflare Workers free tier**: 100,000 requests/día, 10ms CPU/request, sin tarjeta de crédito
- **Supabase free tier**: 500MB DB, 50k MAU, 5GB bandwidth/mes
- **API-Football free tier**: 100 requests/día (suficiente para sync diario via cron)

Para uso familiar (10-30 usuarios activos durante el Mundial), **vas a estar muy lejos de cualquier limite**. $0/mes garantizado.

# Cómo correr el Prode local

Para uso casero/desarrollo. Si querés que la familia y amigos entren **desde cualquier red** (no solo tu WiFi), y que la app esté disponible 24/7 sin tu PC prendida, andá directo a [`docs/deploy.md`](./deploy.md) — deploy gratis a Cloudflare Workers en 10 minutos.

Esta guía cubre el caso "lo corro en mi PC para desarrollar" y la opción intermedia de LAN/tunnel para uso ocasional.

---

## Antes que nada: variables de entorno

Editá `.env` en la raíz del proyecto y completá las claves que faltan:

```env
# Lo que ya viene completo (Supabase del proyecto Lovable):
SUPABASE_URL="https://avaodjczivuopxdgwcyq.supabase.co"
SUPABASE_PUBLISHABLE_KEY="..."
VITE_SUPABASE_URL="https://avaodjczivuopxdgwcyq.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="..."
VITE_SUPABASE_PROJECT_ID="avaodjczivuopxdgwcyq"

# Lo que tenés que pegar vos:
SUPABASE_SERVICE_ROLE_KEY="..."   # Sacalo de Supabase Dashboard > Settings > API > service_role
API_FOOTBALL_KEY="ca5696..."       # Ya viene del proyecto viejo, dejalo como está
WC2026_API_KEY=""                  # Opcional. Si lo dejás vacío los endpoints WC2026 tiran error pero la app arranca igual.
```

Sin `SUPABASE_SERVICE_ROLE_KEY` las acciones de admin (cargar resultados, sincronizar plantillas, recalcular puntos) no van a funcionar — los formularios públicos sí.

---

## Opción 1 — Solo desde tu PC

```bash
npm run dev
```

Vite levanta en `http://localhost:8080`. Solo entrás vos.

Sirve para probar mientras desarrollás. La familia no tiene acceso.

---

## Opción 2 — Familia desde la misma red WiFi (recomendado)

Vite ya está configurado con `host: true` (ver `vite.config.ts`), así que escucha en todas las interfaces. Cualquier teléfono o PC en tu mismo WiFi puede entrar usando la IP de tu compu.

### Paso 1: Levantar el server

```bash
npm run dev
```

Vite te muestra algo así:

```
  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.0.10:8080/   ← esto es lo que usa la familia
```

### Paso 2: Encontrar tu IP local

Si Vite no te imprime la Network URL:

- **Windows**: abrí PowerShell o CMD y corré `ipconfig`. Buscá la línea "IPv4 Address" del adaptador que usás (Wi-Fi o Ethernet). Algo como `192.168.0.10` o `192.168.1.x`.
- **macOS / Linux**: `ifconfig | grep "inet "` o `hostname -I`.

### Paso 3: Abrir el firewall (Windows)

Windows Defender suele bloquear el puerto 8080 para conexiones entrantes la primera vez. Cuando arranques `npm run dev`:

1. Te aparece un popup "Windows Defender Firewall ha bloqueado algunas características de Node.js".
2. Marcá **Redes privadas** (no marques Públicas).
3. Apretá "Permitir acceso".

Si ya cerraste el popup sin permitir: Panel de Control → Sistema y Seguridad → Firewall → Permitir una aplicación → buscá Node.js → tildá Privadas.

### Paso 4: La familia entra desde su teléfono

Que se conecten al **mismo WiFi de tu casa**. Después abren el navegador y van a:

```
http://<tu-ip-local>:8080
```

Por ejemplo: `http://192.168.0.10:8080`.

### Paso 5 (opcional): Instalar como app en el teléfono

Como la app tiene PWA manifest configurado, en el teléfono pueden:

- **Android (Chrome)**: menú ⋮ → "Instalar app" o "Agregar a la pantalla de inicio".
- **iOS (Safari)**: botón compartir → "Agregar a pantalla de inicio".

Queda el ícono del Prode en el home screen y abre en pantalla completa, como cualquier app.

### Limitaciones de esta opción

- **Solo funciona si están en tu WiFi.** Si tu hermano está en otra casa, no entra.
- **Tu PC tiene que estar prendida y con `npm run dev` corriendo.** Si la apagás o el server se cae, la familia se queda sin app.
- La IP local puede cambiar si reiniciás el router o el DHCP renueva. Si pasa, vuelven a hacer `ipconfig` y avisás.

---

## Opción 3 — Tunnel público (familia desde cualquier lado)

Cuando querés que entre tu primo de Mendoza, tu hermano que está laburando en otra red, etc. Usás un tunnel que expone tu localhost a internet con una URL pública. Sin abrir puertos del router.

### Cloudflare Tunnel (gratis, sin cuenta para uso temporal)

```bash
# Instalar cloudflared (una sola vez):
# Windows: https://github.com/cloudflare/cloudflared/releases (descargá el .exe)
# macOS: brew install cloudflared

# Levantar el tunnel apuntando a tu dev server:
cloudflared tunnel --url http://localhost:8080
```

Te imprime una URL del estilo `https://xyz-random.trycloudflare.com`. Esa URL la pasás por WhatsApp y entran desde donde sea.

**Pros**: HTTPS gratis, sin cuenta, no abre puertos.
**Contras**: la URL cambia cada vez que reiniciás el tunnel. Para una URL fija necesitás cuenta de Cloudflare + dominio propio.

### Alternativas

- **ngrok** (`ngrok http 8080`) — clásico, requiere cuenta gratis.
- **Tailscale** — VPN privada, todos los miembros se conectan a la misma red virtual. Ideal si la familia ya usa Tailscale.

---

## Modo producción — ver `docs/deploy.md`

Para que familia y amigos entren **desde cualquier lugar** sin que tu PC esté prendida, deployás a **Cloudflare Workers gratis y permanente**. URL pública 24/7, HTTPS, edge global.

Guía completa con secrets, Supabase Auth, custom domain y troubleshooting: [`docs/deploy.md`](./deploy.md).

TL;DR:

```bash
npx wrangler login
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY  # del Supabase dashboard
npx wrangler secret put API_FOOTBALL_KEY            # ca5696...
npm run deploy                                       # te da la URL publica
```

---

## Tips finales

- Si el dev server da problemas raros de cache, borrá `node_modules/.vite` y `.tanstack/` y reiniciá.
- Si cambiás cosas en `.env`, **reiniciá** `npm run dev` (no toma cambios en caliente).
- El primer load del dev server es lento (compila on-demand). Después es instantáneo.
- En el teléfono la versión móvil ya está optimizada — si ves algo raro, probá hard refresh (cerrar y volver a abrir la pestaña).

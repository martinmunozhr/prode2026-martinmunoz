
# Plan integral — Prode Mundial 2026 listo para producción

> **Antes de arrancar:** necesito que me pases tu email de admin en el siguiente mensaje. Lo voy a hardcodear en el trigger `handle_new_user` para que cuando te registres seas admin automáticamente.

---

## Diagnóstico actual (qué está roto / faltante)

| Área | Estado | Problema |
|---|---|---|
| DB equipos/partidos | ✅ 48 teams, 72 matches | Solo grupos. Faltan eliminatorias por slot (1A vs 2B, etc.) |
| Predicciones | ✅ tabla + RLS | Nadie las usa, `points_earned` nunca se calcula |
| `mock-data.ts` | ❌ usado en home/fixture/ranking/equipos/bola | Datos hardcodeados, no DB |
| Players / planteles | ❌ no existe en DB | Hoy son random genéricos |
| Goleadores / stats | ❌ no existe | Bola de Cristal pide texto libre |
| Admin | ❌ existe `app_role` pero sin UI ni asignación | Nadie es admin |
| API real | ❌ | Sin sync de fixture/resultados/planteles |
| Power ranking | ❌ | Imposible calcular "resultado más probable" |
| Realtime | ❌ | Cambios no propagan |
| Auth Google | ❌ | Solo email/password |
| Recálculo de puntos | ❌ | Aunque carguemos resultados, nada actualiza |
| Ranking real | ❌ | Lee `mock-data` |

---

## Bloques de trabajo

### 1. Base de datos — esquema definitivo

**Migraciones nuevas:**

- `players` — id, team_id (FK), api_football_id (nullable), name, number, position, age, club, photo_url, rarity. Index por team_id.
- `match_events` — id, match_id (FK), player_id (FK), minute, type (`goal`|`assist`|`yellow`|`red`|`og`). Para tracking de goleadores live.
- `power_rankings` — team_id (PK), elo (default 1500), fifa_rank, last_updated. Inicializado con FIFA actual.
- `tournament_awards` — id PK fija (1), goleador_player_id, mejor_jugador_player_id, mejor_arquero_player_id, fair_play_team_id, campeon_team_id, locked_at. Resultados oficiales para scoring de Bola de Cristal.
- `crystal_ball` (existente) — migrar columnas `*_nombre` → `*_player_id` (FK a players). Agregar `subcampeon_id`.
- `predictions` — agregar `pred_winner` (text: home/draw/away) computado, índice `(user_id, match_id)` único.
- `app_settings` (key/value) — para flags admin (e.g. `season_started`, `api_sync_enabled`, ELO `k_factor`).
- `match_predictions_cache` — vista materializada o tabla con stats agregadas por partido (% que predijo cada resultado), refresca on-demand.

**Triggers/funciones:**

- `recalc_match_predictions(match_id)` — al cambiar `matches.status='finished'`, recorre todas las predictions y recalcula `points_earned` con multiplicadores por fase (Grupos x1, 16avos x1, Octavos x1.5, Cuartos x2, Semis x2.5, 3er x2, Final x3). 1pt acierto V/E/D, 3pts marcador exacto.
- `recalc_crystal_ball()` — al actualizar `tournament_awards`, recorre toda la tabla `crystal_ball` y actualiza `points_earned`.
- `update_elo_after_match()` — al finalizar un partido, ajusta ELO de ambos equipos (K=20, fórmula clásica con margen de gol).
- `auto_lock_predictions()` — RLS ya bloquea, pero agregamos `predictions.locked_at` para histórico.
- Trigger en `auth.users` extendido: si `email = $ADMIN_EMAIL`, asignar rol `admin` además de `user`.

**Realtime:** publicar `matches`, `predictions` (para tu user), `tournament_awards`, `match_events`.

---

### 2. API-Football — sync inteligente con presupuesto de 100 req/día

**Edge function `sync-api-football`** con tres modos:

| Modo | Costo aprox | Cuándo |
|---|---|---|
| `bootstrap` (admin manual) | ~50 req | Una sola vez: levanta fixture oficial + planteles confirmados de 48 selecciones |
| `live` (cron cada 15 min durante partidos) | ~3-4 req/ciclo | Solo se dispara si hay partido en estado live según fixture (ahorra cuota en días sin partidos) |
| `daily` (cron 1 vez/día 6 AM) | ~5 req | Refresca standings, planteles que cambiaron, fixture |

- Tabla `api_sync_log` para auditar consumo (timestamp, endpoint, requests_used, response_summary).
- Counter diario en `app_settings.api_requests_today` con reset a las 0 UTC; función no dispara si > 90.
- **Override manual desde admin**: cada partido tiene botón "Cargar resultado a mano" que setea score + status='finished' y dispara recálculo. Independiente del API.
- Mapping `api_football_id` en `teams`, `players` y `matches` para idempotencia.
- Secret `API_FOOTBALL_KEY` — te la pido apenas confirmes el plan.

**Crons (pg_cron + pg_net):**
- `*/15 * * * *` → llama `/api/public/hooks/sync-live` (server route) que decide si hay partido activo.
- `0 6 * * *` → `/api/public/hooks/sync-daily`.
- `0 */6 * * *` → `/api/public/hooks/refresh-standings` (clasificación de grupos calculada en SQL desde matches finished).

---

### 3. Power Ranking + Predictor ELO

- Tabla `power_rankings` inicializada con ranking FIFA Oct 2025 (lo cargo hardcoded en migration).
- Función SQL `predict_match(home_id, away_id)` que devuelve:
  - `prob_home`, `prob_draw`, `prob_away` (basado en diferencia ELO + ventaja local cuando aplica)
  - `expected_goals_home`, `expected_goals_away` (modelo Poisson simple λ derivado de ELO)
  - `most_likely_score` (top 3 marcadores con mayor probabilidad)
- Después de cada partido finalizado, trigger ajusta ELO con K=20 modulado por fase (Final pesa más).
- Endpoint admin `/admin/predictor` muestra para cada partido próximo el top-3 marcadores probables + % cada outcome. **Esta es la "ventana de Resultados más probables" que pediste.**

---

### 4. Panel admin completo (`/admin`)

Layout `_admin.tsx` protegido con `beforeLoad` + `has_role('admin')`. Subrutas:

- `/admin` — dashboard: usuarios totales, predicciones hoy, próximos partidos, requests API consumidas, errores recientes.
- `/admin/partidos` — tabla de los 104 partidos. Inline edit de score + status. Botón "Recalcular puntos" por partido. Bulk action.
- `/admin/equipos` — editar grupos, banderas, planteles (si API falla). Botón "Re-sync este equipo desde API".
- `/admin/usuarios` — lista profiles, toggle rol admin, ver predicciones de cualquier user.
- `/admin/predictor` — vista de "Resultados más probables" (sección 3).
- `/admin/awards` — setea ganadores oficiales del torneo (campeón, goleador, etc.) → dispara recálculo crystal ball.
- `/admin/sync` — botones manuales: "Sincronizar fixture", "Sincronizar planteles equipo X", "Forzar refresh standings". Muestra log y cuota restante.
- `/admin/settings` — flags (k_factor ELO, fechas, modo torneo activo).

---

### 5. Migrar todo lo que lee mock → DB

Loaders en cada ruta:

- `index.tsx` — `getUpcomingMatches(3)` desde DB; ranking desde view `v_ranking` que calcula `SUM(points_earned)` por user.
- `fixture.tsx` — partidos por grupo desde DB.
- `ranking.tsx` — view `v_ranking` con tiebreakers (puntos, exactos, racha).
- `equipos.tsx` y `equipos.$equipoId.tsx` — teams + players desde DB.
- `bola-de-cristal.tsx` — selectores de player desde DB (con search async, no inputs de texto). Campeón = select de teams.
- `insights.tsx` — recalcular sobre predictions reales del user logueado.
- Eliminar `src/lib/mock-data.ts` y `src/lib/real-squads.ts` después de migrar (dejar solo tipos en `src/lib/types.ts`).

**Loaders con `createServerFn`** para cachear queries pesadas (ranking, standings).

---

### 6. Auth Google + onboarding

- Habilitar Google OAuth via `lovable.auth.signInWithOAuth("google")`.
- Botón "Continuar con Google" en `/login` y `/registro`.
- Trigger `handle_new_user` extendido: si signup vía Google sin username, generar uno desde email; mantener flow de favorite_team que ya tenés. Si email == `$ADMIN_EMAIL`, agregar rol admin.
- Redirect post-login a `/mis-pronosticos` si torneo activo, sino `/perfil` para completar avatar/equipo favorito.

---

### 7. Realtime + UX en vivo

- Suscripción a `matches` en `MatchCard`: si pasa a `live` o `finished` con score, animación de actualización.
- Suscripción a `predictions` del user: si admin recalcula, refresca puntos sin reload.
- Suscripción a `tournament_awards` en bola-de-cristal.
- Toast (sonner) cuando un partido propio se finaliza: "🎯 Acertaste 3 pts en MEX 2-1 CAN" o "❌ Err, MEX 2-1 CAN — perdiste".
- Indicador "EN VIVO" pulsante en `MatchCard` con minuto si `status='live'`.

---

### 8. UX/UI — pulido visual y QA

- **Empty states** profesionales en todas las rutas (sin predicciones, sin partidos, sin ranking todavía).
- **Skeleton loaders** uniformes mientras cargan loaders (no más flashes).
- **Mobile**: revisar todos los breakpoints. Tabla ranking → cards en mobile. Fixture group selector → bottom sheet.
- **Onboarding modal** primer login: 3 slides (cómo se puntúa, bola de cristal, álbum).
- **Página `/reglas`** nueva con tabla de puntuación + multiplicadores (link desde footer y desde modal).
- **Compartir predicciones**: botón "Compartir mi pronóstico" genera imagen OG dinámica (server route `/api/og/prediccion/$id`) para WhatsApp.
- **Página 404** custom con onda mundialista.
- **Footer**: links a reglas, créditos, contacto, repo.
- **Accesibilidad**: aria-labels en todos los botones de score, focus visible, contraste AA validado.
- **Performance**: lazy-load imágenes de jugadores, React.memo en `PlayerCard` (son muchas), virtualización en ranking >100 usuarios.
- **Reglas tipográficas**: dejar `font-display` solo para H1/H2, body en `Inter` siempre.

---

### 9. QA + tests automáticos

- Extender `scripts/smoke-tests.mjs`: agregar `/admin/*` (con auth mock), `/reglas`, flow completo de crear predicción.
- Test SQL con `pgTAP` no — uso script Node que valida: `recalc_match_points` con casos conocidos, `predict_match`, RLS de admin.
- `docs/qa-checklist.md` actualizado con checklist por rol (visitante, user, admin).

---

### 10. Limpieza / deuda técnica

- Borrar `src/lib/mock-data.ts`, `src/lib/real-squads.ts` (mover tipos a `src/lib/types.ts`).
- Consolidar todos los `useEffect` de fetch en loaders (ya hay un patrón).
- Un solo `useAuth` provider (ya está, validar que no se use `supabase.auth` directo en componentes).
- Variables de entorno: documentar las nuevas (`API_FOOTBALL_KEY`, `ADMIN_EMAIL`).

---

## Orden de ejecución (un solo drop, secuencial)

1. **Migraciones SQL** — todo el esquema nuevo + triggers + ELO + power ranking inicial + datos seed + admin email hardcoded.
2. **Auth Google** — habilitar + botones.
3. **Server functions/routes** — API-Football sync, predict_match wrapper, recálculo manual, OG dinámico.
4. **Migrar todas las rutas a DB** + eliminar mock-data.
5. **Panel admin** completo.
6. **Realtime subscriptions** + toasts.
7. **UX polish** (empty states, skeletons, onboarding, /reglas, 404, footer).
8. **Crons** pg_cron sobre las server routes.
9. **Smoke tests** extendidos + QA manual checklist.
10. Te pido `API_FOOTBALL_KEY` cuando llegue el momento (paso 3).

---

## Lo que NO entra (por elección consciente)

- App móvil nativa.
- Pagos / premios reales.
- Chat entre usuarios.
- Apuestas con dinero (esto es un prode familiar).
- Notificaciones push (queda la base de toasts; push requiere PWA + service worker, fase posterior).

---

## Costo estimado

Es un drop grande, va a ser largo y consumir varios créditos (estimado: trabajo equivalente a 8-12 mensajes normales en uno solo). Voy a ir haciendo todo de corrido sin pedirte confirmación entre pasos, salvo cuando necesite la API key y el email admin.

**Lo que necesito de vos antes de arrancar:**
1. Email admin (para hardcodear en el trigger).
2. Confirmación del plan.
3. Cuando te pida la `API_FOOTBALL_KEY`, pegarla en el secret popup que aparezca.

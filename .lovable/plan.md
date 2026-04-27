# Estado actual ✅

Lo que **ya está funcionando** end-to-end:
- **Base de datos**: 48 equipos, 72 partidos, 48 power rankings (ELO 1500), tournament_awards inicializado.
- **Scoring automático**: triggers SQL que calculan resultado (1 pt acierto / 3 pts exacto), goleadores (+1 pt × multiplicador de fase), Bola de Cristal (10/7/7/5/3) y actualizan ELO.
- **Multiplicadores**: Grupos x1, Octavos x1.5, Cuartos x2, Semis x2.5, 3er x2, **Final x3**.
- **Goleadores por partido**: tabla + validación SQL + UI integrada (acepta 1 jugador haciendo varios goles).
- **Admin panel** (`/admin/*`): dashboard, partidos, jugadores, sync API-Football, predictor Poisson.
- **API-Football**: endpoint cron + `pg_cron` diario a las 10:00 UTC, contador de 100 req/día.
- **Auth**: signup/login + Google OAuth, auto-asignación de rol admin a `martinmunoz.rrhh@gmail.com`.
- **Onboarding modal**: primer login muestra reglas.

# Lo que falta para estar 100% listo ⚠️

Detecté **5 huecos críticos** y varias mejoras de pulido:

## 1. Rutas que aún usan mock-data (CRÍTICO)
Estas pantallas muestran datos falsos en vez de leer de Supabase:

| Ruta | Problema | Fix |
|---|---|---|
| `/fixture` | Lee `matches` mock | Migrar a query Supabase con filtro por grupo/fase |
| `/ranking` | Lee `ranking` mock | Calcular ranking real desde `predictions.points_earned` + `crystal_ball.points_earned` agrupado por `user_id` |
| `/equipos` y `/equipos/$equipoId` | Lee `teams` mock | Leer de tabla `teams` + `players` + `power_rankings` |
| `/insights` | Lee mock | Calcular stats reales (partidos jugados, goles totales, top scorer) |

## 2. Planteles vacíos (BLOQUEANTE para goleadores)
- `players` tiene **0 filas**. Sin jugadores cargados, la sección de goleadores queda inutilizable.
- **Acción**: en `/admin/sync` agregar botón "Importar planteles oficiales" que llame a API-Football `/players/squads` por cada uno de los 48 equipos. Costo: ~48 requests (una sola vez cuando FIFA confirme listas).
- Mientras tanto: agregar **fallback de carga manual** en `/admin/jugadores` (form simple: nombre, posición, dorsal, equipo).

## 3. Realtime no enganchado en frontend
- Las tablas tienen `REPLICA IDENTITY FULL` y están en `supabase_realtime`, pero ninguna ruta se suscribe a cambios.
- **Acción**: en `/` (Home), `/fixture`, `/ranking` y `/mis-pronosticos` agregar `supabase.channel().on('postgres_changes', ...)` para que cuando el admin cargue un resultado, los puntos y rankings se actualicen sin recargar.

## 4. Bola de Cristal — selectores incompletos
- El form usa inputs de texto libre para goleador/mejor jugador/arquero. Para que coincida con `tournament_awards` al cierre, debe ser **autocompletado desde `players`**.
- **Acción**: reemplazar inputs por Combobox (shadcn `Command`) que busque en `players` filtrando por posición (FWD para goleador, GK para arquero).

## 5. Falta cargar el **fixture oficial** del Mundial 2026
- Los 72 partidos de fase de grupos están, pero **faltan los 32 partidos de fase final** (Dieciseisavos en adelante) con sus placeholders ("Ganador A1 vs Mejor 3°", etc.).
- **Acción**: migración SQL que inserte los 32 matches restantes con `home_id`/`away_id` como TBD y se actualicen automáticamente cuando termine la fase de grupos (trigger).

## 6. UX/UI — pulido para usuarios no técnicos
- **Tooltips de scoring** en `/mis-pronosticos`: ya está el banner pero falta tooltip por partido mostrando "Esta es la Final → puntos x3".
- **Estado vacío** en `/mis-pronosticos` cuando no hay partidos próximos: actualmente queda gris.
- **Avatar inicial** en perfil: el `avatar_color` se guarda pero no se renderiza con la inicial del username.
- **Compartir ranking** (botón "Compartir mi posición" con Web Share API).
- **PWA básica**: manifest + ícono para instalar en mobile.

## 7. Admin — features faltantes
- **Cargar evento manual** (gol, tarjeta) en `/admin/partidos`: hoy solo se puede cargar el resultado, no los goleadores. Sin esto, el sistema de goleadores no se puede testear sin esperar al cron.
- **Editar Bola de Cristal final** (`tournament_awards`): falta UI para que vos cargues campeón/goleador/etc. al final del torneo.
- **Recalcular puntos** (botón nuclear): por si se carga un resultado mal y se corrige.
- **Ver histórico de sync** (`api_sync_logs`): tabla simple para auditar consumo de API.

## 8. QA + smoke tests
- Correr el flujo completo manualmente: registro → onboarding → predicción → admin carga resultado → ver puntos sumados → ranking actualizado.
- Validar que las RLS bloqueen correctamente predicciones después del kickoff.
- Verificar que el cron job `pg_cron` esté ejecutándose (revisar `cron.job_run_details`).

---

# Plan de implementación (1 drop)

**Orden propuesto:**

1. **Fixture completo** → migración con los 32 partidos de fase final (placeholders).
2. **Migrar rutas a datos reales** → `/fixture`, `/ranking`, `/equipos`, `/equipos/$equipoId`, `/insights`.
3. **Realtime hooks** → suscripciones en Home, fixture, ranking, mis-pronósticos.
4. **Admin completo** → editor de eventos (goles), editor de awards, botón recalcular, log de syncs, formulario manual de jugadores.
5. **Importar planteles** → botón en `/admin/sync` que llame a API-Football (48 req).
6. **Bola de Cristal con combobox** → autocompletado desde `players`.
7. **Pulido UX** → tooltips de multiplicador, empty states, avatar con inicial, botón compartir, manifest PWA.
8. **QA E2E** → simular un partido completo con SQL y verificar que todo el pipeline funcione.

---

# ❓ Antes de arrancar — confirmá:

1. **Planteles**: ¿querés que **ya** intente importar los 48 planteles desde API-Football (consume ~48 de tus 100 req diarias), o lo dejamos como **botón manual** para que vos lo dispares cuando FIFA publique las listas oficiales (mayo/junio 2026)?
   - Recomiendo: **botón manual** — hoy las listas no están confirmadas, gastarías cuota al pedo.

2. **Fase final**: ¿usamos los placeholders genéricos del fixture FIFA ("1A vs 2B", etc.) o esperamos al sorteo real?
   - Recomiendo: **placeholders ahora**, el cron los actualizará automáticamente cuando terminen los grupos.

3. **PWA**: ¿la querés instalable en mobile (manifest + ícono) o lo dejamos para más adelante?

Si me decís "dale con todo" arranco con el orden propuesto y dejo los 3 puntos anteriores con la opción recomendada.
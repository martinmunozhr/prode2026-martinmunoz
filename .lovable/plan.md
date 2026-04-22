

# Fix álbum + integración de pendientes del MD

## Problema actual

El click en equipos no abre la vista de álbum. Causa más probable: el preview perdió conexión con el dev server (consola muestra `[vite] server connection lost. Polling for restart...`) y la ruta `/equipos/$equipoId` no se está sirviendo, aunque el código está bien escrito. Si tras el restart sigue fallando, hay un segundo sospechoso: el `index.tsx` no enlaza a `/equipos`, así que el flujo desde la home obliga a pasar por el header.

## Plan de fix + mejoras (3 bloques)

### 1. Estabilizar la navegación al álbum
- Verificar que `/equipos` y `/equipos/$equipoId` rutean bien tras restart; si la `routeTree.gen.ts` quedó vieja, forzar regeneración tocando un archivo de ruta.
- Agregar **CTA visible al álbum desde el home** (sección nueva "Tu álbum de figuritas" con 4-6 banderas destacadas linkeando a `/equipos/[id]`), para que no dependa solo del header.
- Defensa extra en el loader: si `getRoster` devuelve array vacío, mostrar estado vacío con mensaje en vez de página en blanco.

### 2. Adoptar lo bueno del proyecto anterior (del MD)

**Sistema de puntuación** (`src/lib/scoring.ts` nuevo, basado en el MD):
- 1 pt por resultado (V/E/D), 3 pts por marcador exacto (reemplaza, no suma).
- Multiplicadores por fase: Grupos x1, Octavos x1.5, Cuartos x2, Semis x2.5, Final x3.
- (Sin goleadores aún — requiere modelo de jugadores en DB, queda para fase siguiente.)

**Bola de Cristal** (ruta nueva `/bola-de-cristal`):
- Predicciones del torneo: Campeón (10 pts), Goleador (7), Mejor jugador (7), Mejor arquero (5), Fair Play (3).
- Countdown al inicio del Mundial (11 jun 2026) que bloquea ediciones.
- Tabla nueva `crystal_ball` en Lovable Cloud + RLS.

**Insights / Radiografía del Prode** (ruta nueva `/insights`):
- Análisis simple por usuario: % de aciertos exactos vs parciales, equipos que más/menos prediciste ganando, racha actual.

**Pendientes UX rápidos del MD**:
- Toggle visible de dark mode en el header.
- Selector de color de avatar en `/perfil` (ruta nueva, hoy no existe).
- Scroll-to-top al cambiar de grupo/fase en `/mis-pronosticos`.
- Cards del top-3 visibles también en mobile en `/ranking`.
- Inputs numéricos: bloquear cambio por scroll (`onWheel={e => e.currentTarget.blur()}`).

### 3. Lo que NO hacemos en esta iteración (pero queda planificado)
- Sync de planteles vía API-Football (requiere API key del usuario, fase posterior).
- Partidos de eliminatorias generados por slot ("1A vs 2B"): hoy solo hay grupos.
- Goleadores como entidad: requiere tabla `players` poblada — la dejamos cuando tengas la API.
- Panel admin `/admin` para cargar resultados oficiales: lo armamos cuando definamos el primer admin.

## Detalles técnicos

```text
Rutas nuevas a crear:
  src/routes/bola-de-cristal.tsx
  src/routes/insights.tsx
  src/routes/perfil.tsx

Archivos nuevos:
  src/lib/scoring.ts        (calcularPuntos por predicción + por fase)
  src/lib/insights.ts       (estadísticas por user)
  src/components/theme-toggle.tsx
  src/components/avatar-color-picker.tsx
  src/components/album-preview.tsx   (sección home → álbum)

Migraciones SQL:
  + tabla crystal_ball (id, user_id unique, locked, campeon_id,
    goleador_id, mejor_jugador_id, mejor_arquero_id, fair_play_id,
    points_earned)
  + RLS: select público, insert/update solo own user, lock por fecha
  + columna profiles.avatar_color ya existe

Header:
  + ítem "Bola de Cristal" y "Insights"
  + ThemeToggle al lado del avatar

Home (src/routes/index.tsx):
  + sección AlbumPreview con 6 banderas top linkeando al detalle
```

## Orden de ejecución

1. Restart + verificación rápida del álbum (5 min).
2. AlbumPreview en home + scroll-to-top + theme toggle + scroll wheel fix (UX rápidas).
3. `/perfil` con cambio de color de avatar.
4. `scoring.ts` + integrarlo al `MatchCard` cuando el partido está finalizado.
5. Tabla `crystal_ball` + ruta `/bola-de-cristal` con countdown y form.
6. `/insights` con stats del usuario logueado.


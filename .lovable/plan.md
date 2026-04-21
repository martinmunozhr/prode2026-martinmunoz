
# Prode Mundial 2026 — Reconstrucción mejorada

Reconstruyo el proyecto del repo en Lovable con un enfoque **visual-first deportivo dramático**, usando mock data al inicio para iterar rápido en UX. Las integraciones con APIs reales (fixtures, planteles, resultados live) quedan planificadas como fases posteriores.

---

## Fase 1 — Visual base + estructura (foco de esta iteración)

**Objetivo:** que la app *se sienta* como un prode atractivo y profesional, aunque la data sea simulada.

### Identidad visual
- **Tema oscuro deportivo**: fondos profundos (azul medianoche / negro), acentos neón (verde césped, dorado trofeo, rojo alerta).
- **Tipografía condensada bold** estilo broadcast (Oswald / Bebas Neue para titulares, Inter para texto).
- **Gradientes y glows** en cards de partidos, badges de equipos, contadores.
- **Animaciones sutiles**: countdowns que pulsan, hover en figuritas, transiciones entre vistas.
- Banderas circulares grandes, scores tipo marcador estadio.

### Estructura de rutas (TanStack Start, separadas para SEO)
- `/` — **Home/Landing**: hero con countdown al Mundial, CTA "Sumate al prode", highlights de próximos partidos, top 3 del ranking.
- `/fixture` — Calendario completo de partidos por fase (grupos, octavos, etc.), filtrable por fecha y grupo.
- `/mis-pronosticos` — Cards de partidos pendientes con inputs de marcador, badge de "ya cargado / pendiente / cerrado".
- `/ranking` — Tabla de posiciones global, podio destacado arriba.
- `/equipos` — Grilla de las 48 selecciones con banderas.
- `/equipos/$equipoId` — Detalle del equipo + **álbum de figuritas** (26 jugadores con cards estilo Panini, brillos holográficos en estrellas).
- `/login` y `/registro` — Auth (preparadas, pero sin backend aún).

### Componentes clave
- `MatchCard` — Equipo vs Equipo con banderas, hora, estadio, input de pronóstico inline.
- `PlayerCard` — Figurita con foto, posición, número, dorsal, rareza visual.
- `RankingRow` — Posición, avatar, nombre, puntos, racha.
- `CountdownHero` — Reloj gigante al próximo partido / kickoff del Mundial.
- `GroupTable` — Tabla de grupo con equipos, PJ, PG, PE, PP, GF, GC, Pts.

### Mock data
- Fixture realista del Mundial 2026 (48 equipos, formato nuevo de 12 grupos de 4).
- Planteles de muestra (26 jugadores genéricos por equipo, expandibles luego).
- Usuarios y rankings ficticios para poblar la tabla.
- Resultados parcialmente cargados para mostrar puntajes.

---

## Fase 2 — Auth + lógica del prode (siguiente iteración, post-aprobación visual)

- Login con email/password vía Lovable Cloud.
- Tabla `profiles` (username, avatar, equipo favorito).
- Tabla `predictions` (user_id, match_id, home_score, away_score, locked_at).
- Tabla `matches` y `teams` con seed inicial.
- Lógica de puntaje: 3 pts resultado exacto, 1 pt ganador correcto, 0 pts incorrecto (configurable).
- RLS: cada usuario solo ve/edita sus propios pronósticos; resultados oficiales solo admin.
- Cierre automático de pronósticos al inicio del partido.

## Fase 3 — Álbum de figuritas con datos oficiales

- Conectar a una API de fútbol (ej: [API-Football](https://www.api-football.com/), free tier) para traer planteles reales de las 48 selecciones.
- Almacenar en Lovable Cloud (cache) para no quemar requests.
- Sistema de "figuritas obtenidas" (gamificación opcional: completás el álbum cargando pronósticos).

## Fase 4 — Resultados automáticos

- Job programado (server function + cron externo) que consulta API de resultados oficiales.
- Cálculo automático de puntajes al finalizar cada partido.
- Notificaciones in-app cuando se actualiza tu posición en el ranking.

## Fase 5 — Bugs y pulido del repo original

- Una vez que tengamos la base sólida, reviso el repo de Martin para detectar features/lógica útil que valga la pena portar (formato de puntajes, reglas especiales, etc.).

---

## En esta primera implementación entrego

✅ Identidad visual completa (theme oscuro deportivo, tipografías, tokens de color)
✅ Las 7 rutas listas con contenido mockeado y diseño pulido
✅ Todos los componentes clave (MatchCard, PlayerCard, RankingRow, etc.)
✅ Responsive mobile-first
✅ Navegación funcional entre secciones
✅ Mock data realista del Mundial 2026

❌ Aún sin auth real, sin DB, sin API externa (Fases 2-4)

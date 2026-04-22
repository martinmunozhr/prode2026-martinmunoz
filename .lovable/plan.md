
# Próximo paso para el álbum: jugadores reales

El álbum ya existe visualmente y se ve como Panini, pero los 26 nombres por equipo son placeholders ("Jugador 1, Jugador 2…"). Para rematarlo hay tres caminos — elegí uno y avanzo.

## Opción A — Planteles reales hardcodeados (rápido, sin API)

Cargo manualmente los 26 convocados (o lista probable actual) de las **selecciones top** (Argentina, Brasil, Francia, España, Inglaterra, Portugal, Alemania, Países Bajos, Uruguay, Colombia, México, USA, ~12-15 equipos) en `mock-data.ts` con: nombre real, dorsal, posición, club actual, edad. Para los equipos restantes dejo el generador actual hasta tener API.

- ✅ Sin dependencias externas, sin costos, datos visibles ya
- ✅ Empuja el álbum a sentirse "de verdad" para los equipos que el usuario más va a abrir
- ❌ Trabajo manual, datos congelados (hay que actualizar a mano si cambia un convocado)

## Opción B — API de fútbol (datos vivos)

Conecto **API-Football** (free tier: 100 requests/día) vía edge function:
- Endpoint que trae plantel por país y lo cachea en una tabla `players` de Lovable Cloud
- Job que refresca cada X días para no quemar la cuota
- Foto real del jugador (la API la incluye) reemplaza la bandera en la card

- ✅ 48 equipos con datos reales y fotos
- ✅ Se actualiza solo
- ❌ Requiere API key del usuario (gratis, pero hay que registrarse en api-football.com)
- ❌ Más complejidad: tabla `players`, edge function, cache logic

## Opción C — Subir el nivel visual del álbum primero (sin tocar datos)

Antes de meter datos reales, mejoro el álbum visualmente:
- Reemplazar la bandera-como-foto por **avatares ilustrados generados con IA** (silueta deportiva estilizada por posición)
- Animación de "abrir sobre" al entrar a la página (las figuritas aparecen una por una)
- Vista de **figurita ampliada** al click (modal con stats, "rareza", botón "agregar al álbum")
- Contador "X / 26 figuritas obtenidas" como gamificación
- Filtros por posición / rareza

- ✅ El álbum se siente único y juega con la gamificación del prode
- ❌ Sigue con nombres genéricos hasta combinar con A o B después

## Mi recomendación

**A + C combinados**: cargo planteles reales para las ~15 selecciones favoritas (los equipos que la familia más va a abrir) y al mismo tiempo subo el nivel visual con modal de figurita ampliada y animación de apertura. La opción B (API real) la dejamos para Fase 3 cuando tengas ganas de gestionar la API key.

Decime cuál preferís y arranco.

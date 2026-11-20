# Protocolo reloj <-> teléfono

Los mensajes son JSON cortos que viajan por Wear Engine P2P: `{"t": "<tipo>", "d": {...}}`. Para datos grandes (audio o imágenes) se usa la transferencia de archivos de P2P.

Dirección: **R→T** va del reloj al teléfono; **T→R** va del teléfono al reloj.

## Base
| t | Dir | d | Nota |
|---|---|---|---|
| `ping` | ambas | `{ts}` | |
| `pong` | ambas | `{ts}` | Responde con el mismo `ts` |
| `err` | ambas | `{code, msg}` | |

## Música
| t | Dir | d |
|---|---|---|
| `media.get` | R→T | `{}` |
| `media.state` | T→R | `{app, title, artist, playing, pos, dur, vol}` |
| `media.cmd` | R→T | `{a: "play"\|"pause"\|"next"\|"prev"\|"vol+"\|"vol-"}` o `{a: "vol", v: 0..100}` (slider del reloj) |

## Spotify (playlists)
Las páginas son de 15 elementos. Los textos llegan recortados a 40 caracteres para cuidar la memoria del reloj. El id especial `liked` representa "Tus me gusta".

| t | Dir | d |
|---|---|---|
| `sp.lists` | R→T | `{off}` |
| `sp.lists.r` | T→R | `{off, total, liked?, items: [{id, n, c}]}`: `liked` (el número de canciones) solo llega cuando `off` es 0 |
| `sp.tracks` | R→T | `{id, off}` |
| `sp.tracks.r` | T→R | `{id, off, total, locked, items: [{n, a}]}`: `locked` vale true en playlists que no son tuyas, porque Spotify no da su contenido |
| `sp.play` | R→T | `{id, idx?}`: sin `idx` reproduce desde el inicio |
| `sp.play.r` | T→R | `{ok}` |
| `sp.err` | T→R | `{msg}`: el mensaje viene listo para mostrarlo |

## Cámara
| t | Dir | d |
|---|---|---|
| `cam.open` | R→T | `{}`: abre la cámara en el teléfono (encima de la pantalla de bloqueo) |
| `cam.shoot` | R→T | `{timer: 0\|3\|10}`: si la cámara está cerrada, la abre y dispara (cambia a foto si estaba en video) |
| `cam.mode` | R→T | `{m: "photo"\|"video"}`: se ignora mientras hay una foto o un video en curso |
| `cam.rec` | R→T | `{a: "start", timer}` (cambia a video si hace falta y graba tras el temporizador) o `{a: "stop"}` (detiene, o cancela el temporizador) |
| `cam.flip` | R→T | `{}`: frontal ↔ trasera (no mientras graba) |
| `cam.close` | R→T | `{}`: al salir de la pantalla del reloj; si está grabando, primero guarda el video |
| `cam.state` | T→R | `{open, front?, mode?: "photo"\|"video", rec?}` |
| `cam.count` | T→R | `{s}`: cada segundo del temporizador |
| `cam.rec.state` | T→R | `{on}`: empezó o terminó la grabación. El reloj cuenta los segundos por su cuenta. |
| `cam.result` | T→R | `{ok, name, video}` o `{ok: false, msg, video}` |

Las fotos se guardan en `Pictures/JJAS Tools` y los videos (MP4, con sonido si
se dio permiso de micrófono) en `Movies/JJAS Tools` (MediaStore).

## Tipo de cambio (Convertidor)
| t | Dir | d |
|---|---|---|
| `fx.get` | R→T | `{}`: pide el tipo de cambio diario USD → MXN |
| `fx.rate` | T→R | `{usd, date}`: el reloj lo guarda en su caché local |

## QR
| t | Dir | d |
|---|---|---|
| `qr.list` | T→R | `[{id, label, size, bits}]`: `bits` es la matriz en base64, fila por fila |
| `qr.del` | R→T | `{id}` |

## Navegación
| t | Dir | d |
|---|---|---|
| `nav.step` | T→R | `{icon, dist, street, eta}` |
| `nav.end` | T→R | `{}` |

## Notas (Keep)
| t | Dir | d |
|---|---|---|
| `keep.sync` | R→T | `{}` |
| `keep.list` | T→R | `[{id, title, snippet, pinned, isList}]` |
| `keep.get` | R→T | `{id}` |
| `keep.note` | T→R | `{id, title, text?, items?: [{id, text, checked}]}` |
| `keep.check` | R→T | `{id, itemId, checked}` |

## Grabadora
| t | Dir | d |
|---|---|---|
| `rec.cmd` | R→T | `{a: "start"\|"pause"\|"stop"}` (plan B: graba el teléfono) |
| `rec.state` | T→R | `{recording, secs}` |

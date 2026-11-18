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
| `media.cmd` | R→T | `{a: "play"\|"pause"\|"next"\|"prev"\|"vol+"\|"vol-"}` |

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
| `cam.open` | R→T | `{}` |
| `cam.shoot` | R→T | `{timer: 0\|3\|10}` |
| `cam.flip` | R→T | `{}` |
| `cam.result` | T→R | `{ok, name}` |

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

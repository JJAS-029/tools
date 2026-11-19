# Plan de funciones (roadmap)

Última actualización: 2026-11-19. Mientras Huawei aprueba **Wear Engine**, solo
podemos hacer lo que corre **solo en el reloj**. Todo lo que necesita al teléfono
se prueba con el teléfono simulado.

## Límites del reloj (Fit 3, apps JS "lite")
- **Las apps no corren en segundo plano.** Solo funcionan mientras están
  abiertas: no hay geocercas ni alarmas propias con la app cerrada.
  → **Truco:** los avisos los publica la app del **teléfono** como notificación y
  Huawei Health los pasa al reloj solos.
- **No hay mapas ni conexión propia a internet.** Calles e imágenes las tiene
  que dibujar el teléfono y mandarlas.
- **La corona** solo mueve `list`, `slider` y `picker-view`, y **el `class` no
  acepta datos**: para cambiar cosas hay que usar `style` y `show`. Compila con
  `bash scripts/check_watch.sh` antes de abrir el Previewer.
- **Poca memoria por pantalla:** las listas se crean una sola vez y luego solo
  se cambian sus textos (ver `pages/bike`).

## Hecho ✅
| Función | Dónde corre | Estado |
|---|---|---|
| Música (control, volumen con la corona y color dinámico M3) | reloj + teléfono | probado en el Previewer y en el S23 |
| Playlists de Spotify | reloj + teléfono | probado en el S23 con tu cuenta |
| Cámara (obturador, temporizador y voltear) | reloj + teléfono | probado en el S23 |
| Baterías: bici (50 km) y reloj (estimado real) | solo reloj | probado en el Previewer |

## Siguiente: viable ya, sin depender de Huawei 🟢
### 1. Lugares (tags con GPS)
Guardas lugares con nombre (bici, carro, casa del Koala, trabajo…). Tocas uno y
te dice **a qué distancia está y hacia dónde ir**.
- **Viabilidad: alta.** El Fit 3 tiene GPS propio (`@system.geolocation`).
- **Dirección:** si el Fit 3 trae brújula (tú crees que sí; lo confirmamos en el
  reloj real), la flecha apunta de verdad con `@system.sensor` (compass). Si no,
  se calcula con el **rumbo de tus últimos pasos** más el punto cardinal ("380 m
  al noreste").
- **Mapa (con Wear Engine):** el teléfono descarga la zona (OpenStreetMap o el
  mapa estático de Google), dibuja el tag y tu posición, y le manda al reloj una
  **imagen de unos 400×400**. Hay que confirmar que la app del reloj puede mostrar
  una imagen recibida por P2P (que se guarda en su almacenamiento interno).
- **Extra:** si tienes la app abierta al llegar a un tag, te propone "¿Registrar
  viaje a Casa Koala?" para Baterías.

### 2. Contador con la corona
Para vasos de agua, repeticiones o vueltas. **Viabilidad: alta.** Es un
`picker-view` o `slider`.

### 3. Pomodoro y temporizadores con patrones de vibración
**Viabilidad: media.** Mientras la app está abierta funciona bien; con la app
cerrada el aviso tendría que venir del teléfono.

### 4. Dividir la cuenta y propinas
**Viabilidad: alta.** Una calculadora rápida que se maneja con la corona.

### 5. Hábitos del día (agua, medicinas, estirarse)
Anillos M3. **Viabilidad: alta** para registrarlos. Los recordatorios llegarían
como notificaciones del teléfono.

## Después de Wear Engine 🟡
### 6. Kilómetros de la bici desde tus entrenamientos
Tus salidas en bici se registran en Huawei Health. **La app del reloj no puede
leer ese historial.** El camino es **Huawei Health Kit** en la app del teléfono:
- Lee los entrenamientos de ciclismo (distancia), descuenta los km de la
  batería de la bici y se los manda al reloj.
- **Viabilidad: media.** Hay que solicitar Health Kit en AppGallery Connect,
  otra revisión como la de Wear Engine, con los permisos de "actividad/ejercicio".
- **Plan B:** botón "Iniciar viaje" en Baterías que mida los km con GPS. Pero
  no puede correr al mismo tiempo que un entrenamiento del reloj, porque en
  pantalla solo corre una app a la vez.

### 7. Llamar por WhatsApp desde el reloj
Contestar llamadas de WhatsApp en el reloj ya funciona. **Marcar desde el reloj
sí parece viable:**
- En el reloj eliges un contacto favorito y el teléfono abre la llamada de
  WhatsApp con un intent de contacto (`vnd.com.whatsapp.voip.call`).
- El audio debería irse al reloj igual que cuando contestas.
- También sirve para llamadas normales (`ACTION_CALL`).
- **Viabilidad: media.** WhatsApp no tiene una API oficial para esto (es un
  truco conocido que podría dejar de funcionar). Necesita permiso de contactos
  y de "mostrar sobre otras apps", que ya tenemos.
- **Mensajes rápidos ("Ya voy", "Llegué"):** solo se pueden enviar como
  **respuesta a una notificación** de WhatsApp que ya tengas. WhatsApp no deja
  enviar mensajes nuevos sin que toques "Enviar".

### 8. Calendario con diseño propio (M3)
No podemos cambiar el firmware, pero sí hacer **nuestro propio calendario**:
- El teléfono lee la agenda (Google/Samsung, `CalendarContract`) y manda el
  día y la semana al reloj, con chips de colores por calendario.
- **Viabilidad: alta** en cuanto haya Wear Engine.

### 9. Modos y rutinas de Samsung desde el reloj (Trabajo, Dormir…)
Botones en el reloj: Trabajo, Dormir, Manejo, No molestar, Silencio.
- **No molestar y Silencio: viabilidad alta.** La app del teléfono los cambia por
  sí misma (con el permiso de acceso a No molestar).
- **Modos de Samsung: viabilidad media, hay que probarlo.** No tienen API pública.
  Ideas, en orden:
  1. Que la rutina de Samsung se active con una **condición que provoquemos**
     (por ejemplo, abrir una pantalla de JJAS Tools o un cambio que
     controlemos).
  2. Mandar al reloj **atajos de Modos** si Samsung expone algún intent o
     acceso directo.
  3. Plan B: nuestros propios "modos" que hagan lo mismo (No molestar, volumen,
     brillo, Wi-Fi o Bluetooth donde Android lo permita).

### 10. Ya planeadas (plan original)
QR en el reloj (el reloj lite tiene un componente `qrcode` nativo), indicaciones
de Google Maps, notas de Keep y grabadora de voz, que se graba en el teléfono.

## Lluvia de ideas (2026-11-19): evaluación
| Idea | Viabilidad | Cómo | Qué lo complica |
|---|---|---|---|
| **🐨 Tamagotchi de Koala** | 🟢 Alta, solo reloj | Koala animado (`image-animator`) con hambre, ánimo y energía. Lo alimentas con **tus pasos** (sensor de pasos) y lo haces feliz con **tus viajes en bici** (Baterías). Como la app no corre en segundo plano, al abrirla se calcula lo que pasó mientras estuvo cerrada, como los tamagotchis reales. | Solo memoria por pantalla: animaciones de pocos cuadros. |
| **🎙️ Dictado / transcribir voz** | 🟡 Media | Si el reloj puede grabar, el audio va al teléfono, el teléfono lo transcribe y el texto vuelve al reloj o se guarda en Keep. | **Por verificar:** que una app lite pueda usar el micrófono. Si no, se graba con el micrófono del teléfono (lo que ya está en el plan). |
| **🖼️ Ver fotos de WhatsApp** | 🟡 Media | El teléfono toma la vista previa de la imagen que trae la notificación de WhatsApp, la reduce y la manda al reloj. | Solo funciona con las que llegan como notificación; WhatsApp no tiene API. |
| **🔊 Audios de WhatsApp** | 🟡 Transcritos, 🔴 escucharlos | **Escucharlos en el reloj no es viable:** las apps lite no tienen reproductor de audio y el Fit 3 no reproduce audio de apps. **Transcribirlos sí:** el teléfono convierte el audio en texto y el reloj lo muestra. | Hay que poder leer el archivo de voz desde el teléfono (carpeta de medios de WhatsApp): por verificar. |
| **⏰ Alarma inteligente (ciclos de sueño)** | 🔴 En vivo / 🟡 **por tendencias** | En vivo no se puede (la app no puede medir toda la noche). **Tu idea sí se puede:** la app del teléfono lee tu historial de sueño (**Health Kit**), calcula cada semana cuánto tardas en dormirte y cuánto duran tus ciclos, y te propone la mejor hora: al tocar "Me voy a dormir" en el reloj te sugiere despertar al final de un ciclo (p. ej. 6:50 en vez de 7:15) y **pone la alarma en el teléfono** (`AlarmClock`), que suena también en el reloj. | Necesita Health Kit (otra solicitud a Huawei). Sin Health Kit: versión aproximada con ciclos de 90 min y tu hora de dormir. |
| **🤖 Conexión con Claude** | 🟡 Media (con Wear Engine) | El reloj manda una pregunta (dictada, si hay micrófono, o de una lista) → el teléfono la manda a la API de Claude → la respuesta corta vuelve al reloj. También serviría para **resumir chats** o **audios transcritos**. | Necesita una API key de Anthropic guardada solo en el teléfono (cuesta por uso). Respuestas cortas para la pantalla. |
| **🎭 Stickers de WhatsApp** | 🟡 Media | Igual que las fotos, si la notificación trae la imagen del sticker. | Muchas veces la notificación solo dice "Sticker" sin imagen. |
| **📻 Walkie-talkie teléfono ↔ reloj** | 🔴 Baja | El reloj no puede reproducir audio de apps. Versión posible: lo que hablas en el teléfono llega **transcrito** al reloj, y del reloj al teléfono por dictado, si hay micrófono. | Sin reproductor de audio en lite. |
| **🃏 Anki / vocabulario de inglés** | 🟢 Alta | **AnkiDroid tiene una API pública** (ContentProvider): el teléfono lee tus tarjetas pendientes, el reloj te las muestra (tocas para voltear y calificas *Otra vez / Bien*) y la respuesta se registra en AnkiDroid. Mientras no haya Wear Engine, un mazo de prueba guardado en el reloj. | Tener AnkiDroid instalado. |
| **⚖️ Convertidor de unidades** | 🟢 Alta, solo reloj | Libras↔kg, °F↔°C, millas↔km, oz↔g, pies↔m y USD↔MXN (tipo de cambio del teléfono o puesto a mano). El número se gira con la corona (`picker-view`). | — |
| **🤚 Detección de caídas** | 🔴 No | Tendría que vigilar todo el tiempo y la app no corre en segundo plano. | — |
| **👋 Gestos (sacudir o girar la muñeca)** | 🟡 Solo con la app abierta | Con el acelerómetro (`@system.sensor`), solo en pantallas abiertas: **sacudir para tomar la foto** en Cámara o girar la muñeca para pasar la diapositiva. | No funciona en todo el sistema como el Apple Watch. |
| **🎥 Grabar video en Cámara** | 🟢 Alta | Botón de grabar y detener en el reloj, con cronómetro; el teléfono graba con CameraX (`VideoCapture`) y lo guarda en Movies/JJAS Tools. | — (**se nos pasó, va primero**) |
| **🧭 Aprovechar más el hardware** | — | Brújula → flecha real en Lugares. GPS → Lugares y velocidad en bici. Pasos → Koala. Micrófono → dictado, si se puede. | Una sola app abierta a la vez y nada en segundo plano. |

## Ideas mías (para valorar)
| Idea | Viabilidad | De qué trata |
|---|---|---|
| **🎤 Letras de canciones** | 🟡 | El teléfono busca la letra sincronizada de la canción que suena (por ejemplo LRCLIB, que es gratuita) y el reloj la muestra línea por línea en vivo, con los colores de Música. |
| **🗣️ Traductor de bolsillo** | 🟡 | Dictas (o eliges) una frase y Claude te la regresa en inglés. Combina con Anki para practicar. |
| **📜 Teleprompter** | 🟢 | Un texto del teléfono (o de Keep) que lees en el reloj y avanzas con la corona: discursos, recetas, listas. |
| **🎲 Para decidir** | 🟢 | Dado, moneda o ruleta que giras con la corona ("¿quién paga?", "¿qué cenamos?"). |
| **💞 Contador de días** | 🟢 | Días con el Koala, días para un viaje, racha de días en bici. |
| **🅿️ Parquímetro** | 🟢 | Guarda dónde dejaste el carro (Lugares) y cuánto pagaste; vibra cuando se acerca la hora. El aviso con la app cerrada llega como notificación del teléfono. |
| **🏋️ Intervalos (HIIT)** | 🟢 | Rutinas de trabajo y descanso con vibraciones distintas, sin teléfono. |
| **🚴 Modo bici en vivo** | 🟡 | Velocidad por GPS y autonomía restante mientras ruedas. No corre al mismo tiempo que un entrenamiento del reloj. |

## Orden sugerido (sin esperar a Huawei)
1. 🎥 Video en Cámara (rápido y se prueba completo en el S23).
2. 📍 Lugares (GPS, brújula si la tiene).
3. 🐨 Koala tamagotchi.
4. ⚖️ Convertidor de unidades.
5. 🃏 Anki con mazo de prueba en el reloj; con Wear Engine se conecta a AnkiDroid.

## Descartadas (ya vienen en el Fit 3)
- Encontrar mi teléfono.
- Linterna.

## Ideas sueltas por evaluar
- **"Salí de casa" / "Llegué":** un botón en el reloj que, por medio del
  teléfono, contesta el último chat de WhatsApp con "Ya llegué".
- **Recordatorio de cargar la bici:** cuando Baterías calcule que queda poco, el
  teléfono te manda una notificación que llega al reloj aunque la app esté cerrada.

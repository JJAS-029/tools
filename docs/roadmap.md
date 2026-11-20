# Plan de funciones (roadmap)

Última actualización: 2026-11-19. Mientras Huawei aprueba **Wear Engine**, solo
podemos hacer lo que corre **solo en el reloj** o **solo en el teléfono**. Lo que
necesita a los dos se prueba con el teléfono simulado.

## Límites del reloj (Fit 3, apps JS "lite")
- **Las apps no corren en segundo plano.** Solo funcionan mientras están
  abiertas: no hay geocercas ni alarmas propias con la app cerrada.
  → **Truco:** los avisos los publica la app del **teléfono** como notificación y
  Huawei Health los pasa al reloj solos.
- **No hay mapas ni conexión propia a internet.** Calles e imágenes las tiene
  que dibujar el teléfono y mandarlas.
- **No se puede escribir:** no hay teclado ni campo de texto, y casi seguro **no
  hay micrófono** para las apps (falta confirmarlo en el reloj real). Todo se
  diseña con plantillas, listas y la corona.
- **La corona** solo mueve `list`, `slider` y `picker-view`, y **el `class` no
  acepta datos**: para cambiar cosas hay que usar `style` y `show`. Compila con
  `bash scripts/check_watch.sh` antes de abrir el Previewer.
- **Poca memoria por pantalla:** las listas se crean una sola vez y luego solo
  se cambian sus textos (ver `pages/bike`).

## Hecho ✅
| Función | HML | Dónde corre | Hecho por | Estado |
|---|---|---|---|---|
| Menú principal | `index.hml` | solo reloj | Claude Code | probado en el Previewer |
| Música (control, volumen con la corona y barra sinusoidal M3) | `music.hml` | reloj + teléfono | Claude Code + Antigravity (onda) | probado en el Previewer y en el S23 |
| Playlists de Spotify | `playlists.hml`, `tracks.hml` | reloj + teléfono | Claude Code | probado en el S23 con tu cuenta |
| Cámara (foto, video, temporizador y voltear) | `shutter.hml` | reloj + teléfono | Claude Code (foto) + Antigravity (video) | probado en el S23 |
| Baterías: bici (50 km) y reloj (estimado real) | `battery.hml`, `bike.hml`, `watchbat.hml`, `batedit.hml` | solo reloj | Claude Code + Antigravity (onda) | probado en el Previewer |
| Mi jornada: barra de turno, dinero ganado en vivo y costo de junta | `work.hml`, `workedit.hml` | solo reloj | Antigravity | probado en el Previewer |
| Metro CDMX (12 líneas, 195 estaciones, transbordos) + Tarjeta MI | `metro.hml`, `metroline.hml`, `metrocard.hml` | solo reloj | Antigravity | probado en el Previewer |
| Convertidor de unidades (USD, lb, °F, mi, oz, ft) + dólar vía puente | `units.hml`, `unitconv.hml` | reloj + teléfono | Antigravity | probado en el Previewer |
| Now Brief (resumen del día, clima + alertas, efemérides, bici, jornada, MI) | `brief.hml` | reloj + teléfono | Antigravity | probado en el Previewer |
| Contador con la corona (Agua, Reps y Libre con metas) | `counter.hml` | solo reloj | Antigravity | probado en el Previewer |
| Dividir la cuenta y propinas con la corona | `tip.hml` | solo reloj | Antigravity | probado en el Previewer |
| Para decidir (dado, moneda, ¿qué cenamos?, sí/no) | `decide.hml` | solo reloj | Antigravity | compilado (falta Previewer) |
| QR en el reloj (componente `qrcode` nativo) | `qr.hml` | solo reloj | Antigravity | compilado (falta Previewer) |
| Hoy No Circula CDMX (placa y holograma) | `hnc.hml` | solo reloj | Antigravity | probado en el Previewer |
| Seguridad y bici: aviso cada hora por SMS, "¿Dónde estás?" automático y "¿Llevas todo?" al salir del Wi-Fi | *(solo Android)* | solo teléfono | Antigravity | compilado (listo para probar en el S23) |
| Lugares (tags GPS con distancia/flecha) + Prueba de sensores Fit 3 | `places.hml`, `placego.hml`, `hwtest.hml` | solo reloj | Antigravity | compilado y con pruebas unitarias (falta Previewer) |
| Koala científico tamagotchi (sprites de `koala_monitor`, pasos y viajes en bici) | `koala.hml` | solo reloj | Antigravity | compilado y con pruebas unitarias (falta Previewer) |
| Bici Kit (checklist, mantenimiento por km y direccionales nocturnas) | `bikecare.hml`, `signal.hml` | solo reloj | Antigravity | compilado (falta Previewer) |
| Pomodoro e Intervalos HIIT con patrones de vibración | `timer.hml` | solo reloj | Antigravity | probado en el Previewer |
| Hábitos del día (anillo ondulado M3 + racha diaria) | `habits.hml` | solo reloj | Antigravity | probado en el Previewer |
| Hora táctil en vibraciones (horas largas + cuartos cortos) | `vibeclock.hml` | solo reloj | Antigravity | compilado (falta Previewer) |
| Anki vocabulario inglés (mazo integrado de 15 tarjetas) | `anki.hml` | solo reloj | Antigravity | compilado (falta Previewer) |
| Contador de días (Koala, viaje y racha de bici) | `days.hml` | solo reloj | Antigravity | probado en el Previewer |
| Gastos rápidos con la corona y total de la semana | `spend.hml` | solo reloj | Antigravity | compilado (falta Previewer) |
| Simón dice con vibraciones y récord | `simon.hml` | solo reloj | Antigravity | probado en el Previewer |
| Teclado con la corona (autocompletado en español y notas rápidas) | `kbd.hml` | solo reloj | Antigravity | compilado (falta Previewer) |
| Teleprompter (guiones y tus notas del teclado con la corona) | `prompter.hml` | solo reloj | Antigravity | compilado (falta Previewer) |
| Modo bici en vivo (velocidad GPS, zonas de pulso con alerta y autonomía) | `ride.hml` | solo reloj | Antigravity | compilado (falta Previewer) |
| Gestos en Cámara (sacudir la muñeca para disparar) | `shutter.hml` | solo reloj | Antigravity | compilado (falta reloj real) |

---

# Ruta sugerida (todas las ideas)
Leyenda: 🟢 solo reloj · 🔵 solo teléfono · 🟡 reloj + teléfono (Wear Engine)
· 🟣 necesita Health Kit · ⚡ rápida (1 sesión).

### Fase 1: rápidas, sin esperar a Huawei
1. ~~🎥 **Video en Cámara**~~ ✅ hecho (Antigravity).
2. ~~💰 **Mi jornada: barra + dinero ganado**~~ ✅ hecho (Antigravity).
3. ~~🚇 **Metro CDMX** + 💳 **Tarjeta de Movilidad**~~ ✅ hecho (Antigravity).
4. ~~⚖️ **Convertidor de unidades**~~ ✅ hecho (Antigravity).
5. ~~☀️ **Now Brief (Resumen del día)**~~ ✅ hecho (Antigravity).
6. ~~🔢 **Contador con la corona**~~ ✅ hecho (Antigravity).
7. ~~🧾 **Dividir la cuenta y propinas**~~ ✅ hecho (Antigravity).
8. ~~🎲 **Para decidir** (dado, moneda, ruleta)~~ ✅ hecho (Antigravity).
9. ~~💸 **QR en el reloj** (cobro con CLABE, contacto, WhatsApp)~~ ✅ hecho (Antigravity).
10. ~~🚗 **Hoy No Circula**~~ ✅ hecho (Antigravity).

### Fase 2: teléfono solo (en paralelo, sin Huawei)
10. ~~🚴 **Aviso a tu mamá cada hora** ("Salí en bici" / "Llegué")~~ ✅ hecho (Antigravity).
11. ~~📍 **"¿Dónde estás?" automático** por SMS~~ ✅ hecho (Antigravity).
12. ~~🔑 **¿Llevas todo?** al salir del Wi-Fi~~ ✅ hecho (Antigravity).

### Fase 3: solo reloj, más trabajo
13. ~~🔬 **Prueba de hardware en el reloj real**~~ ✅ hecho (Antigravity — dentro de Lugares → Probar sensores).
14. ~~📍 **Lugares** (tags con GPS y flecha)~~ ✅ hecho (Antigravity).
15. ~~⌨️ **Teclado con la corona** (autocompleta palabras)~~ ✅ hecho (Antigravity).
16. ~~🐨 **Koala tamagotchi**~~ ✅ hecho (Antigravity — diseño pixel art de `koala_monitor`).
17. ~~🔧 **Mantenimiento de la bici por km** + ✅ **Checklist antes de salir**~~ ✅ hecho (Antigravity).
18. ~~↩️ **Direccionales en la muñeca**~~ ✅ hecho (Antigravity — dentro de Bici Kit).
19. ~~🍅 **Pomodoro** + 🏋️ **Intervalos (HIIT)** con vibraciones~~ ✅ hecho (Antigravity).
20. ~~💧 **Hábitos del día** (anillos M3)~~ ✅ hecho (Antigravity).
21. ~~📳 **La hora en vibraciones**~~ ✅ hecho (Antigravity).
22. ~~💞 **Contador de días**~~ ✅ hecho (Antigravity).
23. ~~💵 **Gastos rápidos**~~ ✅ hecho (Antigravity).
24. ~~🃏 **Anki con mazo de prueba**~~ ✅ hecho (Antigravity).
25. ~~📜 **Teleprompter** (texto guardado en el reloj)~~ ✅ hecho (Antigravity).
26. ~~❤️ **Zonas de pulso** + 🚴 **Modo bici en vivo** (velocidad por GPS)~~ ✅ hecho (Antigravity — dentro de Bici Kit → Mantto).
27. ~~👋 **Gestos** (sacudir para la foto)~~ ✅ hecho (Antigravity — en Cámara).
28. ~~🐍 **Juegos** (Simón con vibraciones)~~ ✅ hecho (Antigravity).

### Fase 4: en cuanto llegue Wear Engine (alta viabilidad)
29. 🚨 **Botón de emergencia (SOS)** 🟡
30. 📅 **Eventos y tareas** + 📝 **Notas rápidas** 🟡
31. 🗓️ **Calendario M3** 🟡
32. 🖱️ **Control de la PC** (el S23 como teclado y mouse Bluetooth) 🟡
33. 📊 **Estado del escritorio** 🟡
34. 🔕 **No molestar y Silencio** desde el reloj 🟡
35. 🚴 **Botón "Salí en bici" en el reloj** (conecta la fase 2) 🟡⚡
36. 🔋 **Recordatorio de cargar la bici** 🟡⚡
37. 🃏 **Anki conectado a AnkiDroid** · 💵 **Gastos a Google Sheets** 🟡
38. 🗺️ **Indicaciones de Google Maps** · 🌧️ **¿Me voy en bici?** 🟡
39. ✨ **Gemini** (y/o 🤖 Claude) · 🗣️ **Traductor** 🟡
40. 🎤 **Letras de canciones** · 🎵 **¿Qué canción es?** 🟡
41. 📍 **Mapa en Lugares** (imagen que dibuja el teléfono) 🟡
42. 💌 **Botón "pensando en ti"** 🟡⚡

### Fase 5: con Wear Engine, hay que probar o usan trucos
43. 📞 **Llamar por WhatsApp** y llamadas normales 🟡
44. 🟦 **Modos de Samsung** (Trabajo, Dormir…) 🟡
45. 🏠 **Google Home** · 📺 **Control de la tele** 🟡
46. 🖼️ **Fotos y stickers de WhatsApp** · 🔊 **Audios transcritos** 🟡
47. 💬 **"Ya llegué"** como respuesta al último chat de WhatsApp 🟡
48. 📒 **Notas de Keep** (solo personal) · 🎙️ **Grabadora / dictado** 🟡

### Fase 6: necesitan Health Kit (otra solicitud a Huawei)
49. 🚲 **Km de la bici desde tus entrenamientos** 🟣
50. ⏰ **Alarma inteligente por tendencias de sueño** 🟣 (versión aproximada sin
    Health Kit: ciclos de 90 min).

### No viables 🔴
| Idea | Por qué |
|---|---|
| Detección de caídas | La app tendría que vigilar todo el tiempo y no corre en segundo plano. |
| Escuchar audios de WhatsApp en el reloj | Las apps lite no reproducen audio (transcritos sí, fase 5). |
| Walkie-talkie con voz | Mismo motivo; solo se puede la versión transcrita. |
| Alarma de sueño en vivo | No puede medir toda la noche (por tendencias sí, fase 6). |
| Llamar directo al 911 desde una app | Android solo abre el marcador; hay que tocar "llamar". |
| Sistema operativo propio / flashear el Fit 3 | Ver "Detalles". |

### Descartadas (ya vienen en el Fit 3)
- Encontrar mi teléfono · Linterna · Respiración guiada.
- 🌎 **Alerta sísmica:** no hay que programarla; instala una app de alerta
  sísmica en el S23 y activa sus notificaciones en Huawei Health.

---

# Detalles por idea

## 🟢 Solo reloj
| Idea | De qué trata | Ojo |
|---|---|---|
| **☀️ Now Brief (Resumen del día)** | Una sola pantalla de resumen al despertar o durante el día, con tarjetas M3 tocables que abren cada app: saludo + fecha, **pila de la bici** (avisa si ≤ 25 %), **batería del reloj**, **Mi jornada** (turno / dinero hoy), **Tarjeta MI** (avisa si quedan ≤ 2 viajes) y **dólar**. Con Wear Engine suma **clima/lluvia (Open-Meteo, gratis)**, **próximo evento del calendario** y **batería del S23**. | Lee los mismos datos ya guardados en `storage`; no necesita segundo plano. |
| **💰 Mi jornada** | **Anillo M3** que se llena de tu hora de entrada a la de salida ("faltan 1 h 20 min"), con la comida marcada. **Calculadora de dinero:** pones tu **pago por hora** (editable con la corona) o tu sueldo de la nómina (quincenal o mensual) y las horas por día, y la app saca el pago por hora. Tocas **"Llegué"** (o usa la hora fija de entrada, p. ej. 9:00) y ves en vivo **"llevas \$432.50 hoy"**. Extras: total de la semana y de la quincena, horas extra (al pasar tu hora de salida, con su propio pago), descontar la comida si no te la pagan, y **"esta junta ha costado \$X"** con un cronómetro. | Al abrir la app se calcula desde la hora de entrada; no necesita correr en segundo plano. Los datos se quedan en el reloj. |
| **🚇 Metro CDMX** | Las 12 líneas y unas 195 estaciones guardadas en la app (unos KB). Eliges línea y dirección, giras la corona y ves **cuál sigue, los transbordos y la terminal**. **Ruta A → B** calculada en el reloj (camino más corto con transbordos) y "vibra 1 estación antes de bajar" tocando *Siguiente* o con un tiempo promedio por tramo. Después: Metrobús, Monterrey y Guadalajara. | **El GPS no funciona bajo tierra:** solo sirve afuera para "la estación más cercana es Insurgentes, 300 m". |
| **💳 Tarjeta de Movilidad** | Pones el saldo al recargar y tocas *Viaje* en cada entrada (Metro \$5, Metrobús \$6…): "te quedan ~7 viajes". Va dentro de Metro. | El saldo es un cálculo, no lee la tarjeta. |
| **⚖️ Convertidor** | Libras↔kg, °F↔°C, millas↔km, oz↔g, pies↔m y USD↔MXN (tipo de cambio puesto a mano; con Wear Engine, del teléfono). El número se gira con la corona (`picker-view`). | — |
| **🔢 Contador** | Vasos de agua, repeticiones o vueltas con la corona (`picker-view` o `slider`). | — |
| **🧾 Dividir la cuenta** | Total, personas y % de propina con la corona. | — |
| **🎲 Para decidir** | Dado, moneda o ruleta que giras con la corona ("¿quién paga?", "¿qué cenamos?"). | — |
| **💸 QR** | Tu CLABE o link de cobro, tu contacto o tu WhatsApp como QR (componente `qrcode` nativo). | Datos sensibles: solo en tu reloj. |
| **🚗 Hoy No Circula** | Placa y holograma una vez; cada día te dice si circulas. | Las contingencias necesitan internet (con Wear Engine). |
| **📍 Lugares** | Guardas lugares con nombre (bici, carro, casa del Koala, trabajo…) y te dice **a qué distancia está y hacia dónde ir** con el GPS (`@system.geolocation`). Flecha real si hay brújula (`@system.sensor`); si no, rumbo de tus últimos pasos + punto cardinal ("380 m al noreste"). Al llegar a un tag con la app abierta: "¿Registrar viaje a Casa Koala?" para Baterías. También sirve de **parquímetro** (dónde dejaste el carro y cuánto pagaste). | Con la app abierta. |
| **⌨️ Teclado con la corona** | La corona elige letras y el reloj **completa palabras** con una lista de palabras frecuentes en español ("llam…" → *llamar*). | Lento, para 2 o 3 palabras. Destraba notas, eventos y Gemini sin micrófono. |
| **🐨 Koala tamagotchi** | Koala animado (`image-animator`) con hambre, ánimo y energía. Lo alimentas con **tus pasos** y lo haces feliz con **tus viajes en bici**. Al abrirlo se calcula lo que pasó mientras estuvo cerrado. | Animaciones de pocos cuadros. |
| **🔧 Mantenimiento de bici** | Con los km de Baterías: "lubricar la cadena cada 300 km", "frenos cada 1,000 km". *Hecho* y vuelve a contar. | — |
| **✅ Checklist antes de salir** | Llantas, luces, casco, batería, candado; al final, "Salí en bici". | — |
| **↩️ Direccionales** | De noche, flecha naranja grande parpadeando a máximo brillo; corona a la izquierda o a la derecha. | — |
| **🍅 Pomodoro / 🏋️ HIIT** | Trabajo y descanso con vibraciones distintas. | Con la app cerrada, el aviso tendría que venir del teléfono. |
| **💧 Hábitos** | Agua, medicinas, estirarse, con anillos M3. | Los recordatorios llegarían como notificaciones del teléfono. |
| **📳 Hora en vibraciones** | Tocas y vibra la hora (largas = horas, cortas = cuartos), sin mirar. | — |
| **💞 Contador de días** | Días con el Koala, días para un viaje, racha de días en bici. | — |
| **💵 Gastos rápidos** | Monto con la corona + categoría y total de la semana. | Con Wear Engine se pasan a una hoja de Google. |
| **🃏 Anki** | Mazo de prueba en el reloj (tocas para voltear y calificas *Otra vez / Bien*). Con Wear Engine, tus tarjetas reales de **AnkiDroid** (tiene API pública). | Tener AnkiDroid. |
| **📜 Teleprompter** | Texto que lees y avanzas con la corona: discursos, recetas, listas. | Con Wear Engine, el texto viene del teléfono o de Keep. |
| **❤️ Zonas de pulso / 🚴 Modo bici en vivo** | Ritmo cardiaco (`@system.sensor`) y velocidad por GPS; vibra si te pasas de zona; autonomía restante. | No corre al mismo tiempo que un entrenamiento del reloj. |
| **👋 Gestos** | Con el acelerómetro: sacudir para tomar la foto, girar la muñeca para pasar diapositiva. | Solo con la pantalla abierta. |
| **🐍 Juegos** | Snake, 2048, Simón dice con vibraciones. | Pocos cuadros para la memoria. |

## 🔵 Solo teléfono
| Idea | De qué trata | Ojo |
|---|---|---|
| **🚴 Aviso a tu mamá** | El teléfono va en la mochila con GPS e internet. "Salí en bici" → SMS *"Salí en bici"* + link de Maps, uno **cada hora**, y "Llegué" para terminar. Con Wear Engine, el botón también en el reloj. | Google Maps → Compartir ubicación ya hace la versión en vivo; lo nuestro aporta el botón y los avisos solos. |
| **📍 "¿Dónde estás?" automático** | Si tu mamá (o quien autorices) te manda un SMS con "dónde", el teléfono le contesta solo con tu ubicación. | Permisos de SMS: bien para uso personal, Play los restringe. |
| **🔑 ¿Llevas todo?** | Al salir del Wi-Fi del trabajo o de la casa: "¿Llaves, cartera, cargador?", y llega al reloj. | — |

## 🟡 Reloj + teléfono (Wear Engine)
| Idea | De qué trata | Ojo |
|---|---|---|
| **🎥 Video en Cámara** | Grabar y detener con cronómetro; CameraX (`VideoCapture`) lo guarda en Movies/JJAS Tools. | — |
| **🚨 SOS** | Pantalla SOS (primera de la lista): **mantener 3 s** → SMS con tu ubicación a tus contactos y llamada directa a un contacto (mamá). | Al 911 solo abre el marcador. **Antes revisa** si tu Fit 3 trae *SOS de emergencia* en Huawei Health. |
| **📅 Eventos y tareas** | Tipo + cuándo ("en 30 min", "hoy 5 pm", "mañana 9 am") → evento (`CalendarContract`) o tarea en **Google Tasks** (OAuth, como Spotify). El recordatorio llega al reloj. | Texto con plantillas o el teclado de la corona. |
| **📝 Notas rápidas** | Plantillas (*Llamar a… / Enviar… / Revisar…*) + persona + hora. Mínimo: botón **"Anótalo"** que guarda la hora y el lugar ("Pendiente de las 10:32"). | Con micrófono sería dictado. |
| **🗓️ Calendario M3** | El teléfono lee la agenda y manda el día y la semana con chips de colores. | — |
| **🖱️ Control de la PC** | El S23 se hace pasar por **teclado y mouse Bluetooth** (`BluetoothHidDevice`, Android 9+): diapositivas, pausa, volumen y **bloquear la PC (Win+L)**. Sin instalar nada en la PC. | Emparejar el S23 con la laptop una vez. |
| **📊 Estado del escritorio** | Llamadas perdidas, quién escribió (solo nombres) y batería del celular. | — |
| **🔕 No molestar / Silencio** | La app del teléfono los cambia con el permiso de acceso a No molestar. | — |
| **🔋 Cargar la bici** | Cuando Baterías calcule que queda poco, el teléfono manda una notificación que llega al reloj aunque la app esté cerrada. | — |
| **🗺️ Maps** | Indicaciones de Google Maps leídas de su notificación. | — |
| **🌧️ ¿Me voy en bici?** | Semáforo de lluvia (3 h), viento y calidad del aire de CDMX. | — |
| **✨ Gemini / 🤖 Claude** | Pregunta guardada, del teclado o dictada → API → respuesta corta. Gemini tiene **nivel gratuito**; Claude cuesta por uso. También para resumir chats o audios. | La API key solo en el teléfono. |
| **🗣️ Traductor** | Frase elegida o escrita → en inglés. Combina con Anki. | — |
| **🎤 Letras** | Letra sincronizada (LRCLIB, gratuita) línea por línea con los colores de Música. | — |
| **🎵 ¿Qué canción es?** | El teléfono la reconoce con su micrófono y la guarda en Spotify. | Tiene que estar cerca. |
| **📍 Mapa en Lugares** | El teléfono dibuja la zona (OpenStreetMap o mapa estático) y manda una imagen de ~400×400. | Confirmar que el reloj muestra una imagen recibida por P2P. |
| **💌 "Pensando en ti"** | Un toque → SMS a Koala con un mensaje elegido, y contador. | WhatsApp no deja mandar mensajes nuevos. |
| **📞 Llamar por WhatsApp** | El teléfono abre la llamada con un intent de contacto (`vnd.com.whatsapp.voip.call`); también llamadas normales (`ACTION_CALL`). | Truco sin API oficial; podría dejar de funcionar. |
| **🟦 Modos de Samsung** | Sin API pública. Ideas: una condición que provoquemos para la rutina, atajos si Samsung expone un intent, o modos propios (No molestar, volumen, brillo). | Hay que probar. |
| **🏠 Google Home / 📺 Tele** | **Google Home APIs para Android** (equipos Matter o de Google Home) y control por red local (Samsung, Roku o Google TV). | Registrar el proyecto; depende de tus aparatos. |
| **🖼️ WhatsApp: fotos, stickers y audios** | Imagen de la notificación reducida al reloj; audios **transcritos** por el teléfono. | Solo lo que llega como notificación; el archivo de voz está por verificar. |
| **💬 "Ya llegué"** | Contesta el último chat de WhatsApp como respuesta a su notificación. | Solo como respuesta. |
| **📒 Keep / 🎙️ Grabadora** | Notas de Keep (gkeepapi, no oficial, solo personal) y grabadora en el teléfono. | La grabadora depende del micrófono. |

## 🟣 Health Kit
- **🚲 Km de la bici:** Health Kit lee tus entrenamientos de ciclismo y descuenta
  los km de Baterías. Plan B: "Iniciar viaje" con GPS en Baterías.
- **⏰ Alarma por tendencias:** lee tu historial de sueño, calcula cuánto tardas
  en dormirte y cuánto duran tus ciclos, y al tocar "Me voy a dormir" te propone
  despertar al final de un ciclo y **pone la alarma en el teléfono**
  (`AlarmClock`), que suena también en el reloj.

## ⌚ ¿Flashear el Fit 3 o hacerle un sistema propio?
**No es viable**, aunque se vea sencillo por fuera:
- El firmware está **firmado por Huawei** y el arranque bloqueado: sin sus llaves
  no se instala otro sistema, y un intento fallido **lo deja inservible**.
- No hay documentación del chip, la pantalla, el GPS ni los sensores: **meses o
  años de ingeniería inversa**, sin garantía, y se pierde Huawei Health.
- **Si algún día quieres control total:** **Bangle.js 2** (apps en JavaScript,
  GPS, segundo plano, Gadgetbridge) o **PineTime** (barato, firmware libre). Un
  **Galaxy Watch con Wear OS** trae de fábrica micrófono, Gemini, Google Home, SOS,
  detección de caídas e internet.

---

## Publicarla para otros usuarios (evaluación 2026-11-19)
**Sí se puede.** Pero no todo lo que hicimos se puede publicar tal cual. Conviene
separar las funciones en **públicas** y **personales**.

### Dónde se publica
| Parte | Tienda | Qué pide |
|---|---|---|
| App del reloj | **AppGallery** (sección de relojes, se instala desde Huawei Health) | Certificado **de publicación** (no el de depuración), revisión de Huawei, política de privacidad, capturas y descripción. |
| App del teléfono | **Google Play** (y opcionalmente AppGallery) | Cuenta de Play (pago único de 25 USD). Las cuentas personales nuevas deben hacer una **prueba cerrada con 12 testers durante 14 días** antes de publicar. |
| Wear Engine | Huawei | La solicitud actual dice "uso personal": para publicar hay que **actualizarla diciendo que es una app pública**. |

### Qué se puede publicar y qué no
| Función | ¿Pública? | Por qué |
|---|---|---|
| Todo lo 🟢 (Baterías, Jornada, Metro, Lugares, Koala, Convertidor…) | ✅ | Solo usan el reloj. |
| Control de música (cualquier app) | ✅ | Usa la API oficial de Android (MediaSession). |
| Cámara (foto y video) | ✅ | |
| Calendario, Anki (AnkiDroid), Maps (notificaciones), QR, Control de la PC | ✅ | APIs públicas; hay que explicar bien los permisos. |
| SOS, aviso de ubicación y "¿Dónde estás?" (SMS) | ⚠️ | Play restringe los permisos de SMS; habría que justificarlo o usar otro canal. |
| **Playlists de Spotify** | ⚠️ Solo con truco | Desde 2025 Spotify solo da cuota amplia a **empresas**; en modo desarrollo son **5 usuarios máximo**. Opción: que cada usuario ponga su propio Client ID. |
| **Notas de Keep (gkeepapi)** | ❌ Solo personal | API no oficial con el token de tu cuenta de Google. |
| **Trucos de WhatsApp** (llamar, fotos y audios) | ⚠️ Riesgoso | No hay API oficial; Play puede rechazarla. Mejor como función personal. |
| **Claude / Gemini** | ⚠️ | No se puede incluir nuestra API key: cada usuario pone la suya, o hace falta un servidor propio. |

### Cambios necesarios antes de publicar
- **Quitar `QUERY_ALL_PACKAGES`:** Play lo restringe. Se cambia por `<queries>` para
  las apps de música.
- **Política de privacidad** (notificaciones, ubicación, cámara, contactos, SMS):
  todo se procesa en el dispositivo.
- **No usar marcas** (Spotify, WhatsApp, Huawei) en el nombre ni en el ícono.
- **Interruptor "funciones personales":** una opción de compilación que deja
  fuera Keep, WhatsApp y Spotify en la versión pública.
- **Probar en otros relojes** (Fit 4, Band…) o limitarla al Fit 3.
- **Idiomas:** español primero; inglés amplía mucho el público.

### Plan sugerido
1. Seguir construyendo con la separación pública/personal desde ahora.
2. **v1 pública:** Baterías, Jornada, Metro, Lugares, Koala, Convertidor, Música,
   Cámara.
3. Prueba cerrada en Play con 12 amigos durante 14 días, y publicar.
4. Agregar Calendario, Anki, Maps y Control de la PC en versiones siguientes.

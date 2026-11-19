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
- **Dirección:** el Fit 3 probablemente no tiene brújula, así que la flecha se
  calcula con el **rumbo de tus últimos pasos** (cuando caminas) más el punto
  cardinal ("380 m al noreste").
- **Mapa:** el reloj no puede mostrar calles por sí mismo. **Con Wear Engine**, el
  teléfono puede dibujar un mini mapa de la zona y mandarlo como imagen.
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

### 9. Modos / rutinas del teléfono desde el reloj
Botones en el reloj para "No molestar", "Silencio", "Modo Trabajo", etc.
- **Viabilidad: media.** La app del teléfono puede activar No molestar y
  silenciar por sí misma.
- Los **Modos y rutinas de Samsung** no tienen API pública. Una opción es que
  tu rutina de Samsung se active con una condición que nosotros provoquemos.
  Hay que probarlo.

### 10. Ya planeadas (plan original)
QR en el reloj (el reloj lite tiene un componente `qrcode` nativo), indicaciones
de Google Maps, notas de Keep y grabadora de voz, que se graba en el teléfono.

## Descartadas (ya vienen en el Fit 3)
- Encontrar mi teléfono.
- Linterna.

## Ideas sueltas por evaluar
- **"Salí de casa" / "Llegué":** un botón en el reloj que, por medio del
  teléfono, contesta el último chat de WhatsApp con "Ya llegué".
- **Recordatorio de cargar la bici:** cuando Baterías calcule que queda poco, el
  teléfono te manda una notificación que llega al reloj aunque la app esté cerrada.

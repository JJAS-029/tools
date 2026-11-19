# Configurar Spotify

Spotify cambió sus reglas en febrero de 2026. Esto queda así:
- La app de desarrollador funciona solo si **tu cuenta es Premium**, y la pueden usar como máximo 5 personas.
- Se pueden ver tus playlists, tus "Me gusta" y las canciones de las playlists **que son tuyas o en las que colaboras**.
- De las playlists que solo sigues, se ve el nombre pero no las canciones. Aun así se pueden reproducir completas.

## 1. Crear la app en Spotify
1. Entra a https://developer.spotify.com/dashboard con tu cuenta Premium.
2. Da clic en **Create app** y llena:
   - App name: `JJAS Tools`
   - Description: `Control desde mi reloj`
   - Redirect URI: `jjastools://spotify-callback` (exactamente así)
   - APIs used: **Web API**
3. Guarda la app y copia el **Client ID**. No necesitas el Client Secret.

## 2. Ponerlo en el proyecto
En `phone/local.properties` (este archivo no se sube a GitHub), agrega:
```
spotify.clientId=TU_CLIENT_ID
```
Después, en Android Studio, ve a **Sync Project** y luego dale **Run**.

## 3. Conectar
1. En la app JJAS Tools del teléfono, toca **Conectar Spotify**, inicia sesión y acepta.
2. Prueba los botones de "Simular reloj": Playlists y Me gusta. En "Mensajes" debe aparecer `sp.lists.r` con tus playlists.
3. Para reproducir, Spotify debe estar abierto o en segundo plano en el teléfono. Si no, aparece el error "Abre Spotify en tu teléfono".

## Spotify closed or "asleep" (tested on S23, Android 16)
- Spotify doesn't show up in `GET /me/player/devices` if it is closed, or was started in the
  background by a media button. It only registers when the app is **opened on screen** (~10 s).
- `playFromUri` on Spotify's MediaSession is **ignored** (it only accepts trusted callers),
  so it can't be used to choose what plays.
- What works: if there's no device, the companion opens Spotify with `spotify:playlist:<id>`
  (or the app for "Liked songs"), waits for the device in Connect, and plays with `device_id`.
- From the background, Android only allows opening Spotify if JJAS Tools has the
  **"Display over other apps"** permission (button in the Spotify card;
  via adb: `appops set com.jjas.tools.phone SYSTEM_ALERT_WINDOW allow`).

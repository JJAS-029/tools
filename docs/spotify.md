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

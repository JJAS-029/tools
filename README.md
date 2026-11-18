# JJAS Tools para Huawei Watch Fit 3

Apps propias para el Watch Fit 3: música (Spotify o cualquier reproductor), obturador de cámara, códigos QR, navegación de Google Maps, notas de Google Keep y grabadora de voz.

## Arquitectura

```
[watch/  app JS lite wearable]  <--Wear Engine P2P (Bluetooth)-->  [phone/  app compañera Android]
   interfaz y entrada                                                 Keep, Maps, Spotify, cámara...
```

El reloj no tiene internet propio: la app compañera del teléfono hace el trabajo pesado y le manda datos al reloj.

| Carpeta | Qué contiene |
|---|---|
| `watch/` | Proyecto de DevEco Studio (HarmonyOS lite wearable, JS) |
| `phone/` | Proyecto de Android Studio (Kotlin + Wear Engine SDK) |
| `docs/setup.md` | Cuenta de desarrollador, certificados, UDID e instalación |
| `docs/protocol.md` | Mensajes entre el reloj y el teléfono |

## Estado

- [ ] Fase 0: prueba de viabilidad (un "Hola mundo" en el reloj y un ping/pong P2P)
- [ ] Fase 1: puente P2P y launcher
- [ ] Fase 2: música, cámara, QR, Maps, Keep y grabadora
- [ ] Fase 3: extras

# Fase 0: preparar el entorno y probar que el Fit 3 acepta apps propias

> **Confirmado (documentación oficial de Wear Engine, actualizada el 2026-04-07):** la serie WATCH FIT, desde el FIT 1, está soportada como **Lite Wearable App** para mensajes y archivos entre la app del reloj y la del teléfono.
>
> El Fit 3 trae "HarmonyOS 5.0.0", pero sigue siendo un reloj *lite*, así que usa la plantilla JS de Lite Wearable y no ArkTS.
>
> En teléfonos que no son Huawei, la documentación pide **Android 6.0 a 14.0**, Huawei Health con sesión iniciada con HUAWEI ID, y permiso de Huawei Health para mostrar ventanas emergentes en segundo plano.

Sigue estos pasos en orden. Si alguno falla, anota el error y detente: con eso replanteamos el plan.

## 1. Cuenta de Huawei Developer
1. Regístrate en https://developer.huawei.com/consumer/en/ y verifica tu identidad como persona física.
2. En **AppGallery Connect**, crea un proyecto llamado `jjas-tools`.
3. Dentro del proyecto, agrega dos apps:
   - Una app **HarmonyOS / Lite wearable** con el paquete `com.jjas.tools.watch`.
   - Una app **Android** con el paquete `com.jjas.tools.phone`.
4. Antes de Wear Engine, activa el servicio **HUAWEI ID** para la app Android. Si no lo haces, la app no aparece en la lista desplegable de Wear Engine.
5. Ve a Console → **App services → Development → Wear Engine**. Si no ves la tarjeta, agrégala desde Development. Luego da clic en **Apply**, acepta el acuerdo, elige la app Android y marca los permisos: dispositivo, mensajes P2P e info del usuario.
6. Los permisos los pide la app del **teléfono**; la del reloj no los necesita. La revisión tarda unos 3 a 5 días.
   - Los permisos que pida el código deben coincidir con los que aprobaron. Si no coinciden, aparece el error `1008500004`.

## 2. Herramientas en la PC
- **DevEco Studio**: https://developer.huawei.com/consumer/en/deveco-studio/. Usa la versión **6.1.1 para Windows**; no necesitas Command Line Tools ni ohpm-repo. Al crear un proyecto, revisa que exista el dispositivo **Lite Wearable** con la plantilla **Empty Ability (JS)**. Si no existe, hay que instalar una versión 5.0.x desde la página de versiones anteriores.
- **Android Studio**: la versión estable más reciente.
- **ADB**: viene incluido con Android Studio.

## 3. Reloj y teléfono
1. En el teléfono, abre Huawei Health → tu reloj → Acerca de. Toca el número de versión varias veces hasta que se active el **modo desarrollador**.
2. Busca el **UDID** del reloj, ya sea en el menú de desarrollador de Huawei Health o en DevEco (Device Manager), y anótalo.
3. En el teléfono, activa la **Depuración USB** en Opciones de desarrollador.

## 4. Firma de depuración
1. En DevEco Studio, ve a Build → Generate Key and CSR. Guarda los archivos en `signing/`, una carpeta que git ignora.
2. En AppGallery Connect, ve a Certificates. Sube el CSR para obtener un **certificado de depuración** (`.cer`).
3. Registra el UDID del reloj como dispositivo y crea un **perfil de depuración** (`.p7b`) para `com.jjas.tools.watch`.
4. En DevEco, abre Project Structure → Signing Configs y configura los archivos `.p12`, `.cer` y `.p7b`.

## 5. Prueba "Hola mundo"
1. En DevEco, crea un proyecto nuevo con la plantilla **Lite Wearable → Empty Ability (JS)** dentro de `watch/`.
2. Ejecútalo en el reloj con Run.
   **Éxito:** ves la app en el reloj.
3. Anota la versión de API o SDK que te pidió DevEco y si la plantilla incluye APIs de audio o micrófono. Esto decide cómo hacemos la grabadora.

## 6. Prueba ping/pong P2P
Esto lo construimos juntos cuando Wear Engine esté aprobado. Tendremos una app Android mínima en `phone/` y una página en el reloj que se envían `ping` y `pong` (ver `protocol.md`).
**Éxito:** los dos lados muestran el mensaje que recibieron.

## Resultados de la Fase 0 (llénalo)
- Versión de API/SDK lite wearable:
- ¿Se instaló el "Hola mundo"? (sí/no, error):
- ¿Hay API de micrófono en el reloj?:
- ¿Wear Engine aprobado? (fecha):

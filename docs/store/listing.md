# Ficha para AppGallery (versión pública del reloj)

Texto listo para copiar en AppGallery Connect → app del reloj → *App information*.

**Nombre:** JJAS Tools

**Breve introducción** (máx. 80 caracteres):
> Baterías, lugares con GPS, mascota koala, metro CDMX y +20 herramientas.

**Introducción completa:**
> JJAS Tools reúne más de 20 herramientas para tu HUAWEI WATCH FIT 3 en una sola app, con diseño Material 3 y control con la corona. Funciona sola en el reloj: no necesitas la app del teléfono.
>
> • Baterías: cuánto le queda a tu bici eléctrica según tus viajes, y cuándo se acaba la pila del reloj.
> • Lugares: guarda sitios (bici, carro, casa) y te indica distancia y dirección con el GPS.
> • Koala: una mascota que crece con tus pasos.
> • Bici Kit: mantenimiento por kilómetros, checklist antes de salir, direccionales y modo bici con velocidad y zonas de pulso.
> • Metro CDMX y Tarjeta de Movilidad, Hoy No Circula.
> • Pomodoro e intervalos, hábitos del día, contador, días y rachas, gastos rápidos.
> • Anki de vocabulario en inglés, teclado con la corona, teleprompter.
> • Convertidor de unidades, propinas y dividir la cuenta, dado y moneda, juego Simón.
>
> Todos tus datos se guardan solo en el reloj.

**Categoría:** Herramientas (o Utilidades)

**Política de privacidad (URL):**
https://github.com/JJAS-029/tools/blob/main/docs/privacy.md

**Ícono:** `docs/store/icon_216.png` (o `icon_512.png`)

**Capturas:** 3 a 8 capturas del reloj tomadas del Previewer de DevEco con la
versión pública (`bash scripts/set_flavor.sh public`). Sugeridas: menú principal,
Baterías/Bici, Lugares, Koala, Metro y Pomodoro.

**Dispositivos:** HUAWEI WATCH FIT 3 (smart wearable / lite wearable).

**Precio:** gratis · **Países:** México (se pueden agregar más).

---

## Formulario de versión (AppGallery Connect → Versión 1.0.0)

**Países/regiones:** solo **México** (o Latinoamérica). **No** elijas *Chinese
mainland*: exige un registro del gobierno chino (*Filing information*).

**Descripción de permisos** (sección *Privacy description*):
| Permiso | Motivo (copiar) |
|---|---|
| Physical activity | Contar tus pasos para alimentar a la mascota Koala. Los pasos se guardan solo en el reloj. |
| Access precise location | Lugares: guardar sitios y mostrar distancia y dirección hacia ellos; Modo bici: medir tu velocidad. Solo con la pantalla abierta y sin salir del reloj. |
| Access body sensors | Mostrar tu zona de pulso en vivo en el Modo bici. El pulso no se guarda. |

**Privacy policy URL:** https://github.com/JJAS-029/tools/blob/main/docs/privacy.md
**Data subject right URL:** https://github.com/JJAS-029/tools/issues

**Generative AI service:** No.

**Para el revisor (Remarks, máx. 300):**
> Standalone sports-watch app for HUAWEI WATCH FIT 3. No sign-in and no phone app needed; all data stays on the watch. Open the app and pick any tool from the list. GPS features (Places, Bike mode) work best outdoors. Long-press a use in "Baterías > Bici" to edit its km.

**Clasificación de contenido:** cuestionario sin violencia, sexo, apuestas ni
compras → apta para todo público.

**Capturas:** 4 a 8, cuadradas de 840×840 (se generan con
`scripts/store_screens.py` a partir de capturas del Previewer).

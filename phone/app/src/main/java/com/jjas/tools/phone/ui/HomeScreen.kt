package com.jjas.tools.phone.ui

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.QueueMusic
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.ExpandLess
import androidx.compose.material.icons.rounded.ExpandMore
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.Timer
import androidx.compose.material.icons.rounded.DirectionsBike
import androidx.compose.material.icons.rounded.AttachMoney
import androidx.compose.material.icons.rounded.PhotoCamera
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Stop
import androidx.compose.material.icons.rounded.WbSunny
import androidx.compose.material.icons.rounded.Videocam
import androidx.compose.material.icons.rounded.MusicNote
import androidx.compose.material.icons.rounded.NotificationsActive
import androidx.compose.material.icons.rounded.Pause
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Remove
import androidx.compose.material.icons.rounded.SkipNext
import androidx.compose.material.icons.rounded.SkipPrevious
import androidx.compose.material.icons.rounded.Watch
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.jjas.tools.phone.bridge.Protocol
import com.jjas.tools.phone.bridge.WatchLink
import com.jjas.tools.phone.brief.WeatherRepository
import com.jjas.tools.phone.fx.FxRepository
import com.jjas.tools.phone.safety.SafetyRepository
import com.jjas.tools.phone.media.MediaRepository
import com.jjas.tools.phone.spotify.SpotifyApi
import com.jjas.tools.phone.spotify.SpotifyRepository
import org.json.JSONObject

data class SpotifyUi(
    val configured: Boolean,
    val logged: Boolean,
    val message: String,
    /** "Display over other apps" permission: lets it open Spotify when the watch asks. */
    val canOpenSpotify: Boolean,
    val onAllowOpenSpotify: () -> Unit,
    val onLogin: () -> Unit,
    val onLogout: () -> Unit,
)

/** Simulates a message from the watch, so the full path is tested without the watch. */
private fun fromWatch(t: String, d: JSONObject = JSONObject()) =
    WatchLink.onFromWatch(Protocol.encode(t, d))

private fun mediaCmd(a: String) = fromWatch("media.cmd", JSONObject().put("a", a))

@Composable
fun HomeScreen(hasAccess: Boolean, onGrantAccess: () -> Unit, spotify: SpotifyUi) {
    Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        LazyColumn(
            modifier = Modifier.statusBarsPadding().navigationBarsPadding(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item { Header() }
            if (!hasAccess) item { AccessCard(onGrantAccess) }
            item { NowPlayingCard() }
            item { SpotifyCard(spotify) }
            item { CameraCard() }
            item { SafetyCard() }
            item { FxCard() }
            item { WeatherCard() }
            item { LogCard() }
        }
    }
}

// ---------- Header ----------
@Composable
private fun Header() {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 8.dp)) {
        ShapeTile(M3Shapes.Sunny, MaterialTheme.colorScheme.tertiary, Icons.Rounded.Watch,
            MaterialTheme.colorScheme.onTertiary, size = 56.dp)
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) {
            Text("JJAS Tools", style = MaterialTheme.typography.displaySmall)
            Text("Puente para tu Watch Fit 3", style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
    StatusChip("Reloj: modo simulado")
}

@Composable
private fun StatusChip(text: String) {
    Row(
        Modifier
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.secondaryContainer)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(8.dp).clip(CircleShape).background(MaterialTheme.colorScheme.secondary))
        Spacer(Modifier.width(8.dp))
        Text(text, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSecondaryContainer)
    }
}

// ---------- Reusable pieces ----------
@Composable
private fun ExpressiveCard(
    modifier: Modifier = Modifier,
    color: Color = MaterialTheme.colorScheme.surfaceContainer,
    content: @Composable () -> Unit,
) {
    Surface(modifier.fillMaxWidth(), shape = MaterialTheme.shapes.large, color = color) {
        Column(Modifier.padding(20.dp).animateContentSize(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            content()
        }
    }
}

@Composable
private fun ShapeTile(shape: Shape, bg: Color, icon: ImageVector, fg: Color, size: Dp = 52.dp) {
    Box(Modifier.size(size).clip(shape).background(bg), contentAlignment = Alignment.Center) {
        Icon(icon, contentDescription = null, tint = fg, modifier = Modifier.size(size * 0.5f))
    }
}

@Composable
private fun CardTitle(shape: Shape, bg: Color, fg: Color, icon: ImageVector, title: String, subtitle: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        ShapeTile(shape, bg, icon, fg)
        Spacer(Modifier.width(14.dp))
        Column {
            Text(title, style = MaterialTheme.typography.titleLarge)
            Text(subtitle, style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

// ---------- Notification access ----------
@Composable
private fun AccessCard(onGrantAccess: () -> Unit) {
    ExpressiveCard(color = MaterialTheme.colorScheme.tertiaryContainer) {
        CardTitle(M3Shapes.Cookie12, MaterialTheme.colorScheme.tertiary, MaterialTheme.colorScheme.onTertiary,
            Icons.Rounded.NotificationsActive, "Falta un permiso", "Acceso a notificaciones")
        Text("Lo necesito para ver y controlar lo que suena (Spotify, YouTube Music…) y, más adelante, leer las indicaciones de Maps.",
            color = MaterialTheme.colorScheme.onTertiaryContainer)
        Button(onClick = onGrantAccess, modifier = Modifier.height(52.dp),
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.tertiary)) {
            Text("Dar acceso")
        }
    }
}

// ---------- Now playing ----------
@Composable
private fun NowPlayingCard() {
    val media by MediaRepository.state.collectAsState()
    val cs = MaterialTheme.colorScheme
    ExpressiveCard {
        CardTitle(M3Shapes.Cookie9, cs.primary, cs.onPrimary, Icons.Rounded.MusicNote,
            media.title.ifEmpty { "Nada sonando" },
            listOf(media.artist, media.app).filter { it.isNotEmpty() }.joinToString(" · ").ifEmpty { "Sin reproductor activo" })

        if (media.dur > 0) {
            LinearProgressIndicator(
                progress = { (media.pos.toFloat() / media.dur).coerceIn(0f, 1f) },
                modifier = Modifier.fillMaxWidth().height(8.dp),
                color = cs.primary, trackColor = cs.surfaceContainerHigh,
            )
        }

        // M3 Expressive "button group": side pills + central button that morphs
        // (pill when paused, rounded square while playing).
        val playCorner by animateDpAsState(
            targetValue = if (media.playing) 20.dp else 36.dp,
            animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
            label = "playMorph",
        )
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            GroupButton(Icons.Rounded.SkipPrevious, "Anterior", Modifier.weight(1f)) { mediaCmd("prev") }
            Box(
                Modifier
                    .weight(1.6f)
                    .height(72.dp)
                    .clip(RoundedCornerShape(playCorner))
                    .background(cs.primary)
                    .clickable { mediaCmd(if (media.playing) "pause" else "play") },
                contentAlignment = Alignment.Center,
            ) {
                Icon(if (media.playing) Icons.Rounded.Pause else Icons.Rounded.PlayArrow,
                    contentDescription = if (media.playing) "Pausar" else "Reproducir",
                    tint = cs.onPrimary, modifier = Modifier.size(36.dp))
            }
            GroupButton(Icons.Rounded.SkipNext, "Siguiente", Modifier.weight(1f)) { mediaCmd("next") }
        }

        Row(
            Modifier.fillMaxWidth().clip(CircleShape).background(cs.surfaceContainerHigh),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            VolumeButton(Icons.Rounded.Remove, "Bajar volumen") { mediaCmd("vol-") }
            LinearProgressIndicator(
                progress = { media.vol / 100f },
                modifier = Modifier.weight(1f).height(6.dp),
                color = cs.primary, trackColor = cs.surfaceContainer,
            )
            Text("${media.vol}%", style = MaterialTheme.typography.labelLarge, modifier = Modifier.padding(start = 10.dp))
            VolumeButton(Icons.Rounded.Add, "Subir volumen") { mediaCmd("vol+") }
        }
        Text("Estos botones simulan al reloj.", style = MaterialTheme.typography.bodySmall,
            color = cs.onSurfaceVariant)
    }
}

@Composable
private fun GroupButton(icon: ImageVector, desc: String, modifier: Modifier, onClick: () -> Unit) {
    Box(
        modifier
            .height(72.dp)
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.surfaceContainerHigh)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription = desc, modifier = Modifier.size(30.dp))
    }
}

@Composable
private fun VolumeButton(icon: ImageVector, desc: String, onClick: () -> Unit) {
    Box(Modifier.size(52.dp).clip(CircleShape).clickable(onClick = onClick), contentAlignment = Alignment.Center) {
        Icon(icon, contentDescription = desc)
    }
}

// ---------- Camera ----------
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun CameraCard() {
    val cs = MaterialTheme.colorScheme
    ExpressiveCard {
        CardTitle(M3Shapes.cookie(6), cs.secondary, cs.onSecondary, Icons.Rounded.PhotoCamera,
            "Cámara", "Obturador desde el reloj")
        Text("Simular reloj", style = MaterialTheme.typography.labelLarge, color = cs.onSurfaceVariant)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            FilledTonalButton(onClick = { fromWatch("cam.open") }) {
                Icon(Icons.Rounded.PhotoCamera, null, Modifier.size(18.dp))
                Spacer(Modifier.width(6.dp)); Text("Abrir")
            }
            Button(onClick = { fromWatch("cam.shoot", JSONObject().put("timer", 3)) }) {
                Icon(Icons.Rounded.Timer, null, Modifier.size(18.dp))
                Spacer(Modifier.width(6.dp)); Text("Foto en 3 s")
            }
            Button(onClick = { fromWatch("cam.rec", JSONObject().put("a", "start").put("timer", 3)) }) {
                Icon(Icons.Rounded.Videocam, null, Modifier.size(18.dp))
                Spacer(Modifier.width(6.dp)); Text("Grabar en 3 s")
            }
            FilledTonalButton(onClick = { fromWatch("cam.rec", JSONObject().put("a", "stop")) }) {
                Icon(Icons.Rounded.Stop, null, Modifier.size(18.dp))
                Spacer(Modifier.width(6.dp)); Text("Detener")
            }
        }
        Text("Fotos en Imágenes/JJAS Tools y videos en Películas/JJAS Tools.", style = MaterialTheme.typography.bodySmall,
            color = cs.onSurfaceVariant)
    }
}

// ---------- Phase 2: Bike beacon, "¿Dónde estás?" SMS, Wi-Fi leave reminder ----------
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun SafetyCard() {
    val ctx = LocalContext.current
    val st by SafetyRepository.state.collectAsState()
    val cs = MaterialTheme.colorScheme
    var phone by remember(st.contactPhone) { mutableStateOf(st.contactPhone) }

    val askPerms = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) {
        SafetyRepository.setStatus("Permisos actualizados")
    }

    fun requestNeededPerms() {
        val list = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.SEND_SMS,
            Manifest.permission.RECEIVE_SMS,
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            list.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        askPerms.launch(list.toTypedArray())
    }

    val sub = when {
        st.riding -> "En bici · avisando cada ${st.intervalMin} min"
        st.lastSent.isNotEmpty() -> "Último SMS a las ${st.lastSent}"
        else -> "Aviso en bici y ¿Dónde estás?"
    }

    ExpressiveCard {
        CardTitle(
            M3Shapes.Cookie12, cs.primary, cs.onPrimary, Icons.Rounded.DirectionsBike,
            "Seguridad y bici", sub,
        )
        OutlinedTextField(
            value = phone,
            onValueChange = {
                phone = it
                SafetyRepository.updateContact(st.contactName, it)
            },
            label = { Text("Celular de ${st.contactName} (10 dígitos)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (!st.riding) {
                Button(onClick = { SafetyRepository.startRide(ctx) }) {
                    Icon(Icons.Rounded.DirectionsBike, null, Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp)); Text("Salí en bici")
                }
            } else {
                Button(onClick = { SafetyRepository.stopRide(ctx) }) {
                    Icon(Icons.Rounded.Stop, null, Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp)); Text("Ya llegué")
                }
            }
            FilledTonalButton(onClick = { SafetyRepository.cycleInterval() }) {
                Text("Cada ${st.intervalMin} min")
            }
            OutlinedButton(onClick = { requestNeededPerms() }) {
                Text("Permisos")
            }
        }
        Row(
            Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(Modifier.weight(1f)) {
                Text("Responder \"dónde\" por SMS", style = MaterialTheme.typography.bodyMedium)
                Text("Solo al número autorizado", style = MaterialTheme.typography.bodySmall,
                    color = cs.onSurfaceVariant)
            }
            Switch(checked = st.autoReply, onCheckedChange = { SafetyRepository.setAutoReply(it) })
        }
        Row(
            Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(Modifier.weight(1f)) {
                Text("¿Llevas todo? al salir del Wi-Fi", style = MaterialTheme.typography.bodyMedium)
                Text(st.leaveItems, style = MaterialTheme.typography.bodySmall, color = cs.onSurfaceVariant)
            }
            Switch(checked = st.leaveReminder, onCheckedChange = { SafetyRepository.setLeaveReminder(it) })
        }
        if (st.statusMsg.isNotEmpty()) {
            Text(st.statusMsg, style = MaterialTheme.typography.bodySmall, color = cs.primary)
        }
    }
}

// ---------- Exchange rate (USD -> MXN) ----------
@Composable
private fun FxCard() {
    val fx by FxRepository.state.collectAsState()
    val cs = MaterialTheme.colorScheme
    ExpressiveCard {
        CardTitle(
            M3Shapes.Sunny, cs.primary, cs.onPrimary, Icons.Rounded.AttachMoney,
            "Tipo de cambio",
            "1 USD = $${"%.2f".format(fx.usd)} MXN" + if (fx.date.isNotEmpty()) " (${fx.date})" else "",
        )
        Text("Simular reloj", style = MaterialTheme.typography.labelLarge, color = cs.onSurfaceVariant)
        FilledTonalButton(enabled = !fx.loading, onClick = { fromWatch("fx.get") }) {
            Icon(Icons.Rounded.Refresh, null, Modifier.size(18.dp))
            Spacer(Modifier.width(6.dp))
            Text(if (fx.loading) "Consultando…" else "Actualizar dólar")
        }
        if (fx.error.isNotEmpty()) {
            Text(fx.error, style = MaterialTheme.typography.bodySmall, color = cs.error)
        }
    }
}

// ---------- Now Brief weather (Open-Meteo CDMX) ----------
@Composable
private fun WeatherCard() {
    val w by WeatherRepository.state.collectAsState()
    val cs = MaterialTheme.colorScheme
    val sub = if (w.updated.isNotEmpty()) {
        "${w.temp.toInt()}° (${w.min.toInt()}°/${w.max.toInt()}°) · Lluvia ${w.rainPct}% (${w.updated})"
    } else {
        "Clima CDMX para Now Brief"
    }
    ExpressiveCard {
        CardTitle(
            M3Shapes.Cookie9, cs.tertiary, cs.onTertiary, Icons.Rounded.WbSunny,
            "Now Brief · Clima", sub,
        )
        Text("Simular reloj", style = MaterialTheme.typography.labelLarge, color = cs.onSurfaceVariant)
        FilledTonalButton(enabled = !w.loading, onClick = { fromWatch("brief.get") }) {
            Icon(Icons.Rounded.Refresh, null, Modifier.size(18.dp))
            Spacer(Modifier.width(6.dp))
            Text(if (w.loading) "Consultando…" else "Actualizar clima")
        }
        if (w.error.isNotEmpty()) {
            Text(w.error, style = MaterialTheme.typography.bodySmall, color = cs.error)
        }
    }
}

// ---------- Spotify ----------
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun SpotifyCard(ui: SpotifyUi) {
    val cs = MaterialTheme.colorScheme
    ExpressiveCard {
        CardTitle(M3Shapes.Clover, cs.secondary, cs.onSecondary, Icons.AutoMirrored.Rounded.QueueMusic,
            "Spotify", when {
                !ui.configured -> "Sin configurar"
                ui.logged -> "Conectado"
                else -> "Sin conectar"
            })
        when {
            !ui.configured -> Text("Agrega spotify.clientId en phone/local.properties (ver docs/spotify.md) y vuelve a compilar.",
                color = cs.onSurfaceVariant)
            !ui.logged -> Button(onClick = ui.onLogin, modifier = Modifier.fillMaxWidth().height(56.dp)) {
                Text("Conectar Spotify", style = MaterialTheme.typography.titleMedium)
            }
            else -> {
                Text("Simular reloj", style = MaterialTheme.typography.labelLarge, color = cs.onSurfaceVariant)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilledTonalButton(onClick = { fromWatch("sp.lists", JSONObject().put("off", 0)) }) {
                        Icon(Icons.AutoMirrored.Rounded.QueueMusic, null, Modifier.size(18.dp))
                        Spacer(Modifier.width(6.dp)); Text("Playlists")
                    }
                    FilledTonalButton(onClick = {
                        fromWatch("sp.tracks", JSONObject().put("id", SpotifyApi.LIKED).put("off", 0))
                    }) {
                        Icon(Icons.Rounded.Favorite, null, Modifier.size(18.dp))
                        Spacer(Modifier.width(6.dp)); Text("Me gusta")
                    }
                    Button(onClick = {
                        // Plays the first playlist (if "Playlists" was tapped) or your liked songs.
                        val id = SpotifyRepository.lastFirstPlaylist ?: SpotifyApi.LIKED
                        fromWatch("sp.play", JSONObject().put("id", id).put("idx", 0))
                    }) {
                        Icon(Icons.Rounded.PlayArrow, null, Modifier.size(18.dp))
                        Spacer(Modifier.width(6.dp)); Text("Reproducir")
                    }
                }
                if (!ui.canOpenSpotify) {
                    Text(
                        "Para que el reloj pueda poner música con Spotify cerrado, permite " +
                            "que JJAS Tools se muestre sobre otras apps.",
                        style = MaterialTheme.typography.bodyMedium, color = cs.onSurfaceVariant,
                    )
                    FilledTonalButton(onClick = ui.onAllowOpenSpotify) { Text("Permitir abrir Spotify") }
                }
                OutlinedButton(onClick = ui.onLogout) { Text("Cerrar sesión") }
            }
        }
        if (ui.message.isNotEmpty()) Text(ui.message, style = MaterialTheme.typography.bodySmall, color = cs.primary)
    }
}

// ---------- Message log ----------
@Composable
private fun LogCard() {
    val log by WatchLink.log.collectAsState()
    var open by remember { mutableStateOf(false) }
    val cs = MaterialTheme.colorScheme
    ExpressiveCard(color = cs.surfaceContainerLow) {
        Row(
            Modifier.fillMaxWidth().clip(MaterialTheme.shapes.small).clickable { open = !open },
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("Mensajes con el reloj", style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
            Text("${log.size}", style = MaterialTheme.typography.labelLarge, color = cs.onSurfaceVariant)
            Icon(if (open) Icons.Rounded.ExpandLess else Icons.Rounded.ExpandMore, contentDescription = null)
        }
        if (open) {
            if (log.isEmpty()) Text("Aún no hay mensajes.", color = cs.onSurfaceVariant)
            log.take(20).forEach { line ->
                Column(
                    Modifier.fillMaxWidth().clip(MaterialTheme.shapes.small).background(cs.surfaceContainer).padding(10.dp)
                ) {
                    Text("${line.time}  ${line.dir}", style = MaterialTheme.typography.labelSmall,
                        color = if (line.dir.startsWith("→")) cs.primary else cs.secondary)
                    Text(line.text, style = MaterialTheme.typography.bodySmall, fontFamily = FontFamily.Monospace,
                        maxLines = 4, overflow = TextOverflow.Ellipsis)
                }
            }
        }
    }
}

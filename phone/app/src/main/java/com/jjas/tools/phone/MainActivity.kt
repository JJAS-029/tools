package com.jjas.tools.phone

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.core.app.NotificationManagerCompat
import com.jjas.tools.phone.bridge.Protocol
import com.jjas.tools.phone.bridge.WatchLink
import com.jjas.tools.phone.media.MediaRepository
import com.jjas.tools.phone.spotify.SpotifyApi
import com.jjas.tools.phone.spotify.SpotifyAuth
import com.jjas.tools.phone.ui.theme.JJASToolsTheme
import org.json.JSONObject

class MainActivity : ComponentActivity() {
    private val hasAccess = mutableStateOf(false)
    private val spotifyLogged = mutableStateOf(false)
    private val spotifyMsg = mutableStateOf("")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        SpotifyAuth.init(this)
        spotifyLogged.value = SpotifyAuth.isLoggedIn
        handleSpotifyCallback(intent)
        enableEdgeToEdge()
        setContent {
            JJASToolsTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { inner ->
                    HomeScreen(
                        hasAccess = hasAccess.value,
                        onGrantAccess = {
                            startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
                        },
                        spotify = SpotifyUi(
                            configured = SpotifyAuth.isConfigured,
                            logged = spotifyLogged.value,
                            message = spotifyMsg.value,
                            onLogin = { startActivity(SpotifyAuth.loginIntent()) },
                            onLogout = {
                                SpotifyAuth.logout()
                                spotifyLogged.value = false
                            },
                        ),
                        modifier = Modifier.padding(inner),
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleSpotifyCallback(intent)
    }

    private fun handleSpotifyCallback(intent: Intent?) {
        val uri = intent?.data ?: return
        if (uri.scheme != "jjastools" || uri.host != "spotify-callback") return
        spotifyMsg.value = "Conectando…"
        Thread {
            val error = SpotifyAuth.handleCallback(uri)
            runOnUiThread {
                spotifyLogged.value = SpotifyAuth.isLoggedIn
                spotifyMsg.value = error ?: "Spotify conectado"
            }
        }.start()
    }

    override fun onResume() {
        super.onResume()
        hasAccess.value = NotificationManagerCompat.getEnabledListenerPackages(this).contains(packageName)
        if (hasAccess.value) MediaRepository.start(this)
    }
}

/** Simulates a message from the watch, so the full path is tested without the watch. */
private fun fromWatch(t: String, d: JSONObject = JSONObject()) =
    WatchLink.onFromWatch(Protocol.encode(t, d))

data class SpotifyUi(
    val configured: Boolean,
    val logged: Boolean,
    val message: String,
    val onLogin: () -> Unit,
    val onLogout: () -> Unit,
)

@Composable
fun HomeScreen(
    hasAccess: Boolean,
    onGrantAccess: () -> Unit,
    spotify: SpotifyUi,
    modifier: Modifier = Modifier,
) {
    val media by MediaRepository.state.collectAsState()
    val log by WatchLink.log.collectAsState()

    Column(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("JJAS Tools", style = MaterialTheme.typography.headlineMedium)

        if (!hasAccess) {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Para controlar la música, activa el acceso a notificaciones para JJAS Tools.")
                    Button(onClick = onGrantAccess) { Text("Dar acceso") }
                }
            }
        }

        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(media.app.ifEmpty { "Sin reproductor activo" }, style = MaterialTheme.typography.labelLarge)
                Text(media.title.ifEmpty { "—" }, style = MaterialTheme.typography.titleLarge)
                Text(media.artist, style = MaterialTheme.typography.bodyMedium)
                Text("${if (media.playing) "▶ Reproduciendo" else "⏸ Pausado"} · vol ${media.vol}%")
            }
        }

        Text("Simular reloj", style = MaterialTheme.typography.titleSmall)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilledTonalButton(onClick = { fromWatch("media.cmd", JSONObject().put("a", "prev")) }) { Text("⏮") }
            FilledTonalButton(onClick = {
                fromWatch("media.cmd", JSONObject().put("a", if (media.playing) "pause" else "play"))
            }) { Text(if (media.playing) "⏸" else "▶") }
            FilledTonalButton(onClick = { fromWatch("media.cmd", JSONObject().put("a", "next")) }) { Text("⏭") }
            FilledTonalButton(onClick = { fromWatch("media.cmd", JSONObject().put("a", "vol-")) }) { Text("−") }
            FilledTonalButton(onClick = { fromWatch("media.cmd", JSONObject().put("a", "vol+")) }) { Text("+") }
        }

        SpotifyCard(spotify)

        Text("Mensajes", style = MaterialTheme.typography.titleSmall)
        LazyColumn(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            items(log) { line ->
                Text(
                    "${line.time} ${line.dir}  ${line.text}",
                    style = MaterialTheme.typography.bodySmall,
                    fontFamily = FontFamily.Monospace,
                )
            }
        }
    }
}

@Composable
private fun SpotifyCard(ui: SpotifyUi) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Spotify", style = MaterialTheme.typography.titleMedium)
            when {
                !ui.configured -> Text("Falta spotify.clientId en phone/local.properties (ver docs/spotify.md).")
                !ui.logged -> Button(onClick = ui.onLogin) { Text("Conectar Spotify") }
                else -> {
                    Text("Simular reloj")
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilledTonalButton(onClick = { fromWatch("sp.lists", JSONObject().put("off", 0)) }) {
                            Text("Playlists")
                        }
                        FilledTonalButton(onClick = {
                            fromWatch("sp.tracks", JSONObject().put("id", SpotifyApi.LIKED).put("off", 0))
                        }) { Text("Me gusta") }
                        FilledTonalButton(onClick = {
                            fromWatch("sp.play", JSONObject().put("id", SpotifyApi.LIKED).put("idx", 0))
                        }) { Text("▶") }
                    }
                    OutlinedButton(onClick = ui.onLogout) { Text("Cerrar sesión") }
                }
            }
            if (ui.message.isNotEmpty()) Text(ui.message, style = MaterialTheme.typography.bodySmall)
        }
    }
}

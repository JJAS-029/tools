package com.jjas.tools.phone

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.mutableStateOf
import androidx.core.app.NotificationManagerCompat
import com.jjas.tools.phone.camera.CameraRepository
import com.jjas.tools.phone.fx.FxRepository
import com.jjas.tools.phone.media.MediaRepository
import com.jjas.tools.phone.spotify.SpotifyAuth
import com.jjas.tools.phone.ui.HomeScreen
import com.jjas.tools.phone.ui.SpotifyUi
import com.jjas.tools.phone.ui.theme.JJASToolsTheme

class MainActivity : ComponentActivity() {
    private val hasAccess = mutableStateOf(false)
    private val spotifyLogged = mutableStateOf(false)
    private val spotifyMsg = mutableStateOf("")
    private val canOverlay = mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        SpotifyAuth.init(this)
        CameraRepository.init(this)
        FxRepository.init(this)
        spotifyLogged.value = SpotifyAuth.isLoggedIn
        handleSpotifyCallback(intent)
        enableEdgeToEdge()
        setContent {
            JJASToolsTheme {
                HomeScreen(
                    hasAccess = hasAccess.value,
                    onGrantAccess = {
                        startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
                    },
                    spotify = SpotifyUi(
                        configured = SpotifyAuth.isConfigured,
                        logged = spotifyLogged.value,
                        message = spotifyMsg.value,
                        canOpenSpotify = canOverlay.value,
                        onAllowOpenSpotify = {
                            startActivity(
                                Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$packageName"))
                            )
                        },
                        onLogin = { startActivity(SpotifyAuth.loginIntent()) },
                        onLogout = {
                            SpotifyAuth.logout()
                            spotifyLogged.value = false
                            spotifyMsg.value = ""
                        },
                    ),
                )
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
        canOverlay.value = Settings.canDrawOverlays(this)
        hasAccess.value = NotificationManagerCompat.getEnabledListenerPackages(this).contains(packageName)
        if (hasAccess.value) MediaRepository.start(this)
    }
}

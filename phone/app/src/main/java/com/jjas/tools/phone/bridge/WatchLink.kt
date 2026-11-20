package com.jjas.tools.phone.bridge

import com.jjas.tools.phone.brief.WeatherRepository
import com.jjas.tools.phone.camera.CameraRepository
import com.jjas.tools.phone.fx.FxRepository
import com.jjas.tools.phone.media.MediaRepository
import com.jjas.tools.phone.spotify.SpotifyRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Link to the watch. For now it only logs outgoing messages (debug mode).
 * When Wear Engine is approved, send() will use P2pClient.send()
 * and the P2P receiver will call onFromWatch().
 */
object WatchLink {
    data class LogLine(val time: String, val dir: String, val text: String)

    private val _log = MutableStateFlow<List<LogLine>>(emptyList())
    val log: StateFlow<List<LogLine>> = _log

    private val fmt = SimpleDateFormat("HH:mm:ss", Locale.getDefault())

    private fun addLog(dir: String, text: String) {
        _log.update { (listOf(LogLine(fmt.format(Date()), dir, text)) + it).take(50) }
    }

    fun send(raw: String) {
        addLog("→ reloj", raw)
        // TODO(Fase 1): Wear Engine P2P send
    }

    /** Entry point for every message from the watch (or simulated by the UI). */
    fun onFromWatch(raw: String) {
        addLog("← reloj", raw)
        val msg = Protocol.decode(raw) ?: return
        when (msg.t) {
            "ping" -> send(Protocol.encode("pong", msg.d))
            "media.get" -> MediaRepository.pushState()
            "media.cmd" -> MediaRepository.command(msg.d.optString("a"), msg.d.optInt("v", -1))
            "fx.get" -> FxRepository.fetchAndSend()
            "brief.get" -> WeatherRepository.fetchAndSend()
            else -> when {
                msg.t.startsWith("sp.") -> SpotifyRepository.handle(msg.t, msg.d)
                msg.t.startsWith("cam.") -> CameraRepository.handle(msg.t, msg.d)
            }
        }
    }
}

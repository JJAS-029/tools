package com.jjas.tools.phone.media

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioManager
import android.net.Uri
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import com.jjas.tools.phone.bridge.Protocol
import com.jjas.tools.phone.bridge.WatchLink
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONObject

data class MediaState(
    val app: String = "",
    val title: String = "",
    val artist: String = "",
    val playing: Boolean = false,
    val pos: Long = 0,   // seconds
    val dur: Long = 0,   // seconds
    val vol: Int = 0,    // 0..100
) {
    fun toJson(): JSONObject = JSONObject()
        .put("app", app).put("title", title).put("artist", artist)
        .put("playing", playing).put("pos", pos).put("dur", dur).put("vol", vol)
}

/** Watches the active media session (Spotify or whatever is playing) and controls it. */
object MediaRepository {
    private const val TAG = "MediaRepository"

    private val _state = MutableStateFlow(MediaState())
    val state: StateFlow<MediaState> = _state

    private var appContext: Context? = null
    private var sessionManager: MediaSessionManager? = null
    private var audio: AudioManager? = null
    private var controller: MediaController? = null
    private val main = Handler(Looper.getMainLooper())

    private val sessionsListener =
        MediaSessionManager.OnActiveSessionsChangedListener { list -> pickController(list.orEmpty()) }

    private val callback = object : MediaController.Callback() {
        override fun onPlaybackStateChanged(state: PlaybackState?) = refresh()
        override fun onMetadataChanged(metadata: MediaMetadata?) = refresh()
        override fun onSessionDestroyed() {
            controller = null
            refresh()
        }
    }

    fun start(context: Context) {
        if (sessionManager != null) return
        val ctx = context.applicationContext
        appContext = ctx
        audio = ctx.getSystemService(AudioManager::class.java)
        val msm = ctx.getSystemService(MediaSessionManager::class.java)
        val component = ComponentName(ctx, MediaListenerService::class.java)
        try {
            msm.addOnActiveSessionsChangedListener(sessionsListener, component, main)
            sessionManager = msm
            pickController(msm.getActiveSessions(component))
        } catch (e: SecurityException) {
            Log.w(TAG, "Sin acceso a notificaciones", e)
        }
    }

    /**
     * Opens Spotify on the phone (on [uri] if there is one) so it registers in
     * Spotify Connect. From the background it needs the "Display over other apps" permission.
     */
    fun openSpotify(uri: String?): Boolean {
        val ctx = appContext ?: return false
        val intent = if (uri != null) {
            Intent(Intent.ACTION_VIEW, Uri.parse(uri)).setPackage(SPOTIFY)
        } else {
            ctx.packageManager.getLaunchIntentForPackage(SPOTIFY) ?: return false
        }
        return try {
            ctx.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            true
        } catch (e: Exception) {
            Log.w(TAG, "No se pudo abrir Spotify", e)
            false
        }
    }

    private const val SPOTIFY = "com.spotify.music"

    fun stop() {
        sessionManager?.removeOnActiveSessionsChangedListener(sessionsListener)
        sessionManager = null
        controller?.unregisterCallback(callback)
        controller = null
    }

    private fun pickController(list: List<MediaController>) {
        fun hasTitle(c: MediaController) =
            !c.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE).isNullOrBlank()
        // Priority: playing > has a song loaded > any session.
        val best = list.firstOrNull { it.playbackState?.state == PlaybackState.STATE_PLAYING }
            ?: list.firstOrNull(::hasTitle)
            ?: list.firstOrNull()
        if (best?.sessionToken != controller?.sessionToken) {
            controller?.unregisterCallback(callback)
            controller = best
            best?.registerCallback(callback, main)
        }
        refresh()
    }

    private fun appLabel(pkg: String): String {
        val pm = appContext?.packageManager ?: return pkg
        return try {
            pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
        } catch (e: PackageManager.NameNotFoundException) {
            pkg
        }
    }

    private fun volumePercent(): Int {
        val a = audio ?: return 0
        val max = a.getStreamMaxVolume(AudioManager.STREAM_MUSIC).coerceAtLeast(1)
        return a.getStreamVolume(AudioManager.STREAM_MUSIC) * 100 / max
    }

    private fun currentPositionMs(ps: PlaybackState?): Long {
        if (ps == null) return 0
        if (ps.state != PlaybackState.STATE_PLAYING) return ps.position
        val elapsed = SystemClock.elapsedRealtime() - ps.lastPositionUpdateTime
        return ps.position + (elapsed * ps.playbackSpeed).toLong()
    }

    fun refresh() {
        val c = controller
        val md = c?.metadata
        val ps = c?.playbackState
        val newState = MediaState(
            app = c?.packageName?.let(::appLabel) ?: "",
            title = md?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "",
            artist = md?.getString(MediaMetadata.METADATA_KEY_ARTIST) ?: "",
            playing = ps?.state == PlaybackState.STATE_PLAYING,
            pos = currentPositionMs(ps) / 1000,
            dur = (md?.getLong(MediaMetadata.METADATA_KEY_DURATION) ?: 0) / 1000,
            vol = volumePercent(),
        )
        val changed = newState != _state.value
        _state.value = newState
        if (changed) pushState()
    }

    fun pushState() {
        WatchLink.send(Protocol.encode("media.state", _state.value.toJson()))
    }

    /** [v] = target volume 0..100 (only for a = "vol", the watch slider). */
    fun command(a: String, v: Int = -1) {
        val tc = controller?.transportControls
        when (a) {
            "play" -> tc?.play()
            "pause" -> tc?.pause()
            "next" -> tc?.skipToNext()
            "prev" -> tc?.skipToPrevious()
            "vol+" -> audio?.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_RAISE, 0)
            "vol-" -> audio?.adjustStreamVolume(AudioManager.STREAM_MUSIC, AudioManager.ADJUST_LOWER, 0)
            "vol" -> audio?.let { am ->
                if (v >= 0) {
                    val max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
                    am.setStreamVolume(AudioManager.STREAM_MUSIC, Math.round(v.coerceIn(0, 100) * max / 100f), 0)
                }
            }
            else -> Log.w(TAG, "Comando desconocido: $a")
        }
        // Volume changes don't fire MediaController callbacks: refresh manually.
        main.postDelayed({ refresh() }, 250)
    }
}

package com.jjas.tools.phone.spotify

import android.util.Log
import com.jjas.tools.phone.bridge.Protocol
import com.jjas.tools.phone.bridge.WatchLink
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

/**
 * Handles the watch's Spotify requests (sp.*) and replies with small pages.
 * See docs/protocol.md.
 */
object SpotifyRepository {
    private const val TAG = "SpotifyRepository"
    const val PAGE = 15
    private const val MAX_TEXT = 40 // the watch has little memory: trim long names

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    /** First playlist from the last list (for the phone's test button). */
    @Volatile var lastFirstPlaylist: String? = null
        private set

    private fun short(s: String) = if (s.length <= MAX_TEXT) s else s.take(MAX_TEXT - 1) + "…"

    fun handle(t: String, d: JSONObject) {
        scope.launch {
            try {
                if (!SpotifyAuth.isLoggedIn) throw SpotifyException(401, "Inicia sesión en Spotify desde el teléfono")
                when (t) {
                    "sp.lists" -> lists(d.optInt("off"))
                    "sp.tracks" -> tracks(d.optString("id"), d.optInt("off"))
                    "sp.play" -> play(d.optString("id"), if (d.has("idx")) d.optInt("idx") else null)
                }
            } catch (e: SpotifyException) {
                Log.w(TAG, "$t falló (${e.code})", e)
                sendError(friendly(e))
            } catch (e: Exception) {
                Log.w(TAG, "$t falló", e)
                sendError("Sin conexión con Spotify")
            }
        }
    }

    private fun friendly(e: SpotifyException) = when (e.code) {
        401 -> e.message?.takeIf { !it.startsWith("{") } ?: "Inicia sesión de nuevo en el teléfono"
        403 -> "Spotify no lo permite (¿Premium?)"
        404 -> e.message?.takeIf { !it.startsWith("{") } ?: "Abre Spotify en tu teléfono"
        429 -> "Demasiadas peticiones, espera un poco"
        else -> "Error de Spotify (${e.code})"
    }

    private fun sendError(msg: String) =
        WatchLink.send(Protocol.encode("sp.err", JSONObject().put("msg", msg)))

    private fun lists(off: Int) {
        val page = SpotifyApi.playlists(off, PAGE)
        if (off == 0) page.items.firstOrNull()?.let { lastFirstPlaylist = it.id }
        val items = JSONArray()
        page.items.forEach { items.put(JSONObject().put("id", it.id).put("n", short(it.name)).put("c", it.count)) }
        val d = JSONObject().put("off", off).put("total", page.total).put("items", items)
        if (off == 0) d.put("liked", SpotifyApi.likedTotal())
        WatchLink.send(Protocol.encode("sp.lists.r", d))
    }

    private fun tracks(id: String, off: Int) {
        val page = SpotifyApi.tracks(id, off, PAGE)
        val items = JSONArray()
        page.items.forEach { items.put(JSONObject().put("n", short(it.name)).put("a", short(it.artist))) }
        WatchLink.send(
            Protocol.encode(
                "sp.tracks.r",
                JSONObject().put("id", id).put("off", off).put("total", page.total)
                    .put("locked", page.locked).put("items", items),
            )
        )
    }

    private fun play(id: String, idx: Int?) {
        SpotifyApi.play(id, idx)
        WatchLink.send(Protocol.encode("sp.play.r", JSONObject().put("ok", true)))
    }
}

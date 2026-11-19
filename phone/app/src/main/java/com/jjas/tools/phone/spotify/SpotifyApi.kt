package com.jjas.tools.phone.spotify

import com.jjas.tools.phone.media.MediaRepository
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/** Minimal Spotify Web API calls. All blocking: call from Dispatchers.IO. */
object SpotifyApi {
    private const val BASE = "https://api.spotify.com/v1"

    /** Fake id for "Liked songs" (/me/tracks). */
    const val LIKED = "liked"

    private fun call(method: String, path: String, body: JSONObject? = null): JSONObject {
        val conn = URL(BASE + path).openConnection() as HttpURLConnection
        conn.requestMethod = method
        conn.connectTimeout = 10_000
        conn.readTimeout = 15_000
        conn.setRequestProperty("Authorization", "Bearer ${SpotifyAuth.accessToken()}")
        if (body != null) {
            conn.doOutput = true
            conn.setRequestProperty("Content-Type", "application/json")
            conn.outputStream.use { it.write(body.toString().toByteArray()) }
        }
        val code = conn.responseCode
        val text = (if (code in 200..299) conn.inputStream else conn.errorStream)
            ?.bufferedReader()?.use { it.readText() }.orEmpty()
        if (code !in 200..299) throw SpotifyException(code, text)
        return if (text.isBlank()) JSONObject() else JSONObject(text)
    }

    fun playlists(offset: Int, limit: Int) =
        SpotifyParse.playlists(call("GET", "/me/playlists?limit=$limit&offset=$offset"))

    fun tracks(id: String, offset: Int, limit: Int): SpotifyParse.Page<SpotifyParse.Track> {
        if (id == LIKED) return SpotifyParse.tracks(call("GET", "/me/tracks?limit=$limit&offset=$offset"))
        return try {
            SpotifyParse.tracks(call("GET", "/playlists/$id/items?limit=$limit&offset=$offset"))
        } catch (e: SpotifyException) {
            // Playlists the user doesn't own: Spotify doesn't return their contents.
            if (e.code == 403) SpotifyParse.Page(0, emptyList(), locked = true) else throw e
        }
    }

    fun likedTotal(): Int = call("GET", "/me/tracks?limit=1").optInt("total")

    /**
     * Plays a playlist starting at the song at index [index] (null = from the start).
     * For "Liked songs" it sends the URIs of the 50-song block around it.
     */
    fun play(id: String, index: Int?) {
        val body = JSONObject()
        if (id == LIKED) {
            val start = ((index ?: 0) / 50) * 50
            val page = tracks(LIKED, start, 50)
            body.put("uris", JSONArray(page.items.map { it.uri }))
            body.put("offset", JSONObject().put("position", (index ?: 0) - start))
        } else {
            body.put("context_uri", "spotify:playlist:$id")
            if (index != null) body.put("offset", JSONObject().put("position", index))
        }
        try {
            call("PUT", "/me/player/play", body)
            return
        } catch (e: SpotifyException) {
            if (e.code != 404) throw e   // 404 = no active device
        }
        val device = findDevice(if (id == LIKED) null else "spotify:playlist:$id")
            ?: throw SpotifyException(404, "Abre Spotify en tu teléfono")
        call("PUT", "/me/player/play?device_id=$device", body)
    }

    /**
     * The phone as a Spotify Connect device. If Spotify is closed or "asleep" it
     * doesn't show up: we open it (on [openUri]) and wait for it to register (~10 s).
     */
    private fun findDevice(openUri: String?): String? {
        SpotifyParse.pickDevice(call("GET", "/me/player/devices"))?.let { return it }
        if (!MediaRepository.openSpotify(openUri)) return null
        repeat(12) {
            Thread.sleep(2_000)
            SpotifyParse.pickDevice(call("GET", "/me/player/devices"))?.let { return it }
        }
        return null
    }
}

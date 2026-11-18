package com.jjas.tools.phone.spotify

import org.json.JSONObject

/**
 * Pure parsing of Web API responses (unit-testable).
 * Supports both the post-February-2026 format ("items"/"item") and the old one ("tracks"/"track").
 */
object SpotifyParse {
    data class Playlist(val id: String, val name: String, val count: Int, val uri: String)
    data class Track(val name: String, val artist: String, val uri: String)
    data class Page<T>(val total: Int, val items: List<T>, val locked: Boolean = false)

    /** GET /me/playlists */
    fun playlists(json: JSONObject): Page<Playlist> {
        val arr = json.optJSONArray("items")
        val list = (0 until (arr?.length() ?: 0)).mapNotNull { i ->
            val p = arr!!.optJSONObject(i) ?: return@mapNotNull null
            val counter = p.optJSONObject("items") ?: p.optJSONObject("tracks")
            Playlist(
                id = p.optString("id"),
                name = p.optString("name"),
                count = counter?.optInt("total") ?: 0,
                uri = p.optString("uri"),
            )
        }
        return Page(json.optInt("total"), list)
    }

    /**
     * GET /playlists/{id}/items  or  GET /me/tracks.
     * Playlists not owned by the user come back without contents -> locked = true.
     */
    fun tracks(json: JSONObject): Page<Track> {
        val arr = json.optJSONArray("items") ?: return Page(0, emptyList(), locked = true)
        val list = (0 until arr.length()).mapNotNull { i ->
            val wrap = arr.optJSONObject(i) ?: return@mapNotNull null
            val t = wrap.optJSONObject("item") ?: wrap.optJSONObject("track") ?: return@mapNotNull null
            val artists = t.optJSONArray("artists")
            val artist = (0 until (artists?.length() ?: 0))
                .joinToString(", ") { artists!!.optJSONObject(it)?.optString("name").orEmpty() }
            Track(t.optString("name"), artist, t.optString("uri"))
        }
        return Page(json.optInt("total"), list)
    }

    /** GET /me/player/devices -> id of the best device to play on (or null). */
    fun pickDevice(json: JSONObject): String? {
        val arr = json.optJSONArray("devices") ?: return null
        val devs = (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
            .filter { !it.optBoolean("is_restricted") }
        val best = devs.firstOrNull { it.optBoolean("is_active") }
            ?: devs.firstOrNull { it.optString("type").equals("Smartphone", ignoreCase = true) }
            ?: devs.firstOrNull()
        return best?.optString("id")?.takeIf { it.isNotEmpty() }
    }
}

package com.jjas.tools.phone.spotify

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SpotifyParseTest {

    @Test
    fun playlists_newFormat_usesItemsTotal() {
        val json = JSONObject(
            """{"total": 2, "items": [
                {"id":"a","name":"Gym","uri":"spotify:playlist:a","items":{"total":40}},
                {"id":"b","name":"Viaje","uri":"spotify:playlist:b","items":{"total":7}}
            ]}"""
        )
        val page = SpotifyParse.playlists(json)
        assertEquals(2, page.total)
        assertEquals("Gym", page.items[0].name)
        assertEquals(40, page.items[0].count)
        assertEquals(7, page.items[1].count)
    }

    @Test
    fun playlists_oldFormat_usesTracksTotal() {
        val json = JSONObject("""{"total":1,"items":[{"id":"a","name":"X","uri":"u","tracks":{"total":3}}]}""")
        assertEquals(3, SpotifyParse.playlists(json).items[0].count)
    }

    @Test
    fun tracks_newFormat_itemKey_andMultipleArtists() {
        val json = JSONObject(
            """{"total": 1, "items": [
                {"item": {"name":"Canción","uri":"spotify:track:1",
                          "artists":[{"name":"A"},{"name":"B"}]}}
            ]}"""
        )
        val page = SpotifyParse.tracks(json)
        assertFalse(page.locked)
        assertEquals("Canción", page.items[0].name)
        assertEquals("A, B", page.items[0].artist)
        assertEquals("spotify:track:1", page.items[0].uri)
    }

    @Test
    fun tracks_savedTracks_trackKey() {
        val json = JSONObject("""{"total":1,"items":[{"track":{"name":"S","uri":"u","artists":[{"name":"Z"}]}}]}""")
        assertEquals("Z", SpotifyParse.tracks(json).items[0].artist)
    }

    @Test
    fun tracks_withoutItems_isLocked() {
        // Playlist the user doesn't own: Spotify returns only metadata.
        val page = SpotifyParse.tracks(JSONObject("""{"name":"Top 50"}"""))
        assertTrue(page.locked)
        assertTrue(page.items.isEmpty())
    }

    @Test
    fun pickDevice_prefersActive_thenSmartphone() {
        val active = JSONObject(
            """{"devices":[
                {"id":"pc","type":"Computer","is_active":false},
                {"id":"tv","type":"TV","is_active":true}
            ]}"""
        )
        assertEquals("tv", SpotifyParse.pickDevice(active))

        val idle = JSONObject(
            """{"devices":[
                {"id":"pc","type":"Computer","is_active":false},
                {"id":"s23","type":"Smartphone","is_active":false},
                {"id":"r","type":"Speaker","is_restricted":true}
            ]}"""
        )
        assertEquals("s23", SpotifyParse.pickDevice(idle))
        assertNull(SpotifyParse.pickDevice(JSONObject("""{"devices":[]}""")))
    }
}

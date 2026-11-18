package com.jjas.tools.phone.spotify

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Base64
import com.jjas.tools.phone.BuildConfig
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.security.MessageDigest
import java.security.SecureRandom

/**
 * Spotify login with OAuth "Authorization Code + PKCE": no client secret,
 * only the Client ID (set in phone/local.properties as spotify.clientId).
 * Tokens are stored in the app's private SharedPreferences.
 */
object SpotifyAuth {
    const val REDIRECT_URI = "jjastools://spotify-callback"
    private const val SCOPES =
        "playlist-read-private playlist-read-collaborative user-library-read " +
            "user-read-playback-state user-modify-playback-state"
    private const val PREFS = "spotify_auth"

    val clientId: String get() = BuildConfig.SPOTIFY_CLIENT_ID
    val isConfigured: Boolean get() = clientId.isNotBlank()

    private lateinit var appContext: Context
    private val prefs get() = appContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    val isLoggedIn: Boolean get() = prefs.getString("refresh", null) != null

    fun logout() = prefs.edit().clear().apply()

    // ---------- Step 1: open Spotify's login page in the browser ----------
    fun loginIntent(): Intent {
        val verifier = randomString(64)
        prefs.edit().putString("verifier", verifier).apply()
        val challenge = b64url(MessageDigest.getInstance("SHA-256").digest(verifier.toByteArray()))
        val url = Uri.parse("https://accounts.spotify.com/authorize").buildUpon()
            .appendQueryParameter("client_id", clientId)
            .appendQueryParameter("response_type", "code")
            .appendQueryParameter("redirect_uri", REDIRECT_URI)
            .appendQueryParameter("code_challenge_method", "S256")
            .appendQueryParameter("code_challenge", challenge)
            .appendQueryParameter("scope", SCOPES)
            .build()
        return Intent(Intent.ACTION_VIEW, url)
    }

    // ---------- Step 2: Spotify returns to jjastools://spotify-callback?code=... ----------
    /** Call from a background thread. Returns null if OK, or an error message. */
    fun handleCallback(uri: Uri): String? {
        uri.getQueryParameter("error")?.let { return "Spotify: $it" }
        val code = uri.getQueryParameter("code") ?: return "Falta el código de Spotify"
        val verifier = prefs.getString("verifier", null) ?: return "Inicia sesión de nuevo"
        return try {
            saveTokens(
                tokenRequest(
                    "grant_type" to "authorization_code",
                    "code" to code,
                    "redirect_uri" to REDIRECT_URI,
                    "client_id" to clientId,
                    "code_verifier" to verifier,
                )
            )
            null
        } catch (e: Exception) {
            "No se pudo iniciar sesión: ${e.message}"
        }
    }

    /** Valid access token (refreshed if expired). Call from a background thread. */
    @Synchronized
    fun accessToken(): String {
        val token = prefs.getString("access", null)
        val expires = prefs.getLong("expires", 0)
        if (token != null && System.currentTimeMillis() < expires - 60_000) return token
        val refresh = prefs.getString("refresh", null) ?: throw SpotifyException(401, "Sin sesión de Spotify")
        saveTokens(
            tokenRequest(
                "grant_type" to "refresh_token",
                "refresh_token" to refresh,
                "client_id" to clientId,
            )
        )
        return prefs.getString("access", null)!!
    }

    private fun saveTokens(json: JSONObject) {
        prefs.edit()
            .putString("access", json.getString("access_token"))
            .putLong("expires", System.currentTimeMillis() + json.optLong("expires_in", 3600) * 1000)
            .apply {
                // Spotify may or may not return a new refresh_token.
                json.optString("refresh_token").takeIf { it.isNotEmpty() }?.let { putString("refresh", it) }
            }
            .commit()
    }

    private fun tokenRequest(vararg params: Pair<String, String>): JSONObject {
        val body = params.joinToString("&") { (k, v) -> "$k=${URLEncoder.encode(v, "UTF-8")}" }
        val conn = URL("https://accounts.spotify.com/api/token").openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.doOutput = true
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
        conn.outputStream.use { it.write(body.toByteArray()) }
        val code = conn.responseCode
        val text = (if (code in 200..299) conn.inputStream else conn.errorStream)
            ?.bufferedReader()?.use { it.readText() }.orEmpty()
        if (code !in 200..299) throw SpotifyException(code, text)
        return JSONObject(text)
    }

    private fun randomString(len: Int): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        val rnd = SecureRandom()
        return (1..len).map { chars[rnd.nextInt(chars.length)] }.joinToString("")
    }

    private fun b64url(bytes: ByteArray) =
        Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
}

class SpotifyException(val code: Int, message: String) : Exception(message)

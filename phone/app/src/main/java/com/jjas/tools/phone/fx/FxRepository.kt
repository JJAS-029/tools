package com.jjas.tools.phone.fx

import android.content.Context
import android.content.SharedPreferences
import com.jjas.tools.phone.bridge.Protocol
import com.jjas.tools.phone.bridge.WatchLink
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class FxState(
    val usd: Double = 20.0,
    val date: String = "",
    val loading: Boolean = false,
    val error: String = "",
)

/**
 * Fetches the daily USD -> MXN exchange rate from free, keyless public APIs
 * (Frankfurter ECB with fallback to open.er-api.com), caches it locally and
 * pushes it to the watch via WatchLink ("fx.rate").
 */
object FxRepository {
    private var prefs: SharedPreferences? = null
    private val _state = MutableStateFlow(FxState())
    val state: StateFlow<FxState> = _state

    fun init(context: Context) {
        val p = context.applicationContext.getSharedPreferences("fx_cache", Context.MODE_PRIVATE)
        prefs = p
        val cached = p.getFloat("usd", 20f).toDouble()
        val date = p.getString("date", "") ?: ""
        _state.value = FxState(usd = cached, date = date)
    }

    fun fetchAndSend() {
        _state.value = _state.value.copy(loading = true, error = "")
        Thread {
            val res = queryFrankfurter() ?: queryOpenEr()
            if (res != null) {
                val (rate, date) = res
                val rounded = Math.round(rate * 100.0) / 100.0
                prefs?.edit()?.putFloat("usd", rounded.toFloat())?.putString("date", date)?.apply()
                _state.value = FxState(usd = rounded, date = date, loading = false, error = "")
                send(rounded, date)
            } else {
                val cur = _state.value
                _state.value = cur.copy(loading = false, error = "Sin conexión; usando caché")
                send(cur.usd, cur.date)
            }
        }.start()
    }

    private fun send(usd: Double, date: String) {
        WatchLink.send(
            Protocol.encode("fx.rate", JSONObject().put("usd", usd).put("date", date))
        )
    }

    private fun queryFrankfurter(): Pair<Double, String>? = try {
        val raw = httpGet("https://api.frankfurter.dev/v1/latest?base=USD&symbols=MXN")
        val obj = JSONObject(raw)
        val mxn = obj.getJSONObject("rates").getDouble("MXN")
        val date = obj.optString("date", today())
        if (mxn > 5.0 && mxn < 100.0) mxn to date else null
    } catch (_: Exception) {
        null
    }

    private fun queryOpenEr(): Pair<Double, String>? = try {
        val raw = httpGet("https://open.er-api.com/v6/latest/USD")
        val obj = JSONObject(raw)
        val mxn = obj.getJSONObject("rates").getDouble("MXN")
        if (mxn > 5.0 && mxn < 100.0) mxn to today() else null
    } catch (_: Exception) {
        null
    }

    private fun httpGet(urlStr: String): String {
        val conn = (URL(urlStr).openConnection() as HttpURLConnection).apply {
            connectTimeout = 6000
            readTimeout = 6000
            requestMethod = "GET"
        }
        return try {
            if (conn.responseCode !in 200..299) error("HTTP ${conn.responseCode}")
            conn.inputStream.bufferedReader().use { it.readText() }
        } finally {
            conn.disconnect()
        }
    }

    private fun today() = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
}

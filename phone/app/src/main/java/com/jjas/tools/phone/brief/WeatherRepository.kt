package com.jjas.tools.phone.brief

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

data class WeatherState(
    val temp: Double = 0.0,
    val max: Double = 0.0,
    val min: Double = 0.0,
    val rainPct: Int = 0,
    val wind: Double = 0.0,
    val updated: String = "",
    val loading: Boolean = false,
    val error: String = "",
)

/**
 * Fetches today's CDMX weather from Open-Meteo (free, no API key), caches it,
 * and sends "brief.weather" to the watch for Now Brief.
 */
object WeatherRepository {
    // CDMX center coordinates
    private const val API_URL =
        "https://api.open-meteo.com/v1/forecast?latitude=19.4326&longitude=-99.1332" +
            "&current=temperature_2m,wind_speed_10m" +
            "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
            "&timezone=America%2FMexico_City&forecast_days=1"

    private var prefs: SharedPreferences? = null
    private val _state = MutableStateFlow(WeatherState())
    val state: StateFlow<WeatherState> = _state

    fun init(context: Context) {
        val p = context.applicationContext.getSharedPreferences("brief_weather", Context.MODE_PRIVATE)
        prefs = p
        val updated = p.getString("updated", "") ?: ""
        if (updated.isNotEmpty()) {
            _state.value = WeatherState(
                temp = p.getFloat("temp", 0f).toDouble(),
                max = p.getFloat("max", 0f).toDouble(),
                min = p.getFloat("min", 0f).toDouble(),
                rainPct = p.getInt("rainPct", 0),
                wind = p.getFloat("wind", 0f).toDouble(),
                updated = updated,
            )
        }
    }

    fun fetchAndSend() {
        _state.value = _state.value.copy(loading = true, error = "")
        Thread {
            val fresh = queryOpenMeteo()
            if (fresh != null) {
                prefs?.edit()
                    ?.putFloat("temp", fresh.temp.toFloat())
                    ?.putFloat("max", fresh.max.toFloat())
                    ?.putFloat("min", fresh.min.toFloat())
                    ?.putInt("rainPct", fresh.rainPct)
                    ?.putFloat("wind", fresh.wind.toFloat())
                    ?.putString("updated", fresh.updated)
                    ?.apply()
                _state.value = fresh
                send(fresh)
            } else {
                val cur = _state.value
                _state.value = cur.copy(loading = false, error = "Sin conexión; usando caché")
                if (cur.updated.isNotEmpty()) send(cur)
            }
        }.start()
    }

    private fun send(w: WeatherState) {
        val d = JSONObject()
            .put("temp", w.temp)
            .put("max", w.max)
            .put("min", w.min)
            .put("rainPct", w.rainPct)
            .put("wind", w.wind)
            .put("updated", w.updated)
        WatchLink.send(Protocol.encode("brief.weather", d))
    }

    private fun queryOpenMeteo(): WeatherState? = try {
        val conn = (URL(API_URL).openConnection() as HttpURLConnection).apply {
            connectTimeout = 6000
            readTimeout = 6000
            requestMethod = "GET"
        }
        val raw = try {
            if (conn.responseCode !in 200..299) error("HTTP ${conn.responseCode}")
            conn.inputStream.bufferedReader().use { it.readText() }
        } finally {
            conn.disconnect()
        }
        val obj = JSONObject(raw)
        val cur = obj.getJSONObject("current")
        val daily = obj.getJSONObject("daily")
        val nowTxt = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        WeatherState(
            temp = cur.getDouble("temperature_2m"),
            wind = cur.optDouble("wind_speed_10m", 0.0),
            max = daily.getJSONArray("temperature_2m_max").getDouble(0),
            min = daily.getJSONArray("temperature_2m_min").getDouble(0),
            rainPct = daily.getJSONArray("precipitation_probability_max").optInt(0, 0),
            updated = nowTxt,
        )
    } catch (_: Exception) {
        null
    }
}

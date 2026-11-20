package com.jjas.tools.phone.safety

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.CancellationSignal
import android.os.Handler
import android.os.Looper
import android.telephony.SmsManager
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.jjas.tools.phone.R
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.text.Normalizer
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class SafetyState(
    val contactName: String = "Mamá",
    val contactPhone: String = "",
    val intervalMin: Int = 60,
    val riding: Boolean = false,
    val autoReply: Boolean = false,
    val leaveReminder: Boolean = false,
    val leaveItems: String = "Llaves, cartera, cargador, casco",
    val lastSent: String = "",
    val statusMsg: String = "",
)

/**
 * Shared state, SMS + GPS helpers, and notifications for Phase 2:
 *  - Periodic "Salí en bici" / "Llegué" notice (SafetyService)
 *  - Auto-reply to "¿Dónde estás?" SMS from the authorized contact
 *  - "¿Llevas todo?" notification when leaving Wi-Fi
 *
 * Holds only the applicationContext (no leak).
 */
@SuppressLint("StaticFieldLeak")
object SafetyRepository {
    const val CH_SAFETY = "jjas_safety"
    const val CH_REMINDER = "jjas_reminder"

    /** A location older than this is marked as "from X min ago" in the SMS. */
    private const val FRESH_MS = 3 * 60_000L

    /** Minimum time between automatic replies (avoids loops/spam). */
    private const val AUTO_REPLY_GAP_MS = 3 * 60_000L

    private var appCtx: Context? = null
    private var prefs: SharedPreferences? = null
    private val _state = MutableStateFlow(SafetyState())
    val state: StateFlow<SafetyState> = _state
    private val main by lazy { Handler(Looper.getMainLooper()) }

    fun init(context: Context) {
        val ctx = context.applicationContext
        appCtx = ctx
        val p = ctx.getSharedPreferences("safety_cfg", Context.MODE_PRIVATE)
        prefs = p
        ensureChannels(ctx)
        var loaded = SafetyState(
            contactName = p.getString("name", "Mamá") ?: "Mamá",
            contactPhone = p.getString("phone", "") ?: "",
            intervalMin = p.getInt("interval", 60),
            riding = p.getBoolean("riding", false),
            autoReply = p.getBoolean("autoReply", false),
            leaveReminder = p.getBoolean("leaveReminder", false),
            leaveItems = p.getString("leaveItems", "Llaves, cartera, cargador, casco")
                ?: "Llaves, cartera, cargador, casco",
            lastSent = p.getString("lastSent", "") ?: "",
        )
        // If the next notice should have gone out a while ago, the ride was interrupted
        // (phone restarted or Android killed the app): don't show "En bici" forever.
        val next = p.getLong("nextTickAt", 0L)
        if (loaded.riding && next > 0 && System.currentTimeMillis() > next + 15 * 60_000L) {
            p.edit().putBoolean("riding", false).apply()
            loaded = loaded.copy(riding = false, statusMsg = "Se interrumpió el aviso en bici. Vuelve a iniciarlo.")
        }
        _state.value = loaded
        if (loaded.leaveReminder) {
            WifiLeaveMonitor.start(ctx)
        }
    }

    fun updateContact(name: String, phone: String) {
        val cleanName = name.ifBlank { "Mamá" }
        prefs?.edit()?.putString("name", cleanName)?.putString("phone", phone.trim())?.apply()
        _state.value = _state.value.copy(contactName = cleanName, contactPhone = phone.trim(), statusMsg = "")
    }

    fun cycleInterval() {
        val next = when (_state.value.intervalMin) {
            30 -> 60
            60 -> 90
            else -> 30
        }
        prefs?.edit()?.putInt("interval", next)?.apply()
        _state.value = _state.value.copy(intervalMin = next)
    }

    fun setAutoReply(on: Boolean) {
        prefs?.edit()?.putBoolean("autoReply", on)?.apply()
        _state.value = _state.value.copy(autoReply = on)
    }

    fun setLeaveReminder(on: Boolean) {
        prefs?.edit()?.putBoolean("leaveReminder", on)?.apply()
        _state.value = _state.value.copy(leaveReminder = on)
        val ctx = appCtx ?: return
        if (on) WifiLeaveMonitor.start(ctx) else WifiLeaveMonitor.stop(ctx)
    }

    fun updateLeaveItems(items: String) {
        val v = items.ifBlank { "Llaves, cartera, cargador" }
        prefs?.edit()?.putString("leaveItems", v)?.apply()
        _state.value = _state.value.copy(leaveItems = v)
    }

    fun setRiding(on: Boolean) {
        prefs?.edit()?.putBoolean("riding", on)?.apply()
        if (!on) prefs?.edit()?.remove("nextTickAt")?.apply()
        _state.value = _state.value.copy(riding = on)
    }

    /** Ride state saved to disk (survives the process; the service uses it instead of memory). */
    fun isRidingSaved(): Boolean = prefs?.getBoolean("riding", false) ?: false

    fun setNextTick(at: Long) {
        prefs?.edit()?.putLong("nextTickAt", at)?.apply()
    }

    fun setStatus(msg: String) {
        _state.value = _state.value.copy(statusMsg = msg)
    }

    fun startRide(context: Context) {
        val st = _state.value
        if (digitsOnly(st.contactPhone).length < 10) {
            setStatus("Pon un número de 10 dígitos primero")
            return
        }
        if (!hasPerm(context, Manifest.permission.SEND_SMS) || !hasPerm(context, Manifest.permission.ACCESS_FINE_LOCATION)) {
            setStatus("Faltan permisos de SMS o Ubicación")
            return
        }
        val intent = Intent(context, SafetyService::class.java).setAction(SafetyService.ACTION_START)
        ContextCompat.startForegroundService(context, intent)
        if (!locationOn(context)) {
            setStatus("⚠️ La ubicación del teléfono está apagada: el SMS irá sin ubicación. Préndela en ajustes rápidos.")
        }
    }

    fun stopRide(context: Context) {
        val intent = Intent(context, SafetyService::class.java).setAction(SafetyService.ACTION_STOP)
        context.startService(intent)
    }

    fun hasPerm(ctx: Context, perm: String) =
        ContextCompat.checkSelfPermission(ctx, perm) == PackageManager.PERMISSION_GRANTED

    /** Location switch on the phone (quick settings). If it's off, no app gets GPS. */
    fun locationOn(ctx: Context): Boolean {
        val lm = ctx.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return false
        return androidx.core.location.LocationManagerCompat.isLocationEnabled(lm)
    }

    /** "Allow all the time": needed to reply "¿Dónde estás?" with the app closed. */
    fun hasBackgroundLocation(ctx: Context) =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.Q ||
            hasPerm(ctx, Manifest.permission.ACCESS_BACKGROUND_LOCATION)

    private fun hasAnyLocation(ctx: Context) =
        hasPerm(ctx, Manifest.permission.ACCESS_FINE_LOCATION) ||
            hasPerm(ctx, Manifest.permission.ACCESS_COARSE_LOCATION)

    /** Last known location across GPS and Network providers (most recent wins). Can be old. */
    @SuppressLint("MissingPermission")
    fun bestLastLocation(ctx: Context): Location? {
        if (!hasAnyLocation(ctx)) return null
        val lm = ctx.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return null
        var best: Location? = null
        val providers = mutableListOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) providers.add(0, LocationManager.FUSED_PROVIDER)
        for (p in providers) {
            val loc = try { lm.getLastKnownLocation(p) } catch (_: Exception) { null } ?: continue
            if (best == null || loc.time > best.time) best = loc
        }
        return best
    }

    /**
     * Asks for a FRESH location (GPS, or network if GPS is off). If it doesn't arrive
     * within [timeoutMs], returns the last known one (which may be old: the SMS says so).
     * [cb] is always called exactly once, on the main thread.
     */
    @SuppressLint("MissingPermission")
    fun currentLocation(ctx: Context, timeoutMs: Long, cb: (Location?) -> Unit) {
        if (!hasAnyLocation(ctx)) {
            main.post { cb(null) }
            return
        }
        val lm = ctx.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        if (lm == null) {
            main.post { cb(null) }
            return
        }
        val provider = bestProvider(ctx, lm)
        if (provider == null) {
            main.post { cb(bestLastLocation(ctx)) }
            return
        }
        requestFix(ctx, lm, provider, timeoutMs, cb)
    }

    /**
     * Combined provider (GPS + Wi-Fi + cell, Android 12+) when available: it gets a fix in
     * seconds even indoors. Tested on the S23: GPS alone got nothing in 25 s indoors.
     */
    fun bestProvider(ctx: Context, lm: LocationManager): String? = when {
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            lm.isProviderEnabled(LocationManager.FUSED_PROVIDER) -> LocationManager.FUSED_PROVIDER
        lm.isProviderEnabled(LocationManager.GPS_PROVIDER) &&
            hasPerm(ctx, Manifest.permission.ACCESS_FINE_LOCATION) -> LocationManager.GPS_PROVIDER
        lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER) -> LocationManager.NETWORK_PROVIDER
        else -> null
    }

    @SuppressLint("MissingPermission")
    private fun requestFix(ctx: Context, lm: LocationManager, provider: String, timeoutMs: Long, cb: (Location?) -> Unit) {
        var done = false
        fun finish(loc: Location?) {
            if (done) return
            done = true
            cb(loc ?: bestLastLocation(ctx))
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                val cancel = CancellationSignal()
                lm.getCurrentLocation(provider, cancel, ContextCompat.getMainExecutor(ctx)) { finish(it) }
                main.postDelayed({
                    if (!done) {
                        cancel.cancel()
                        finish(null)
                    }
                }, timeoutMs)
            } else {
                val listener = object : LocationListener {
                    override fun onLocationChanged(location: Location) {
                        lm.removeUpdates(this)
                        finish(location)
                    }
                }
                @Suppress("DEPRECATION")
                lm.requestSingleUpdate(provider, listener, Looper.getMainLooper())
                main.postDelayed({
                    if (!done) {
                        lm.removeUpdates(listener)
                        finish(null)
                    }
                }, timeoutMs)
            }
        } catch (_: Exception) {
            // No permission in the background, provider disabled, etc.
            main.post { finish(null) }
        }
    }

    /** Maps link + how old it is if it isn't fresh ("de hace 25 min"). */
    fun mapsLink(loc: Location?, now: Long = System.currentTimeMillis()): String {
        if (loc == null) return "(sin señal GPS ahorita)"
        val link = "https://maps.google.com/?q=%.5f,%.5f".format(Locale.US, loc.latitude, loc.longitude)
        val age = now - loc.time
        if (age <= FRESH_MS) return link
        val min = age / 60_000L
        val ago = if (min < 120) "$min min" else "${min / 60} h"
        return "$link (ubicación de hace $ago)"
    }

    fun sendSms(ctx: Context, phone: String, text: String): Boolean {
        if (!hasPerm(ctx, Manifest.permission.SEND_SMS) || phone.isBlank()) return false
        return try {
            val mgr = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                ctx.getSystemService(SmsManager::class.java)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }
            val parts = mgr.divideMessage(text)
            if (parts.size > 1) {
                mgr.sendMultipartTextMessage(phone, null, parts, null, null)
            } else {
                mgr.sendTextMessage(phone, null, text, null, null)
            }
            val nowTxt = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
            prefs?.edit()?.putString("lastSent", nowTxt)?.apply()
            _state.value = _state.value.copy(lastSent = nowTxt, statusMsg = "SMS enviado ($nowTxt)")
            true
        } catch (e: Exception) {
            setStatus("Error SMS: ${e.message ?: "falló"}")
            false
        }
    }

    /** Matches two phone numbers by their last 10 digits (ignores +52, spaces, dashes). */
    fun samePhone(a: String, b: String): Boolean {
        val da = digitsOnly(a)
        val db = digitsOnly(b)
        if (da.length < 10 || db.length < 10) return false
        return da.takeLast(10) == db.takeLast(10)
    }

    /**
     * True only if the SMS really asks where you are: "¿Dónde estás?", "donde andas",
     * "dónde vas" (accent/case/punctuation insensitive). A plain "dónde" no longer
     * counts (e.g. "¿dónde dejaste las llaves?").
     */
    fun isWhereQuery(body: String): Boolean {
        val norm = Normalizer.normalize(body, Normalizer.Form.NFD)
            .replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
            .lowercase(Locale.ROOT)
            .replace(Regex("[^a-z ]"), " ")
            .replace(Regex("\\s+"), " ")
        return Regex("\\bdonde (estas|andas|vas|te encuentras)\\b").containsMatchIn(norm)
    }

    /** Allows at most one auto-reply every 3 min. Records it if allowed. */
    fun allowAutoReply(now: Long = System.currentTimeMillis()): Boolean {
        val p = prefs ?: return true
        if (now - p.getLong("lastAutoReply", 0L) < AUTO_REPLY_GAP_MS) return false
        p.edit().putLong("lastAutoReply", now).apply()
        return true
    }

    fun digitsOnly(s: String) = s.filter { it.isDigit() }

    fun ensureChannels(ctx: Context) {
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
        nm.createNotificationChannel(
            NotificationChannel(CH_SAFETY, "Aviso en bici", NotificationManager.IMPORTANCE_LOW)
        )
        nm.createNotificationChannel(
            NotificationChannel(CH_REMINDER, "Recordatorios JJAS", NotificationManager.IMPORTANCE_HIGH)
        )
    }

    fun postWatchAlert(ctx: Context, id: Int, title: String, text: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            !hasPerm(ctx, Manifest.permission.POST_NOTIFICATIONS)
        ) return
        ensureChannels(ctx)
        val n = NotificationCompat.Builder(ctx, CH_REMINDER)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        nm?.notify(id, n)
    }
}

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
import android.location.LocationManager
import android.os.Build
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
 *  - Hourly "Salí en bici" / "Llegué" beacon
 *  - Auto-reply to "¿Dónde estás?" SMS from the authorized contact
 *  - "¿Llevas todo?" notification when leaving Wi-Fi
 */
object SafetyRepository {
    const val CH_SAFETY = "jjas_safety"
    const val CH_REMINDER = "jjas_reminder"

    private var appCtx: Context? = null
    private var prefs: SharedPreferences? = null
    private val _state = MutableStateFlow(SafetyState())
    val state: StateFlow<SafetyState> = _state

    fun init(context: Context) {
        val ctx = context.applicationContext
        appCtx = ctx
        val p = ctx.getSharedPreferences("safety_cfg", Context.MODE_PRIVATE)
        prefs = p
        ensureChannels(ctx)
        val loaded = SafetyState(
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
        _state.value = _state.value.copy(riding = on)
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
    }

    fun stopRide(context: Context) {
        val intent = Intent(context, SafetyService::class.java).setAction(SafetyService.ACTION_STOP)
        context.startService(intent)
    }

    fun hasPerm(ctx: Context, perm: String) =
        ContextCompat.checkSelfPermission(ctx, perm) == PackageManager.PERMISSION_GRANTED

    /** Last known location across GPS and Network providers (most recent wins). */
    @SuppressLint("MissingPermission")
    fun bestLastLocation(ctx: Context): Location? {
        if (!hasPerm(ctx, Manifest.permission.ACCESS_FINE_LOCATION) &&
            !hasPerm(ctx, Manifest.permission.ACCESS_COARSE_LOCATION)
        ) return null
        val lm = ctx.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return null
        var best: Location? = null
        for (p in listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER)) {
            val loc = try { lm.getLastKnownLocation(p) } catch (_: Exception) { null } ?: continue
            if (best == null || loc.time > best.time) best = loc
        }
        return best
    }

    fun mapsLink(loc: Location?): String = if (loc != null) {
        "https://maps.google.com/?q=%.5f,%.5f".format(Locale.US, loc.latitude, loc.longitude)
    } else {
        "(sin señal GPS ahorita)"
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

    /** True if the incoming SMS asks "dónde" / "donde" (accent & case insensitive). */
    fun isWhereQuery(body: String): Boolean {
        val norm = Normalizer.normalize(body, Normalizer.Form.NFD)
            .replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
            .lowercase(Locale.ROOT)
        return norm.contains("donde")
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

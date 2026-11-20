package com.jjas.tools.phone.safety

import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.jjas.tools.phone.R

/**
 * Foreground service: sends "Salí en bici" with your location and repeats every N
 * minutes until you tap "Ya llegué".
 *
 * Fixes vs. the first version:
 *  - Uses LIVE GPS during the ride (before, it sent the "last known location", which
 *    could be hours old). If it isn't fresh, the SMS says how old it is.
 *  - The next notice is scheduled with AlarmManager (works with the phone asleep;
 *    a Handler stops in deep sleep).
 *  - The ride state lives on disk: if Android kills the app, "Ya llegué" is still sent.
 */
class SafetyService : Service() {
    companion object {
        const val ACTION_START = "com.jjas.tools.phone.safety.START"
        const val ACTION_STOP = "com.jjas.tools.phone.safety.STOP"
        const val ACTION_TICK = "com.jjas.tools.phone.safety.TICK"
        private const val NOTIF_ID = 4201
        private const val FIX_TIMEOUT_MS = 25_000L
        private const val GPS_EVERY_MS = 60_000L
        private const val GPS_MIN_METERS = 30f
    }

    private var lastFix: Location? = null
    private var tracking = false

    private val gpsListener = object : LocationListener {
        override fun onLocationChanged(location: Location) {
            lastFix = location
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        SafetyRepository.init(this)
        when (intent?.action) {
            ACTION_START -> startRide()
            ACTION_TICK -> tick()
            ACTION_STOP -> stopRide()
            else -> stopSelf()
        }
        return START_NOT_STICKY
    }

    private fun startRide() {
        if (!goForeground()) {
            SafetyRepository.setStatus("No se pudo iniciar el aviso (permisos de ubicación)")
            stopSelf()
            return
        }
        SafetyRepository.setRiding(true)
        startGps()
        sendWithLocation { "Salí en bici 🚴 Mi ubicación: $it" }
        scheduleNext()
    }

    private fun tick() {
        if (!SafetyRepository.isRidingSaved()) {
            stopSelf()
            return
        }
        // If Android recreated the process, try to go back to foreground (may not be allowed).
        goForeground()
        startGps()
        sendWithLocation { "Sigo en bici 🚴 Aquí ando: $it" }
        scheduleNext()
    }

    private fun stopRide() {
        val wasRiding = SafetyRepository.isRidingSaved()
        cancelAlarm()
        stopGps()
        SafetyRepository.setRiding(false)
        if (wasRiding) {
            val st = SafetyRepository.state.value
            SafetyRepository.sendSms(this, st.contactPhone, "Ya llegué bien ✅")
        }
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    /** Fresh location (live GPS if it's recent, otherwise asks for one) → SMS. */
    private fun sendWithLocation(text: (String) -> String) {
        val fix = lastFix
        val now = System.currentTimeMillis()
        val send = { loc: Location? ->
            val st = SafetyRepository.state.value
            SafetyRepository.sendSms(this, st.contactPhone, text(SafetyRepository.mapsLink(loc)))
        }
        if (fix != null && now - fix.time < 2 * 60_000L) {
            send(fix)
        } else {
            SafetyRepository.currentLocation(this, FIX_TIMEOUT_MS) { loc ->
                if (loc != null) lastFix = loc
                send(loc)
            }
        }
    }

    private fun goForeground(): Boolean {
        val st = SafetyRepository.state.value
        val stopIntent = PendingIntent.getService(
            this, 1,
            Intent(this, SafetyService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val notif = NotificationCompat.Builder(this, SafetyRepository.CH_SAFETY)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("En bici · avisando a ${st.contactName}")
            .setContentText("Mandando ubicación cada ${st.intervalMin} min")
            .setOngoing(true)
            .addAction(0, "Ya llegué", stopIntent)
            .build()
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIF_ID, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
            } else {
                startForeground(NOTIF_ID, notif)
            }
            true
        } catch (_: Exception) {
            false
        }
    }

    @SuppressLint("MissingPermission")
    private fun startGps() {
        if (tracking) return
        val lm = getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return
        try {
            lm.requestLocationUpdates(
                LocationManager.GPS_PROVIDER, GPS_EVERY_MS, GPS_MIN_METERS, gpsListener, Looper.getMainLooper()
            )
            tracking = true
        } catch (_: Exception) {
            // GPS off or no permission: currentLocation() falls back to the network/last known one.
        }
    }

    private fun stopGps() {
        if (!tracking) return
        val lm = getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        try { lm?.removeUpdates(gpsListener) } catch (_: Exception) {}
        tracking = false
    }

    private fun tickIntent(): PendingIntent = PendingIntent.getService(
        this, 2,
        Intent(this, SafetyService::class.java).setAction(ACTION_TICK),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    /** Next notice with AlarmManager: fires even if the phone is asleep (Doze). */
    private fun scheduleNext() {
        val am = getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val at = System.currentTimeMillis() + SafetyRepository.state.value.intervalMin * 60_000L
        SafetyRepository.setNextTick(at)
        val pi = tickIntent()
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            } else {
                // Without the "Alarms and reminders" permission: Android may delay it a few minutes.
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            }
        } catch (_: SecurityException) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
        }
    }

    private fun cancelAlarm() {
        val am = getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        am.cancel(tickIntent())
    }

    override fun onDestroy() {
        // The ride state lives on disk and the alarm stays: if Android killed the
        // service, the next notice brings it back. Only stopRide() ends the ride.
        stopGps()
        super.onDestroy()
    }
}

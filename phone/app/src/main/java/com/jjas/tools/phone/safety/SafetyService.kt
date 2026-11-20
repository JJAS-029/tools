package com.jjas.tools.phone.safety

import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.jjas.tools.phone.R

/**
 * Foreground service that sends an initial "Salí en bici" SMS with your Maps
 * link and repeats every N minutes until you tap "Llegué".
 */
class SafetyService : Service() {
    companion object {
        const val ACTION_START = "com.jjas.tools.phone.safety.START"
        const val ACTION_STOP = "com.jjas.tools.phone.safety.STOP"
        private const val NOTIF_ID = 4201
    }

    private val handler = Handler(Looper.getMainLooper())
    private var running = false

    private val periodicTick = object : Runnable {
        override fun run() {
            if (!running) return
            val st = SafetyRepository.state.value
            val loc = SafetyRepository.bestLastLocation(this@SafetyService)
            val msg = "Sigo en bici 🚴 Aquí ando: ${SafetyRepository.mapsLink(loc)}"
            SafetyRepository.sendSms(this@SafetyService, st.contactPhone, msg)
            handler.postDelayed(this, st.intervalMin * 60_000L)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        SafetyRepository.init(this)
        when (intent?.action) {
            ACTION_STOP -> {
                if (running) {
                    val st = SafetyRepository.state.value
                    SafetyRepository.sendSms(this, st.contactPhone, "Ya llegué bien ✅")
                }
                stopBeacon()
            }
            ACTION_START -> startBeacon()
        }
        return START_NOT_STICKY
    }

    private fun startBeacon() {
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

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIF_ID, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION)
        } else {
            startForeground(NOTIF_ID, notif)
        }

        running = true
        SafetyRepository.setRiding(true)

        // Initial SMS immediately + schedule hourly pings
        val loc = SafetyRepository.bestLastLocation(this)
        val firstMsg = "Salí en bici 🚴 Mi ubicación: ${SafetyRepository.mapsLink(loc)}"
        SafetyRepository.sendSms(this, st.contactPhone, firstMsg)

        handler.removeCallbacks(periodicTick)
        handler.postDelayed(periodicTick, st.intervalMin * 60_000L)
    }

    private fun stopBeacon() {
        running = false
        handler.removeCallbacks(periodicTick)
        SafetyRepository.setRiding(false)
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        running = false
        handler.removeCallbacks(periodicTick)
        SafetyRepository.setRiding(false)
        super.onDestroy()
    }
}

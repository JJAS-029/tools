package com.jjas.tools.phone.media

import android.service.notification.NotificationListenerService
import com.jjas.tools.phone.camera.CameraRepository
import com.jjas.tools.phone.safety.SafetyRepository

/**
 * Android only allows reading/controlling other apps' MediaSessions
 * (Spotify, YouTube Music...) if the app has notification access.
 * Later this same service will read Google Maps navigation notifications.
 */
class MediaListenerService : NotificationListenerService() {
    override fun onListenerConnected() {
        MediaRepository.start(applicationContext)
        CameraRepository.init(applicationContext)
        // Android keeps the notification listener alive: from here the "¿Llevas todo?"
        // monitor survives even if the app is closed.
        SafetyRepository.init(applicationContext)
    }

    override fun onListenerDisconnected() {
        MediaRepository.stop()
    }
}

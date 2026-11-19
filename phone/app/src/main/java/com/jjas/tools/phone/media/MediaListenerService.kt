package com.jjas.tools.phone.media

import android.service.notification.NotificationListenerService
import com.jjas.tools.phone.camera.CameraRepository

/**
 * Android only allows reading/controlling other apps' MediaSessions
 * (Spotify, YouTube Music...) if the app has notification access.
 * Later this same service will read Google Maps navigation notifications.
 */
class MediaListenerService : NotificationListenerService() {
    override fun onListenerConnected() {
        MediaRepository.start(applicationContext)
        CameraRepository.init(applicationContext)
    }

    override fun onListenerDisconnected() {
        MediaRepository.stop()
    }
}

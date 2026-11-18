package com.jjas.tools.phone.media

import android.service.notification.NotificationListenerService

/**
 * Android only allows reading/controlling other apps' MediaSessions
 * (Spotify, YouTube Music...) if the app has notification access.
 * Later this same service will read Google Maps navigation notifications.
 */
class MediaListenerService : NotificationListenerService() {
    override fun onListenerConnected() {
        MediaRepository.start(applicationContext)
    }

    override fun onListenerDisconnected() {
        MediaRepository.stop()
    }
}

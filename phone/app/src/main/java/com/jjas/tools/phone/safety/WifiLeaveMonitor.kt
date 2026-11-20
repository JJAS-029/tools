package com.jjas.tools.phone.safety

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest

/**
 * Posts a "¿Llevas todo?" notification (which Huawei Health forwards to the watch)
 * whenever the phone disconnects from Wi-Fi after being connected for at least 2 minutes.
 */
object WifiLeaveMonitor {
    private const val MIN_STAY_MS = 2 * 60_000L
    private var callback: ConnectivityManager.NetworkCallback? = null
    private var connectedAt = 0L

    fun start(context: Context) {
        if (callback != null) return
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return
        val req = NetworkRequest.Builder()
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .build()
        val cb = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                connectedAt = System.currentTimeMillis()
            }

            override fun onLost(network: Network) {
                val stayed = System.currentTimeMillis() - connectedAt
                if (connectedAt > 0 && stayed >= MIN_STAY_MS) {
                    val items = SafetyRepository.state.value.leaveItems
                    SafetyRepository.postWatchAlert(
                        context.applicationContext, 4203,
                        "🔑 ¿Llevas todo?",
                        items,
                    )
                }
                connectedAt = 0L
            }
        }
        try {
            cm.registerNetworkCallback(req, cb)
            callback = cb
        } catch (_: Exception) {
        }
    }

    fun stop(context: Context) {
        val cb = callback ?: return
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return
        try {
            cm.unregisterNetworkCallback(cb)
        } catch (_: Exception) {
        }
        callback = null
        connectedAt = 0L
    }
}

package com.jjas.tools.phone.camera

import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import com.jjas.tools.phone.bridge.Protocol
import com.jjas.tools.phone.bridge.WatchLink
import org.json.JSONObject
import java.lang.ref.WeakReference

/**
 * Watch camera remote (cam.*). Opens [CameraActivity] and forwards commands to it.
 * See docs/protocol.md.
 */
object CameraRepository {
    private var appContext: Context? = null
    private var activity = WeakReference<CameraActivity>(null)
    private val main = Handler(Looper.getMainLooper())

    /** Shot requested before the camera was open: fired as soon as it opens. */
    private var pendingTimer: Int? = null

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    fun handle(t: String, d: JSONObject) {
        main.post {
            val cam = activity.get()
            when (t) {
                "cam.open" -> if (cam == null) open() else sendState(cam.isFront)
                "cam.shoot" -> {
                    val timer = d.optInt("timer", 0).coerceIn(0, 10)
                    if (cam == null) {
                        pendingTimer = timer
                        open()
                    } else {
                        cam.shoot(timer)
                    }
                }
                "cam.flip" -> cam?.flip()
                "cam.close" -> cam?.finish()
            }
        }
    }

    private fun open() {
        val ctx = appContext
        if (ctx == null) {
            sendResult(false, "La app del teléfono no está lista")
            return
        }
        try {
            ctx.startActivity(
                Intent(ctx, CameraActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            )
        } catch (e: Exception) {
            sendResult(false, "No se pudo abrir la cámara")
        }
    }

    // ---------- Called by CameraActivity ----------
    fun attach(cam: CameraActivity) {
        activity = WeakReference(cam)
    }

    fun detach(cam: CameraActivity) {
        if (activity.get() === cam) {
            activity = WeakReference(null)
            pendingTimer = null
            WatchLink.send(Protocol.encode("cam.state", JSONObject().put("open", false)))
        }
    }

    /** The camera is ready: report state and fire a pending shot, if any. */
    fun onReady(cam: CameraActivity) {
        sendState(cam.isFront)
        pendingTimer?.let {
            pendingTimer = null
            cam.shoot(it)
        }
    }

    fun sendState(front: Boolean) =
        WatchLink.send(Protocol.encode("cam.state", JSONObject().put("open", true).put("front", front)))

    fun sendCount(s: Int) = WatchLink.send(Protocol.encode("cam.count", JSONObject().put("s", s)))

    fun sendResult(ok: Boolean, text: String) =
        WatchLink.send(
            Protocol.encode("cam.result", JSONObject().put("ok", ok).put(if (ok) "name" else "msg", text))
        )
}

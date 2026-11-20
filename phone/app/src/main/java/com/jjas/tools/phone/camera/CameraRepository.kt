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

    /** Command received before the camera was open: run as soon as it opens. */
    private var pending: ((CameraActivity) -> Unit)? = null

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    fun handle(t: String, d: JSONObject) {
        main.post {
            val cam = activity.get()
            val timer = d.optInt("timer", 0).coerceIn(0, 10)
            when (t) {
                "cam.open" -> if (cam == null) open() else sendState(cam)
                "cam.shoot" -> withCamera(cam) { it.shoot(timer) }
                "cam.mode" -> {
                    val video = d.optString("m") == "video"
                    withCamera(cam) { it.setMode(video) }
                }
                "cam.rec" -> when (d.optString("a")) {
                    "start" -> withCamera(cam) { it.startRec(timer) }
                    "stop" -> cam?.stopRec()
                }
                "cam.flip" -> cam?.flip()
                "cam.close" -> cam?.closeFromWatch()
            }
        }
    }

    private fun withCamera(cam: CameraActivity?, action: (CameraActivity) -> Unit) {
        if (cam == null) {
            pending = action
            open()
        } else {
            action(cam)
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
            pending = null
            WatchLink.send(Protocol.encode("cam.state", JSONObject().put("open", false)))
        }
    }

    /** The camera is ready: report state and run a pending command, if any. */
    fun onReady(cam: CameraActivity) {
        sendState(cam)
        pending?.let {
            pending = null
            it(cam)
        }
    }

    fun sendState(cam: CameraActivity) =
        WatchLink.send(
            Protocol.encode(
                "cam.state",
                JSONObject().put("open", true).put("front", cam.isFront)
                    .put("mode", if (cam.isVideo) "video" else "photo").put("rec", cam.isRecording),
            )
        )

    fun sendCount(s: Int) = WatchLink.send(Protocol.encode("cam.count", JSONObject().put("s", s)))

    fun sendRec(on: Boolean) = WatchLink.send(Protocol.encode("cam.rec.state", JSONObject().put("on", on)))

    fun sendResult(ok: Boolean, text: String, video: Boolean = false) =
        WatchLink.send(
            Protocol.encode(
                "cam.result",
                JSONObject().put("ok", ok).put(if (ok) "name" else "msg", text).put("video", video),
            )
        )
}

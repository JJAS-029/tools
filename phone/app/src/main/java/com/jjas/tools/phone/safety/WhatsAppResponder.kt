package com.jjas.tools.phone.safety

import android.app.Notification
import android.app.RemoteInput
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.service.notification.StatusBarNotification
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * "¿Dónde estás?" over WhatsApp, with no WhatsApp API: reads the message notification
 * (we have notification access) and replies with the notification's own "Reply"
 * button, the same as when you reply from the notification shade.
 *
 * Only 1-to-1 chats whose name matches the configured one (WhatsApp doesn't expose
 * the number), only the "¿Dónde estás?" question, max 1 reply every 3 min.
 */
object WhatsAppResponder {
    private const val TAG = "SafetyWA"
    private val PACKAGES = setOf("com.whatsapp", "com.whatsapp.w4b")

    /** Last message we already answered (WhatsApp re-posts the same notification). */
    private var lastHandled = ""

    fun onPosted(ctx: Context, sbn: StatusBarNotification) {
        if (sbn.packageName !in PACKAGES) return
        val n = sbn.notification ?: return
        if (n.flags and Notification.FLAG_GROUP_SUMMARY != 0) return

        val msg = lastMessage(n) ?: return
        SafetyRepository.ensureInit(ctx)
        // Remembers who wrote (to suggest the chat name in the card).
        if (!msg.group) SafetyRepository.noteWaSender(msg.sender)

        val st = SafetyRepository.state.value
        if (!st.waAutoReply || st.waName.isBlank()) return
        if (msg.group || !SafetyRepository.sameName(msg.sender, st.waName)) return
        if (!SafetyRepository.isWhereQuery(msg.text)) return

        val id = "${msg.sender}|${msg.time}|${msg.text}"
        if (id == lastHandled) return
        lastHandled = id
        if (!SafetyRepository.allowAutoReply(key = "lastWaReply")) {
            Log.i(TAG, "rate limited")
            return
        }

        val action = replyAction(n)
        if (action == null) {
            SafetyRepository.setStatus("WhatsApp: la notificación no trae botón Responder")
            return
        }
        val app = ctx.applicationContext
        SafetyRepository.currentLocation(app, 8_000L) { loc ->
            val text = "Aquí ando 📍 ${SafetyRepository.mapsLink(loc)}"
            if (sendReply(app, action, text)) {
                SafetyRepository.setStatus("WhatsApp: ubicación enviada a ${msg.sender}")
                SafetyRepository.postWatchAlert(
                    app, 4204,
                    "Ubicación enviada a ${msg.sender}",
                    "Respondí su WhatsApp automáticamente",
                )
            }
        }
    }

    private class Msg(val sender: String, val text: String, val time: Long, val group: Boolean)

    /** Last message in the notification (WhatsApp uses MessagingStyle). */
    private fun lastMessage(n: Notification): Msg? {
        val style = NotificationCompat.MessagingStyle.extractMessagingStyleFromNotification(n)
        if (style != null) {
            val m = style.messages.lastOrNull() ?: return null
            // person == null means the message is yours (e.g. our own reply that WhatsApp adds).
            val sender = m.person?.name?.toString() ?: return null
            return Msg(sender, m.text?.toString() ?: "", m.timestamp, style.isGroupConversation)
        }
        val ex = n.extras ?: return null
        val title = ex.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: return null
        val text = ex.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: return null
        // Without MessagingStyle, groups look like "Group: Person"; we ignore them.
        return Msg(title, text, n.`when`, title.contains(":"))
    }

    /** The notification's "Reply" button (the one with text input). */
    private fun replyAction(n: Notification): Notification.Action? {
        val actions = n.actions ?: return null
        val withInput = actions.filter { !it.remoteInputs.isNullOrEmpty() }
        val reply = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            withInput.firstOrNull { it.semanticAction == Notification.Action.SEMANTIC_ACTION_REPLY }
        } else {
            null
        }
        return reply ?: withInput.firstOrNull()
    }

    private fun sendReply(ctx: Context, action: Notification.Action, text: String): Boolean = try {
        val inputs = action.remoteInputs
        val results = Bundle().apply { inputs.forEach { putCharSequence(it.resultKey, text) } }
        val fill = Intent().addFlags(Intent.FLAG_RECEIVER_FOREGROUND)
        RemoteInput.addResultsToIntent(inputs, fill, results)
        action.actionIntent.send(ctx, 0, fill)
        Log.i(TAG, "reply sent")
        true
    } catch (e: Exception) {
        Log.w(TAG, "reply failed", e)
        SafetyRepository.setStatus("WhatsApp: no pude responder (${e.message ?: "error"})")
        false
    }
}

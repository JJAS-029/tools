package com.jjas.tools.phone.safety

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

/**
 * Listens for incoming SMS. If auto-reply is enabled, the sender is the authorized
 * contact and the message asks "¿Dónde estás?" (or "dónde andas"), replies with the
 * location (fresh if available; otherwise it says how old it is).
 *
 * Note: an SMS sender can be spoofed. That's why it only replies to that exact
 * question, at most once every 3 min, and notifies the watch every time it replies.
 */
class SmsLocationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
        SafetyRepository.init(context)
        val st = SafetyRepository.state.value
        if (!st.autoReply || st.contactPhone.isBlank()) return

        val msgs = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
        var sender = ""
        val body = StringBuilder()
        for (m in msgs) {
            if (sender.isEmpty()) sender = m.originatingAddress ?: ""
            body.append(m.messageBody ?: "")
        }
        if (!SafetyRepository.samePhone(sender, st.contactPhone) ||
            !SafetyRepository.isWhereQuery(body.toString()) ||
            !SafetyRepository.allowAutoReply()
        ) return

        // goAsync: we have a few seconds to get a fresh location before replying.
        val pending = goAsync()
        val app = context.applicationContext
        SafetyRepository.currentLocation(app, 8_000L) { loc ->
            try {
                val reply = "Aquí ando 📍 ${SafetyRepository.mapsLink(loc)}"
                if (SafetyRepository.sendSms(app, sender, reply)) {
                    val warn = if (loc == null && !SafetyRepository.hasBackgroundLocation(app)) {
                        " · Sin ubicación: permite 'Todo el tiempo'"
                    } else {
                        ""
                    }
                    SafetyRepository.postWatchAlert(
                        app, 4202,
                        "Ubicación enviada a ${st.contactName}",
                        "Respondí automáticamente a su SMS$warn",
                    )
                }
            } finally {
                pending.finish()
            }
        }
    }
}

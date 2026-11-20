package com.jjas.tools.phone.safety

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

/**
 * Listens for incoming SMS. If auto-reply is enabled, the sender matches the
 * authorized contact (e.g. Mom), and the text asks "dónde", replies automatically
 * with the current Google Maps location link.
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

        if (SafetyRepository.samePhone(sender, st.contactPhone) && SafetyRepository.isWhereQuery(body.toString())) {
            val loc = SafetyRepository.bestLastLocation(context)
            val reply = "Aquí ando 📍 ${SafetyRepository.mapsLink(loc)}"
            if (SafetyRepository.sendSms(context, sender, reply)) {
                SafetyRepository.postWatchAlert(
                    context, 4202,
                    "Ubicación enviada a ${st.contactName}",
                    "Respondí automáticamente a su SMS",
                )
            }
        }
    }
}

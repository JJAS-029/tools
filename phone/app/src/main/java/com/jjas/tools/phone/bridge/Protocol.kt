package com.jjas.tools.phone.bridge

import org.json.JSONObject

/** Watch <-> phone messages: {"t": "<type>", "d": {...}}. See docs/protocol.md. */
object Protocol {
    data class Msg(val t: String, val d: JSONObject)

    fun encode(t: String, d: JSONObject = JSONObject()): String =
        JSONObject().put("t", t).put("d", d).toString()

    fun decode(raw: String): Msg? = try {
        val o = JSONObject(raw)
        val t = o.optString("t")
        if (t.isEmpty()) null else Msg(t, o.optJSONObject("d") ?: JSONObject())
    } catch (e: Exception) {
        null
    }
}

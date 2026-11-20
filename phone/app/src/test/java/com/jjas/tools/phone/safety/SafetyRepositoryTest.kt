package com.jjas.tools.phone.safety

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SafetyRepositoryTest {
    @Test
    fun whereQuery_onlyRealQuestion() {
        assertTrue(SafetyRepository.isWhereQuery("¿Dónde estás?"))
        assertTrue(SafetyRepository.isWhereQuery("hijo donde andas??"))
        assertTrue(SafetyRepository.isWhereQuery("DONDE ESTAS"))
        assertTrue(SafetyRepository.isWhereQuery("¿dónde te encuentras?"))
        // Before these triggered the reply too:
        assertFalse(SafetyRepository.isWhereQuery("¿Dónde dejaste las llaves?"))
        assertFalse(SafetyRepository.isWhereQuery("dondequiera que vayas"))
        assertFalse(SafetyRepository.isWhereQuery("ok"))
    }

    @Test
    fun samePhone_ignoresPrefixAndFormat() {
        assertTrue(SafetyRepository.samePhone("+52 55 1234 5678", "5512345678"))
        assertTrue(SafetyRepository.samePhone("+5215512345678", "55-1234-5678"))
        assertFalse(SafetyRepository.samePhone("5512345679", "5512345678"))
        assertFalse(SafetyRepository.samePhone("12345", "12345"))
    }

    @Test
    fun mapsLink_nullMeansNoSignal() {
        assertEquals("(sin señal GPS ahorita)", SafetyRepository.mapsLink(null))
    }

    @Test
    fun plainSms_removesEmojiAndAccents() {
        assertEquals(
            "Sali en bici Mi ubicacion: https://maps.google.com/?q=19.12345,-99.12345",
            SafetyRepository.plainSms("Salí en bici 🚴 Mi ubicación: https://maps.google.com/?q=19.12345,-99.12345"),
        )
        assertEquals("Ya llegue bien", SafetyRepository.plainSms("Ya llegué bien ✅"))
    }

    @Test
    fun sameName_ignoresCaseAccentsAndEmoji() {
        assertTrue(SafetyRepository.sameName("Koala ❤️", "koala"))
        assertTrue(SafetyRepository.sameName("Mamá", "mama"))
        assertFalse(SafetyRepository.sameName("Koala Trabajo", "Koala"))
        assertFalse(SafetyRepository.sameName("", ""))
    }
}

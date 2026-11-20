/**
 * CDMX / Edomex "Hoy No Circula" pure rules (zero platform imports).
 * Tested in Node via scripts/test_hnccalc.mjs.
 */

// Last plate digit -> weekday rest (1=Mon .. 5=Fri) + sticker info
const DIGIT_INFO = {
    5: { day: 1, dayName: 'Lunes', colorName: 'Amarillo', hex: '#ffd54f' },
    6: { day: 1, dayName: 'Lunes', colorName: 'Amarillo', hex: '#ffd54f' },
    7: { day: 2, dayName: 'Martes', colorName: 'Rosa', hex: '#f28ab2' },
    8: { day: 2, dayName: 'Martes', colorName: 'Rosa', hex: '#f28ab2' },
    3: { day: 3, dayName: 'Miércoles', colorName: 'Rojo', hex: '#ff7961' },
    4: { day: 3, dayName: 'Miércoles', colorName: 'Rojo', hex: '#ff7961' },
    1: { day: 4, dayName: 'Jueves', colorName: 'Verde', hex: '#66bb6a' },
    2: { day: 4, dayName: 'Jueves', colorName: 'Verde', hex: '#66bb6a' },
    9: { day: 5, dayName: 'Viernes', colorName: 'Azul', hex: '#64b5f6' },
    0: { day: 5, dayName: 'Viernes', colorName: 'Azul', hex: '#64b5f6' }
};

export const HOLOGRAMS = ['00', '0', '1', '2'];

export function defaultHnc() {
    return { digit: 1, holo: '0' };
}

export function digitInfo(digit) {
    const d = ((Number(digit) % 10) + 10) % 10;
    return DIGIT_INFO[d];
}

/** 1..5: which Saturday of the month this date is. */
export function saturdayIndex(dateObj) {
    return Math.ceil(dateObj.getDate() / 7);
}

/**
 * Evaluates whether the car can circulate on `ts`.
 * Returns { ok, title, reason, sticker }
 */
export function hncStatus(cfg, ts) {
    const d = new Date(ts);
    const dow = d.getDay(); // 0=Sun .. 6=Sat
    const digit = ((Number(cfg.digit) % 10) + 10) % 10;
    const holo = '' + (cfg.holo || '0');
    const info = DIGIT_INFO[digit];

    if (holo === '00' || holo === '0') {
        return {
            ok: true,
            title: 'Sí circulas',
            reason: 'Holo ' + holo + ' · Diario',
            sticker: info
        };
    }

    // Sundays always circulate
    if (dow === 0) {
        return {
            ok: true,
            title: 'Sí circulas',
            reason: 'Domingo libre',
            sticker: info
        };
    }

    // Monday..Friday
    if (dow >= 1 && dow <= 5) {
        if (dow === info.day) {
            return {
                ok: false,
                title: 'NO circulas',
                reason: info.dayName + ' · ' + info.colorName + ' ' + digit,
                sticker: info
            };
        }
        return {
            ok: true,
            title: 'Sí circulas',
            reason: 'Descansas ' + info.dayName,
            sticker: info
        };
    }

    // Saturday (dow === 6)
    if (holo === '2') {
        return {
            ok: false,
            title: 'NO circulas',
            reason: 'Holo 2 · Sábados',
            sticker: info
        };
    }
    // Hologram 1: odd digits rest 1st & 3rd Sat; even digits rest 2nd & 4th Sat; 5th Sat free
    const satNum = saturdayIndex(d);
    const isOdd = digit % 2 === 1;
    const restsSat = (isOdd && (satNum === 1 || satNum === 3)) || (!isOdd && (satNum === 2 || satNum === 4));
    if (restsSat) {
        return {
            ok: false,
            title: 'NO circulas',
            reason: satNum + '° sábado (' + (isOdd ? 'impar' : 'par') + ')',
            sticker: info
        };
    }
    return {
        ok: true,
        title: 'Sí circulas',
        reason: satNum + '° sábado libre',
        sticker: info
    };
}

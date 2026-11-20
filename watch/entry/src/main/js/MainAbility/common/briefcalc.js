/**
 * Pure helpers for "Now Brief" (daily summary: greeting, Mexican/world special days,
 * smart weather alerts). Zero platform imports so it can be unit-tested in Node.
 */

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Key Mexican & international dates (MM-DD)
const SPECIAL_DAYS = {
    '01-01': 'Año Nuevo',
    '01-06': 'Día de Reyes',
    '02-02': 'Día de la Candelaria',
    '02-05': 'Día de la Constitución',
    '02-14': 'San Valentín',
    '02-24': 'Día de la Bandera',
    '03-08': 'Día de la Mujer',
    '03-21': 'Inicio de Primavera',
    '04-22': 'Día de la Tierra',
    '04-30': 'Día del Niño',
    '05-01': 'Día del Trabajo',
    '05-05': 'Batalla de Puebla',
    '05-10': 'Día de las Madres',
    '05-15': 'Día del Maestro',
    '06-05': 'Medio Ambiente',
    '09-15': 'Noche Mexicana',
    '09-16': 'Independencia MX',
    '10-31': 'Halloween',
    '11-01': 'Todos los Santos',
    '11-02': 'Día de Muertos',
    '11-19': 'Día del Hombre',
    '11-20': 'Revolución Mexicana',
    '12-12': 'Virgen de Guadalupe',
    '12-24': 'Nochebuena',
    '12-25': 'Navidad',
    '12-31': 'Fin de Año'
};

function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
}

export function greeting(ts) {
    const h = new Date(ts).getHours();
    if (h >= 5 && h < 12) { return 'Buenos días'; }
    if (h >= 12 && h < 19) { return 'Buenas tardes'; }
    return 'Buenas noches';
}

export function fmtDateShort(ts) {
    const d = new Date(ts);
    return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
}

/** Returns today's special day label, or '' if none. */
export function specialDay(ts) {
    const d = new Date(ts);
    const key = pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    if (SPECIAL_DAYS[key]) {
        return SPECIAL_DAYS[key];
    }
    // 3rd Sunday of June: Father's Day in Mexico
    if (d.getMonth() === 5 && d.getDay() === 0 && d.getDate() >= 15 && d.getDate() <= 21) {
        return 'Día del Padre';
    }
    return '';
}

/** Looks ahead up to 14 days for the next special day. */
export function upcomingSpecialDay(ts) {
    const dayMs = 86400000;
    for (let i = 1; i <= 14; i++) {
        const t = ts + i * dayMs;
        const name = specialDay(t);
        if (name) {
            return { name: name, inDays: i };
        }
    }
    return null;
}

export function defaultWeather() {
    return {
        temp: 0,
        max: 0,
        min: 0,
        rainPct: 0,
        wind: 0,
        desc: '',
        updated: ''
    };
}

/**
 * Generates a short, actionable weather alert for the watch card.
 * level: 'warn' (coral), 'caution' (amber), 'ok' (mint/sky)
 */
export function weatherAdvice(w) {
    if (!w || !w.updated) {
        return { text: 'Sin clima aún', level: 'idle' };
    }
    const rain = Number(w.rainPct) || 0;
    const wind = Number(w.wind) || 0;
    const max = Number(w.max) || 0;
    const min = Number(w.min) || 0;

    if (rain >= 55) {
        return { text: 'Ojo: lluvia ' + rain + '%', level: 'warn' };
    }
    if (rain >= 25) {
        return { text: 'Posible lluvia ' + rain + '%', level: 'caution' };
    }
    if (wind >= 30) {
        return { text: 'Viento fuerte ' + Math.round(wind) + ' km/h', level: 'caution' };
    }
    if (max >= 29) {
        return { text: 'Calor hoy · hidrátate', level: 'caution' };
    }
    if (min <= 9) {
        return { text: 'Frío hoy · chamarra', level: 'caution' };
    }
    return { text: 'Buen clima hoy', level: 'ok' };
}

/**
 * Battery estimate calculations (bike and watch). Pure functions, with no
 * system imports, so they can be tested with node (scripts/test_battcalc.mjs).
 */
const DAY = 86400000;
const HOUR = 3600000;

export function defaultBike() {
    return {
        rangeKm: 50,
        chargeTs: 0,
        trips: [], // [{ km, ts }] since the last charge
        uses: [
            { n: 'Trabajo', km: 8 },
            { n: 'Casa Koala', km: 6 },
            { n: 'Mandados', km: 3 }
        ],
        avgDaily: 0 // km/day learned in previous charges
    };
}

export function defaultWatch() {
    return { chargeTs: 0, chargeLevel: 100, rate: 0 }; // rate = %/hour learned
}

function round1(x) {
    return Math.round(x * 10) / 10;
}

/** Bike state: percent, km left, trips left per use and estimated charge date. */
export function bikeState(b, now) {
    let used = 0;
    for (let i = 0; i < b.trips.length; i++) {
        used += b.trips[i].km;
    }
    const remaining = Math.max(0, b.rangeKm - used);
    const pct = b.rangeKm > 0 ? Math.round((remaining / b.rangeKm) * 100) : 0;
    const days = b.chargeTs ? (now - b.chargeTs) / DAY : 0;
    // Daily average: this charge's (if at least a day has passed) or the learned one.
    let daily = 0;
    if (days >= 1 && used > 0) {
        daily = used / days;
    } else if (b.avgDaily > 0) {
        daily = b.avgDaily;
    }
    const left = [];
    for (let j = 0; j < b.uses.length; j++) {
        left.push(b.uses[j].km > 0 ? Math.floor(remaining / b.uses[j].km) : 0);
    }
    return {
        charged: b.chargeTs > 0,
        used: round1(used),
        remaining: round1(remaining),
        pct: pct,
        daily: round1(daily),
        etaTs: daily > 0 ? now + (remaining / daily) * DAY : 0,
        sinceMs: b.chargeTs ? now - b.chargeTs : 0,
        left: left
    };
}

/** Records a 100% charge: learns the daily average of the charge that ends. */
export function bikeCharge(b, now) {
    const s = bikeState(b, now);
    const days = b.chargeTs ? (now - b.chargeTs) / DAY : 0;
    if (days >= 1 && s.used > 0) {
        const cycle = s.used / days;
        b.avgDaily = b.avgDaily > 0 ? round1(b.avgDaily * 0.5 + cycle * 0.5) : round1(cycle);
    }
    b.chargeTs = now;
    b.trips = [];
    return b;
}

/**
 * Watch state from its real level. The rate (%/hour) is measured since the last
 * full charge; if too little time has passed, it uses the learned one.
 */
export function watchState(w, level, now) {
    const hours = w.chargeTs ? (now - w.chargeTs) / HOUR : 0;
    const drop = w.chargeLevel - level;
    let rate = 0;
    let measured = false;
    if (hours >= 2 && drop >= 3) {
        rate = drop / hours;
        measured = true;
    } else if (w.rate > 0) {
        rate = w.rate;
    }
    return {
        level: level,
        charged: w.chargeTs > 0,
        rate: Math.round(rate * 100) / 100,
        measured: measured,
        hoursLeft: rate > 0 ? level / rate : 0,
        etaTs: rate > 0 ? now + (level / rate) * HOUR : 0,
        sinceMs: w.chargeTs ? now - w.chargeTs : 0
    };
}

/** Saves the measured rate as "learned" if it is reliable (6+ hours of data). */
export function watchLearn(w, level, now) {
    const s = watchState(w, level, now);
    if (s.measured && (now - w.chargeTs) / HOUR >= 6) {
        w.rate = w.rate > 0 ? Math.round((w.rate * 0.5 + s.rate * 0.5) * 100) / 100 : s.rate;
    }
    return w;
}

export function watchCharge(w, level, now) {
    watchLearn(w, level, now);
    w.chargeTs = now;
    w.chargeLevel = level;
    return w;
}

// ---------- Text formats ----------
const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function pad(n) {
    return n < 10 ? '0' + n : '' + n;
}

/** "hoy 18:00", "mañana 09:30", "jue 18:00" or "en 9 días". */
export function fmtWhen(ts, now) {
    if (!ts) {
        return '--';
    }
    const d = new Date(ts);
    const a = new Date(now);
    const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const dayDiff = Math.floor((ts - start) / DAY);
    const hm = pad(d.getHours()) + ':' + pad(d.getMinutes());
    if (dayDiff <= 0) {
        return 'hoy ' + hm;
    }
    if (dayDiff === 1) {
        return 'mañana ' + hm;
    }
    if (dayDiff < 7) {
        return DAYS[d.getDay()] + ' ' + hm;
    }
    return 'en ' + dayDiff + ' días';
}

/** "2 d 5 h", "5 h", "40 min". */
export function fmtDur(ms) {
    const mins = Math.round(ms / 60000);
    if (mins < 60) {
        return mins + ' min';
    }
    const h = Math.floor(mins / 60);
    if (h < 24) {
        return h + ' h';
    }
    return Math.floor(h / 24) + ' d ' + (h % 24) + ' h';
}

/** Ring color by level (M3: teal / amber / error). */
export function levelColor(pct) {
    if (pct > 50) {
        return '#80d5d0';
    }
    if (pct > 20) {
        return '#ffd27a';
    }
    return '#ffb4ab';
}

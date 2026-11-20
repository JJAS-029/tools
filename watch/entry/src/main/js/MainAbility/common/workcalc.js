/**
 * Pure calculations for "Mi jornada" (workday progress + live earnings).
 * Zero platform imports so it can be unit-tested in Node (scripts/test_workcalc.mjs).
 */

export function defaultWork() {
    return {
        rate: 150,      // MXN per paid hour
        startMin: 540,  // 09:00
        endMin: 1080,   // 18:00
        lunchMin: 60,   // unpaid lunch minutes (0 = paid)
        checkInDay: '', // 'YYYY-MM-DD' when user tapped "Llegué"
        checkInMin: -1, // minute of day when user tapped "Llegué"
        meetStartTs: 0  // >0 while meeting cost timer is running
    };
}

export function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
}

export function dayKey(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

export function fmtClock(min) {
    const m = ((Math.round(min) % 1440) + 1440) % 1440;
    return pad2(Math.floor(m / 60)) + ':' + pad2(m % 60);
}

export function fmtDurMin(min) {
    const t = Math.max(0, Math.round(min));
    if (t < 60) {
        return t + ' min';
    }
    const h = Math.floor(t / 60);
    const r = t % 60;
    return r ? h + 'h ' + r + 'm' : h + ' h';
}

export function fmtSecs(secs) {
    const s = Math.max(0, Math.floor(secs));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) {
        return h + ':' + pad2(m) + ':' + pad2(r);
    }
    return pad2(m) + ':' + pad2(r);
}

function addCommas(intStr) {
    let out = '';
    const len = intStr.length;
    for (let i = 0; i < len; i++) {
        if (i > 0 && (len - i) % 3 === 0) {
            out += ',';
        }
        out += intStr.charAt(i);
    }
    return out;
}

/** Formats MXN compactly for the watch ring/cards. */
export function fmtMoney(val, showCents) {
    const v = Math.max(0, Number(val) || 0);
    if (showCents === false || v >= 10000) {
        return '$' + addCommas('' + Math.round(v));
    }
    const fixed = v.toFixed(2);
    const dot = fixed.indexOf('.');
    return '$' + addCommas(fixed.slice(0, dot)) + fixed.slice(dot);
}

/** Paid hours in one workday (at least 1h). */
export function paidHours(cfg) {
    const span = Math.max(60, cfg.endMin - cfg.startMin);
    const paid = Math.max(60, span - (cfg.lunchMin || 0));
    return paid / 60;
}

/** Converts a biweekly salary (10 workdays) into hourly rate. */
export function rateFromBiweekly(biweekly, cfg) {
    const hrs = paidHours(cfg) * 10;
    return Math.max(20, Math.round(biweekly / hrs));
}

export function workState(cfg, nowTs) {
    const d = new Date(nowTs);
    const today = dayKey(nowTs);
    const nowMin = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;

    const spanMin = Math.max(60, cfg.endMin - cfg.startMin);
    const paidMin = Math.max(60, spanMin - (cfg.lunchMin || 0));
    const checkedIn = cfg.checkInDay === today && cfg.checkInMin >= 0;
    const effStart = checkedIn ? cfg.checkInMin : cfg.startMin;
    const effEnd = effStart + spanMin;

    const elapsedMin = nowMin - effStart;
    const rate = Math.max(0, Number(cfg.rate) || 0);
    const dayTotal = (paidMin / 60) * rate;
    const biweekly = dayTotal * 10;

    let phase = 'working';
    let pct = 0;
    let earned = 0;
    let leftMin = 0;
    let startsInMin = 0;
    let overtimeMin = 0;
    let overtimeEarned = 0;

    if (elapsedMin <= 0) {
        phase = 'before';
        pct = 0;
        earned = 0;
        leftMin = spanMin;
        startsInMin = -elapsedMin;
    } else if (elapsedMin >= spanMin) {
        phase = 'done';
        pct = 100;
        earned = dayTotal;
        overtimeMin = elapsedMin - spanMin;
        overtimeEarned = (overtimeMin / 60) * rate;
    } else {
        phase = 'working';
        const frac = elapsedMin / spanMin;
        pct = Math.max(0, Math.min(100, Math.round(frac * 100)));
        earned = frac * dayTotal;
        leftMin = spanMin - elapsedMin;
    }

    const meetOn = (cfg.meetStartTs || 0) > 0;
    const meetSecs = meetOn ? Math.max(0, Math.floor((nowTs - cfg.meetStartTs) / 1000)) : 0;
    const meetCost = (meetSecs / 3600) * rate;

    return {
        phase: phase,
        pct: pct,
        earned: earned,
        dayTotal: dayTotal,
        biweekly: biweekly,
        leftMin: leftMin,
        startsInMin: startsInMin,
        overtimeMin: overtimeMin,
        overtimeEarned: overtimeEarned,
        effStart: effStart,
        effEnd: effEnd,
        checkedIn: checkedIn,
        paidHrs: Math.round((paidMin / 60) * 10) / 10,
        meetOn: meetOn,
        meetSecs: meetSecs,
        meetCost: meetCost
    };
}

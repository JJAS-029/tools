/**
 * Pure unit conversions for the watch converter (zero platform imports).
 * Tested in Node via scripts/test_unitcalc.mjs.
 */

export const UNITS = [
    { id: 'usd', name: 'Dólar', a: 'USD', b: 'MXN', color: '#a6f2d1', bg: '#162722' },
    { id: 'lb', name: 'Peso', a: 'lb', b: 'kg', color: '#ffd27a', bg: '#2f2a20' },
    { id: 'f', name: 'Temp.', a: '°F', b: '°C', color: '#ffb4a8', bg: '#33201d' },
    { id: 'mi', name: 'Distancia', a: 'mi', b: 'km', color: '#a8c8ff', bg: '#1f2531' },
    { id: 'oz', name: 'Cocina', a: 'oz', b: 'g', color: '#d0bcff', bg: '#2b2633' },
    { id: 'ft', name: 'Altura', a: 'ft', b: 'm', color: '#80d5d0', bg: '#1c2b2a' }
];

export function defaultUnitCfg() {
    return { usdRate: 20.0 };
}

export function getUnit(id) {
    for (let i = 0; i < UNITS.length; i++) {
        if (UNITS[i].id === id) {
            return UNITS[i];
        }
    }
    return UNITS[0];
}

export function convert(id, val, rev, usdRate) {
    const v = Number(val) || 0;
    const r = Number(usdRate) || 20.0;
    if (id === 'usd') { return rev ? v / r : v * r; }
    if (id === 'lb') { return rev ? v / 0.45359237 : v * 0.45359237; }
    if (id === 'f') { return rev ? (v * 9) / 5 + 32 : ((v - 32) * 5) / 9; }
    if (id === 'mi') { return rev ? v / 1.609344 : v * 1.609344; }
    if (id === 'oz') { return rev ? v / 28.349523 : v * 28.349523; }
    if (id === 'ft') { return rev ? v / 0.3048 : v * 0.3048; }
    return v;
}

function addCommas(intStr) {
    let neg = '';
    let s = intStr;
    if (s.charAt(0) === '-') {
        neg = '-';
        s = s.slice(1);
    }
    let out = '';
    const len = s.length;
    for (let i = 0; i < len; i++) {
        if (i > 0 && (len - i) % 3 === 0) {
            out += ',';
        }
        out += s.charAt(i);
    }
    return neg + out;
}

/** Formats numbers cleanly for the watch screen. */
export function fmtVal(n, id, rev) {
    const abs = Math.abs(n);
    if (id === 'usd') {
        const dec = abs >= 1000 ? 0 : 2;
        const f = n.toFixed(dec);
        const dot = f.indexOf('.');
        const res = dot === -1 ? addCommas(f) : addCommas(f.slice(0, dot)) + f.slice(dot);
        return '$' + res;
    }
    const dec = abs >= 100 ? 0 : 1;
    let f = n.toFixed(dec);
    if (dec > 0 && f.slice(-2) === '.0') {
        f = f.slice(0, -2);
    }
    const dot = f.indexOf('.');
    return dot === -1 ? addCommas(f) : addCommas(f.slice(0, dot)) + f.slice(dot);
}

/** Builds a crown-friendly array of input values for each unit/direction. */
export function buildValues(id, rev) {
    const out = [];
    if (id === 'usd' && !rev) {
        for (let a = 1; a <= 50; a++) { out.push(a); }
        for (let b = 55; b <= 200; b += 5) { out.push(b); }
        for (let c = 210; c <= 1000; c += 10) { out.push(c); }
    } else if (id === 'usd' && rev) {
        for (let a = 20; a <= 500; a += 10) { out.push(a); }
        for (let b = 550; b <= 5000; b += 50) { out.push(b); }
    } else if (id === 'lb') {
        const max = rev ? 150 : 250;
        for (let a = 1; a <= max; a++) { out.push(a); }
    } else if (id === 'f' && !rev) {
        for (let a = -20; a <= 120; a++) { out.push(a); }
        for (let b = 130; b <= 450; b += 10) { out.push(b); }
    } else if (id === 'f' && rev) {
        for (let a = -20; a <= 60; a++) { out.push(a); }
        for (let b = 70; b <= 250; b += 10) { out.push(b); }
    } else if (id === 'mi') {
        for (let a = 1; a <= 120; a++) { out.push(a); }
    } else if (id === 'oz' && !rev) {
        for (let a = 1; a <= 64; a++) { out.push(a); }
    } else if (id === 'oz' && rev) {
        for (let a = 10; a <= 1000; a += 10) { out.push(a); }
    } else {
        for (let a = 1; a <= 100; a++) { out.push(a); }
    }
    return out;
}

export function defaultIndex(id, rev, vals) {
    let target = 10;
    if (id === 'usd') { target = rev ? 200 : 10; }
    else if (id === 'lb') { target = rev ? 70 : 150; }
    else if (id === 'f') { target = rev ? 20 : 70; }
    else if (id === 'mi') { target = 10; }
    else if (id === 'oz') { target = rev ? 250 : 8; }
    else if (id === 'ft') { target = rev ? 2 : 6; }

    let best = 0;
    let diff = Math.abs(vals[0] - target);
    for (let i = 1; i < vals.length; i++) {
        const d = Math.abs(vals[i] - target);
        if (d < diff) {
            diff = d;
            best = i;
        }
    }
    return best;
}

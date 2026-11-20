/**
 * Material 3 Expressive Wavy Progress indicators for HarmonyOS Lite <canvas>.
 * Uses native ctx.arc() for smooth tracks (avoids ui_canvas line-join artifacts)
 * and floating-point sinusoidal polylines for the wavy active segment.
 */

function getCtx(page, id) {
    if (!page) {
        return null;
    }
    let el = null;
    try {
        if (typeof page.$element === 'function') {
            el = page.$element(id);
        }
    } catch (e) {}
    if (!el && page.$refs) {
        el = page.$refs[id];
    }
    if (!el || typeof el.getContext !== 'function') {
        return null;
    }
    try {
        return el.getContext('2d');
    } catch (e) {
        return null;
    }
}

/**
 * Draws a 250-degree M3 Expressive wavy arc (active = wavy, remaining = smooth).
 */
export function drawWavyRing(page, id, opts) {
    const ctx = getCtx(page, id);
    if (!ctx) {
        return;
    }
    const w = opts.w || 210;
    const h = opts.h || 176;
    const cx = w / 2;
    const cy = opts.cy !== undefined ? opts.cy : (h / 2 + 10);
    const R = opts.r || 76;
    const amp = opts.amp || 5.0;
    const waves = opts.waves || 10;
    const lw = opts.lw || 11;
    const pct = Math.max(0, Math.min(100, Number(opts.pct) || 0)) / 100;
    const phase = Number(opts.phase) || 0;

    // 250-degree horseshoe centered at top (145 deg to 395 deg)
    const startRad = (145 * Math.PI) / 180;
    const totalRad = (250 * Math.PI) / 180;
    const splitRad = startRad + totalRad * pct;
    const endRad = startRad + totalRad;
    const gapRad = (pct > 0.02 && pct < 0.98) ? 0.14 : 0;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = lw;
    ctx.lineCap = 'round';

    // 1. Remaining smooth track arc (native ctx.arc avoids ui_canvas horizontal artifact)
    const trackStart = splitRad + gapRad;
    if (trackStart < endRad - 0.04) {
        ctx.strokeStyle = opts.track || '#26232a';
        ctx.beginPath();
        ctx.arc(cx, cy, R, trackStart, endRad, false);
        ctx.stroke();
    }

    // 2. Active wavy sinusoidal arc (short independent segments with round caps = zero miter glitches)
    const activeEnd = splitRad - gapRad * 0.4;
    if (pct > 0.01 && activeEnd > startRad + 0.04) {
        ctx.strokeStyle = opts.color || '#d0bcff';
        const stepsA = Math.max(18, Math.round(52 * pct));
        let px = 0;
        let py = 0;
        for (let j = 0; j <= stepsA; j++) {
            const frac = j / stepsA;
            const a = startRad + (activeEnd - startRad) * frac;
            const env = Math.sin(Math.min(1, frac * 6) * (Math.PI / 2)) *
                        Math.sin(Math.min(1, (1 - frac) * 6) * (Math.PI / 2));
            const rr = R + amp * env * Math.sin(waves * (a - startRad) + phase);
            const x = cx + Math.cos(a) * rr;
            const y = cy + Math.sin(a) * rr;
            if (j > 0) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            px = x;
            py = y;
        }
    }
}

/**
 * Draws an M3 Expressive horizontal wavy progress bar (for Music).
 * Active portion = sine wave; remaining portion = straight track.
 */
export function drawWavyBar(page, id, opts) {
    const ctx = getCtx(page, id);
    if (!ctx) {
        return;
    }
    const w = opts.w || 280;
    const h = opts.h || 24;
    const cy = h / 2;
    const pad = 8;
    const usable = w - pad * 2;
    const pct = Math.max(0, Math.min(1, Number(opts.pct) || 0));
    const splitX = pad + usable * pct;
    const amp = opts.amp || 5;
    const freq = opts.freq || 0.22;
    const phase = Number(opts.phase) || 0;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = opts.lw || 6;
    ctx.lineCap = 'round';

    // 1. Remaining straight track
    const trackX0 = pct > 0.02 ? splitX + 8 : pad;
    if (trackX0 < w - pad) {
        ctx.strokeStyle = opts.track || '#2b2633';
        ctx.beginPath();
        ctx.moveTo(trackX0, cy);
        ctx.lineTo(w - pad, cy);
        ctx.stroke();
    }

    // 2. Active sinusoidal wave (independent round-cap segments = crisp on lite)
    if (pct > 0.01 && splitX > pad + 2) {
        ctx.strokeStyle = opts.color || '#d0bcff';
        const span = splitX - pad;
        const steps = Math.max(10, Math.round(span / 4));
        let px = 0;
        let py = 0;
        for (let i = 0; i <= steps; i++) {
            const frac = i / steps;
            const x = pad + span * frac;
            const env = Math.sin(Math.min(1, frac * 6) * (Math.PI / 2)) *
                        Math.sin(Math.min(1, (1 - frac) * 6) * (Math.PI / 2));
            const y = cy + amp * env * Math.sin(x * freq + phase);
            if (i > 0) {
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            px = x;
            py = y;
        }
    }
}

// Tests for the battery calculations. Usage: node scripts/test_battcalc.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

// battcalc.js is an ES module with no imports: copy it as .mjs to load it.
const src = readFileSync(new URL('../watch/entry/src/main/js/MainAbility/common/battcalc.js', import.meta.url), 'utf8');
const tmp = join(mkdtempSync(join(tmpdir(), 'bc-')), 'battcalc.mjs');
writeFileSync(tmp, src);
const m = await import('file://' + tmp.replace(/\\/g, '/'));

const H = 3600000, D = 24 * H;
const t0 = new Date(2026, 10, 18, 8, 0).getTime(); // Wed 8:00

// Bike: charge, 2 work trips + 1 errand in 2 days
let b = m.bikeCharge(m.defaultBike(), t0);
b.trips.push({ km: 8, ts: t0 + H }, { km: 8, ts: t0 + 10 * H }, { km: 3, ts: t0 + D });
let s = m.bikeState(b, t0 + 2 * D);
assert.equal(s.used, 19);
assert.equal(s.remaining, 31);
assert.equal(s.pct, 62);
assert.equal(s.daily, 9.5);
assert.deepEqual(s.left, [3, 5, 10]);
assert.ok(Math.abs(s.etaTs - (t0 + 2 * D + (31 / 9.5) * D)) < 1000);

// Without a full day nor history: no ETA
const b2 = m.bikeCharge(m.defaultBike(), t0);
b2.trips.push({ km: 8, ts: t0 });
assert.equal(m.bikeState(b2, t0 + H).etaTs, 0);

// When recharging it learns the average and resets trips
b = m.bikeCharge(b, t0 + 2 * D);
assert.equal(b.avgDaily, 9.5);
assert.equal(b.trips.length, 0);
assert.ok(m.bikeState(b, t0 + 2 * D + H).etaTs > 0); // uses the learned one

// Never goes below 0
b.trips.push({ km: 60, ts: t0 });
assert.equal(m.bikeState(b, t0 + 3 * D).pct, 0);

// Watch: charges at 100, after 24 h it's at 76 -> 1 %/h -> 76 h left
let w = m.watchCharge(m.defaultWatch(), 100, t0);
let ws = m.watchState(w, 76, t0 + 24 * H);
assert.equal(ws.rate, 1);
assert.ok(ws.measured);
assert.equal(Math.round(ws.hoursLeft), 76);
// Too soon after charging: no rate and no ETA
w = m.watchCharge(m.defaultWatch(), 100, t0);
assert.equal(m.watchState(w, 99, t0 + H).etaTs, 0);
// Learns the rate when recharging after 6+ h, and uses it afterwards
w = m.watchCharge(w, 70, t0 + 30 * H); // 30% in 30 h = 1 %/h
assert.equal(w.rate, 1);
assert.equal(Math.round(m.watchState(w, 100, t0 + 30 * H + 600000).hoursLeft), 100);

// Formats
assert.equal(m.fmtWhen(t0 + 10 * H, t0), 'hoy 18:00');
assert.equal(m.fmtWhen(t0 + D + 1.5 * H, t0), 'mañana 09:30');
assert.equal(m.fmtWhen(t0 + 2 * D, t0), 'vie 08:00');
assert.equal(m.fmtDur(53 * H), '2 d 5 h');
assert.equal(m.fmtDur(40 * 60000), '40 min');
assert.equal(m.levelColor(15), '#ffb4ab');

console.log('battcalc: all tests passed');

// Tests for "Mi jornada" calculations. Usage: node scripts/test_workcalc.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../watch/entry/src/main/js/MainAbility/common/workcalc.js', import.meta.url), 'utf8');
const tmp = join(mkdtempSync(join(tmpdir(), 'wc-')), 'workcalc.mjs');
writeFileSync(tmp, src);
const m = await import('file://' + tmp.replace(/\\/g, '/'));

// Default: 09:00-18:00 (9h span), 1h unpaid lunch -> 8 paid hours * $150 = $1,200/day
const cfg = m.defaultWork();
assert.equal(m.paidHours(cfg), 8);

// Before shift (08:30)
const tBefore = new Date(2026, 10, 19, 8, 30, 0).getTime();
let s = m.workState(cfg, tBefore);
assert.equal(s.phase, 'before');
assert.equal(s.pct, 0);
assert.equal(s.earned, 0);
assert.equal(Math.round(s.startsInMin), 30);

// Halfway through shift (13:30 = 4.5h of 9h -> 50% -> $600)
const tMid = new Date(2026, 10, 19, 13, 30, 0).getTime();
s = m.workState(cfg, tMid);
assert.equal(s.phase, 'working');
assert.equal(s.pct, 50);
assert.equal(Math.round(s.earned), 600);
assert.equal(Math.round(s.leftMin), 270);
assert.equal(Math.round(s.dayTotal), 1200);
assert.equal(Math.round(s.biweekly), 12000);

// Overtime (19:00 = 1h after 18:00 -> $1,200 + $150 overtime)
const tOver = new Date(2026, 10, 19, 19, 0, 0).getTime();
s = m.workState(cfg, tOver);
assert.equal(s.phase, 'done');
assert.equal(s.pct, 100);
assert.equal(Math.round(s.earned), 1200);
assert.equal(Math.round(s.overtimeMin), 60);
assert.equal(Math.round(s.overtimeEarned), 150);

// Check-in override at 09:30 -> at 14:00 is 50%
const cfgIn = { ...cfg, checkInDay: '2026-11-19', checkInMin: 570 };
s = m.workState(cfgIn, new Date(2026, 10, 19, 14, 0, 0).getTime());
assert.equal(s.checkedIn, true);
assert.equal(s.pct, 50);
assert.equal(s.effStart, 570);
assert.equal(s.effEnd, 1110);

// Biweekly salary conversion: $16,000 / (10 * 8h) = $200/h
assert.equal(m.rateFromBiweekly(16000, cfg), 200);

// Meeting cost: 30 min at $150/h = $75
const tMeet = new Date(2026, 10, 19, 11, 0, 0).getTime();
const cfgMeet = { ...cfg, meetStartTs: tMeet - 1800 * 1000 };
s = m.workState(cfgMeet, tMeet);
assert.equal(s.meetOn, true);
assert.equal(s.meetSecs, 1800);
assert.equal(Math.round(s.meetCost), 75);

// Formatting
assert.equal(m.fmtMoney(432.5), '$432.50');
assert.equal(m.fmtMoney(1250, false), '$1,250');
assert.equal(m.fmtMoney(12500), '$12,500');
assert.equal(m.fmtClock(540), '09:00');
assert.equal(m.fmtDurMin(80), '1h 20m');
assert.equal(m.fmtSecs(125), '02:05');

console.log('workcalc: all tests passed');

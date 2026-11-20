// Tests for Now Brief helpers. Usage: node scripts/test_briefcalc.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../watch/entry/src/main/js/MainAbility/common/briefcalc.js', import.meta.url), 'utf8');
const tmp = join(mkdtempSync(join(tmpdir(), 'br-')), 'briefcalc.mjs');
writeFileSync(tmp, src);
const m = await import('file://' + tmp.replace(/\\/g, '/'));

// Greetings
assert.equal(m.greeting(new Date(2026, 10, 19, 8, 0).getTime()), 'Buenos días');
assert.equal(m.greeting(new Date(2026, 10, 19, 15, 0).getTime()), 'Buenas tardes');
assert.equal(m.greeting(new Date(2026, 10, 19, 21, 0).getTime()), 'Buenas noches');

// Date formatting & special days
const nov19 = new Date(2026, 10, 19, 9, 0).getTime();
assert.equal(m.fmtDateShort(nov19), 'Jue 19 nov');
assert.equal(m.specialDay(nov19), 'Día del Hombre');
assert.equal(m.specialDay(new Date(2026, 10, 20, 9, 0).getTime()), 'Revolución Mexicana');
assert.equal(m.specialDay(new Date(2026, 5, 21, 9, 0).getTime()), 'Día del Padre'); // 3rd Sunday June 2026

// Upcoming special day
const nov18 = new Date(2026, 10, 18, 9, 0).getTime();
assert.equal(m.specialDay(nov18), '');
const up = m.upcomingSpecialDay(nov18);
assert.equal(up.name, 'Día del Hombre');
assert.equal(up.inDays, 1);

// Weather advice
assert.equal(m.weatherAdvice(m.defaultWeather()).level, 'idle');
assert.equal(m.weatherAdvice({ temp: 18, max: 22, min: 12, rainPct: 70, wind: 10, updated: '20:00' }).level, 'warn');
assert.equal(m.weatherAdvice({ temp: 20, max: 24, min: 13, rainPct: 35, wind: 10, updated: '20:00' }).level, 'caution');
assert.equal(m.weatherAdvice({ temp: 21, max: 25, min: 12, rainPct: 5, wind: 12, updated: '20:00' }).level, 'ok');

console.log('briefcalc: all tests passed');

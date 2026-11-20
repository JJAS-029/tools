// Tests for unit converter calculations. Usage: node scripts/test_unitcalc.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../watch/entry/src/main/js/MainAbility/common/unitcalc.js', import.meta.url), 'utf8');
const tmp = join(mkdtempSync(join(tmpdir(), 'uc-')), 'unitcalc.mjs');
writeFileSync(tmp, src);
const m = await import('file://' + tmp.replace(/\\/g, '/'));

assert.equal(m.UNITS.length, 6);

// USD <-> MXN
assert.equal(m.convert('usd', 10, false, 20), 200);
assert.equal(m.convert('usd', 200, true, 20), 10);
assert.equal(m.fmtVal(200, 'usd', false), '$200.00');
assert.equal(m.fmtVal(2500, 'usd', false), '$2,500');

// lb <-> kg
assert.ok(Math.abs(m.convert('lb', 100, false) - 45.359) < 0.01);
assert.ok(Math.abs(m.convert('lb', 70, true) - 154.32) < 0.05);

// °F <-> °C
assert.equal(m.convert('f', 32, false), 0);
assert.equal(m.convert('f', 212, false), 100);
assert.equal(m.convert('f', 0, true), 32);
assert.equal(m.convert('f', 100, true), 212);

// mi <-> km
assert.ok(Math.abs(m.convert('mi', 10, false) - 16.093) < 0.01);
assert.ok(Math.abs(m.convert('mi', 10, true) - 6.213) < 0.01);

// oz <-> g
assert.ok(Math.abs(m.convert('oz', 8, false) - 226.796) < 0.01);

// ft <-> m
assert.ok(Math.abs(m.convert('ft', 6, false) - 1.8288) < 0.001);

// Crown value arrays non-empty
for (const u of m.UNITS) {
    const a = m.buildValues(u.id, false);
    const b = m.buildValues(u.id, true);
    assert.ok(a.length >= 50 && b.length >= 50);
    assert.ok(m.defaultIndex(u.id, false, a) >= 0);
    assert.ok(m.defaultIndex(u.id, true, b) >= 0);
}

console.log('unitcalc: all tests passed');

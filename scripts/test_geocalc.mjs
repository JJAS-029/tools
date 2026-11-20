// Tests for geodesic math in Lugares. Usage: node scripts/test_geocalc.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../watch/entry/src/main/js/MainAbility/common/geocalc.js', import.meta.url), 'utf8');
const tmp = join(mkdtempSync(join(tmpdir(), 'gc-')), 'geocalc.mjs');
writeFileSync(tmp, src);
const m = await import('file://' + tmp.replace(/\\/g, '/'));

// Zócalo CDMX -> Bellas Artes (~880m west-northwest)
const d = m.haversineM(19.4326, -99.1332, 19.4352, -99.1412);
assert.ok(d > 800 && d < 950);

// Pure North & Pure East bearings
assert.equal(m.bearingDeg(19.0, -99.0, 20.0, -99.0), 0);
assert.equal(m.cardinalShort(0), 'N');
assert.equal(m.cardinalLong(45), 'al noreste');

const east = m.bearingDeg(19.0, -99.0, 19.0, -98.0);
assert.ok(east >= 88 && east <= 92);
assert.equal(m.cardinalShort(east), 'E');

// Relative arrows
assert.equal(m.relArrow(90, 90), '↑');   // facing target
assert.equal(m.relArrow(90, 0), '→');    // target is to your right
assert.equal(m.relArrow(270, 90), '↓');  // target is behind you

// Distance formatting
assert.equal(m.fmtDist(42), '42 m');
assert.equal(m.fmtDist(1450), '1.5 km');
assert.equal(m.fmtDist(12400), '12 km');

console.log('geocalc: all tests passed');

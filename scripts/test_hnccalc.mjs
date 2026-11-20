// Tests for Hoy No Circula rules. Usage: node scripts/test_hnccalc.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../watch/entry/src/main/js/MainAbility/common/hnccalc.js', import.meta.url), 'utf8');
const tmp = join(mkdtempSync(join(tmpdir(), 'hnc-')), 'hnccalc.mjs');
writeFileSync(tmp, src);
const m = await import('file://' + tmp.replace(/\\/g, '/'));

// Thursday Nov 19, 2026: Green (1, 2) rests
const thu = new Date(2026, 10, 19, 10, 0).getTime();
assert.equal(m.hncStatus({ digit: 1, holo: '0' }, thu).ok, true);
assert.equal(m.hncStatus({ digit: 1, holo: '00' }, thu).ok, true);
assert.equal(m.hncStatus({ digit: 1, holo: '1' }, thu).ok, false);
assert.equal(m.hncStatus({ digit: 2, holo: '2' }, thu).ok, false);
assert.equal(m.hncStatus({ digit: 5, holo: '1' }, thu).ok, true);

// Sunday Nov 22, 2026: everyone circulates
const sun = new Date(2026, 10, 22, 10, 0).getTime();
assert.equal(m.hncStatus({ digit: 1, holo: '2' }, sun).ok, true);

// Saturday Nov 21, 2026 is the 3rd Saturday of Nov 2026 (21 / 7 = 3)
// Holo 1 odd (1) rests on 1st & 3rd Sat; even (2) circulates on 3rd Sat; Holo 2 rests all Sats
const sat3 = new Date(2026, 10, 21, 10, 0).getTime();
assert.equal(m.hncStatus({ digit: 1, holo: '1' }, sat3).ok, false);
assert.equal(m.hncStatus({ digit: 2, holo: '1' }, sat3).ok, true);
assert.equal(m.hncStatus({ digit: 2, holo: '2' }, sat3).ok, false);

console.log('hnccalc: all tests passed');

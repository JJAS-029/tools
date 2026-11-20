// Tests for CDMX Metro + Tarjeta MI. Usage: node scripts/test_metrodata.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../watch/entry/src/main/js/MainAbility/common/metrodata.js', import.meta.url), 'utf8');
const tmp = join(mkdtempSync(join(tmpdir(), 'md-')), 'metrodata.mjs');
writeFileSync(tmp, src);
const m = await import('file://' + tmp.replace(/\\/g, '/'));

// 12 lines, 195 stations total
assert.equal(m.LINES.length, 12);
const total = m.LINES.reduce((acc, l) => acc + l.s.length, 0);
assert.equal(total, 195);

// Transfers
assert.deepEqual(m.transfersOf('Pantitlán', '1'), ['5', '9', 'A']);
assert.deepEqual(m.transfersOf('Chabacano', '2'), ['8', '9']);
assert.deepEqual(m.transfersOf('Hidalgo', '3'), ['2']);
assert.deepEqual(m.transfersOf('Insurgentes', '1'), []);

// Direct route: Insurgentes -> Chapultepec (L1, 2 stops)
let r = m.findRoute('Insurgentes', 'Chapultepec');
assert.equal(r.length, 1);
assert.equal(r[0].line, '1');
assert.equal(r[0].stops, 2);

// 1-transfer route: Universidad -> Bellas Artes (L3 to Hidalgo, L2 to Bellas Artes)
r = m.findRoute('Universidad', 'Bellas Artes');
assert.equal(r.length, 2);
assert.equal(r[0].line, '3');
assert.equal(r[0].to, 'Hidalgo');
assert.equal(r[1].line, '2');
assert.equal(r[1].to, 'Bellas Artes');
assert.equal(r[1].stops, 1);

// MI Card math
const c = m.defaultCard();
assert.equal(m.cardTrips(c.balance, 5), 10);
m.applyTrip(c, 5);
assert.equal(c.balance, 45);
assert.equal(m.cardTrips(c.balance, 6), 7);
m.applyTrip(c, 100);
assert.equal(c.balance, 0);

console.log('metrodata: all tests passed (12 lines, 195 stations)');

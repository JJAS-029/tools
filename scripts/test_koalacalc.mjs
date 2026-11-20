// Tests for Koala tamagotchi state machine. Usage: node scripts/test_koalacalc.mjs
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const src = readFileSync(new URL('../watch/entry/src/main/js/MainAbility/common/koalacalc.js', import.meta.url), 'utf8');
const tmp = join(mkdtempSync(join(tmpdir(), 'kl-')), 'koalacalc.mjs');
writeFileSync(tmp, src);
const m = await import('file://' + tmp.replace(/\\/g, '/'));

const H = 3600000;
const t0 = new Date(2026, 10, 19, 10, 0).getTime();

let k = m.defaultKoala(t0);
assert.equal(m.koalaMood(k).pose, 'happy');

// 10 hours awake -> food drops ~45 (to 35), mood ~35 (to 45), energy ~25 (to 55)
m.tickKoala(k, t0 + 10 * H);
assert.equal(k.food, 35);
assert.equal(k.mood, 45);
assert.equal(k.energy, 55);
assert.equal(m.koalaMood(k).pose, 'idle');

// Feed & play
m.actFeed(k);
assert.equal(k.food, 60);
assert.equal(k.leaves, 2);
m.actPlay(k);
assert.equal(k.mood, 75);
assert.equal(k.energy, 45);

// Sleep recovers energy and auto-wakes at 100
m.actToggleSleep(k);
assert.equal(k.sleeping, true);
assert.equal(m.koalaMood(k).pose, 'sleep');
m.tickKoala(k, t0 + 14 * H); // +4h * 18 = +72 -> 100, wakes up
assert.equal(k.energy, 100);
assert.equal(k.sleeping, false);

// Steps grant eucalyptus leaves
m.syncSteps(k, 1000);
const gained = m.syncSteps(k, 2100);
assert.equal(gained, 2);
assert.equal(k.leaves, 4);

// Bike trips boost mood
k.mood = 50;
const trips = m.syncBikeTrips(k, 1);
assert.equal(trips, 1);
assert.equal(k.mood, 70);

console.log('koalacalc: all tests passed');

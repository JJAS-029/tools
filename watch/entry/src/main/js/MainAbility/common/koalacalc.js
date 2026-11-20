/**
 * Pure state machine for the Koala Científico tamagotchi (zero platform imports).
 * Tracks food (saciedad), mood (ánimo), energy (energía), sleeping, steps & bike trips.
 * Tested in Node via scripts/test_koalacalc.mjs.
 */

const HOUR_MS = 3600000;

export function defaultKoala(nowTs) {
    return {
        food: 80,
        mood: 80,
        energy: 80,
        sleeping: false,
        lastTs: nowTs || 0,
        lastSteps: 0,
        lastBikeTrips: 0,
        leaves: 3
    };
}

function clamp(v) {
    return Math.max(0, Math.min(100, Math.round(v)));
}

/** Advances needs by elapsed time since lastTs (works with app closed). */
export function tickKoala(k, nowTs) {
    if (!k.lastTs || nowTs <= k.lastTs) {
        k.lastTs = nowTs;
        return k;
    }
    const hrs = Math.min(48, (nowTs - k.lastTs) / HOUR_MS);
    if (k.sleeping) {
        k.energy = clamp(k.energy + hrs * 18);
        k.food = clamp(k.food - hrs * 2);
        k.mood = clamp(k.mood - hrs * 1);
        if (k.energy >= 100) {
            k.sleeping = false;
        }
    } else {
        k.food = clamp(k.food - hrs * 4.5);
        k.mood = clamp(k.mood - hrs * 3.5);
        k.energy = clamp(k.energy - hrs * 2.5);
    }
    k.lastTs = nowTs;
    return k;
}

/** Grants eucalyptus leaves for new watch steps (1 leaf per 500 steps). */
export function syncSteps(k, steps) {
    const s = Math.max(0, Math.floor(Number(steps) || 0));
    if (k.lastSteps > 0 && s > k.lastSteps) {
        const gained = Math.floor((s - k.lastSteps) / 500);
        if (gained > 0) {
            k.leaves = Math.min(20, (k.leaves || 0) + gained);
            k.lastSteps += gained * 500;
            return gained;
        }
    } else if (k.lastSteps === 0 || s < k.lastSteps) {
        // First reading or new day reset
        k.lastSteps = s;
    }
    return 0;
}

/** Boosts mood when new bike trips were logged in Baterías. */
export function syncBikeTrips(k, tripCount) {
    const c = Math.max(0, Math.floor(Number(tripCount) || 0));
    if (c > (k.lastBikeTrips || 0)) {
        const diff = c - (k.lastBikeTrips || 0);
        k.mood = clamp(k.mood + diff * 20);
        k.lastBikeTrips = c;
        return diff;
    }
    k.lastBikeTrips = c;
    return 0;
}

export function actFeed(k) {
    k.sleeping = false;
    k.food = clamp(k.food + 25);
    k.mood = clamp(k.mood + 5);
    if ((k.leaves || 0) > 0) {
        k.leaves--;
    }
    return k;
}

export function actPlay(k) {
    k.sleeping = false;
    k.mood = clamp(k.mood + 25);
    k.energy = clamp(k.energy - 10);
    k.food = clamp(k.food - 5);
    return k;
}

export function actPet(k) {
    k.sleeping = false;
    k.mood = clamp(k.mood + 15);
    return k;
}

export function actToggleSleep(k) {
    k.sleeping = !k.sleeping;
    return k;
}

/** Returns visual state: 'sleep' | 'sad' | 'happy' | 'idle' and a short status text. */
export function koalaMood(k) {
    if (k.sleeping) {
        return { pose: 'sleep', text: 'Durmiendo Zzz...' };
    }
    if (k.food < 25) {
        return { pose: 'sad', text: 'Tengo hambre' };
    }
    if (k.energy < 20) {
        return { pose: 'sad', text: 'Tengo sueño' };
    }
    if (k.mood < 25) {
        return { pose: 'sad', text: 'Quiero jugar' };
    }
    if (k.food >= 75 && k.mood >= 75 && k.energy >= 50) {
        return { pose: 'happy', text: '¡Koala feliz!' };
    }
    return { pose: 'idle', text: 'Experimentando' };
}

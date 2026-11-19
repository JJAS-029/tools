/**
 * Persistent storage on the watch (survives restarts). Saves JSON.
 */
import storage from '@system.storage';
import battery from '@system.battery';

export function load(key, fallback, cb) {
    try {
        storage.get({
            key: key,
            default: '',
            success: function (data) {
                let v = fallback;
                if (data) {
                    try { v = JSON.parse(data); } catch (e) { v = fallback; }
                }
                cb(v);
            },
            fail: function () { cb(fallback); }
        });
    } catch (e) {
        cb(fallback);
    }
}

export function save(key, value) {
    try {
        storage.set({ key: key, value: JSON.stringify(value) });
    } catch (e) {
        // no storage (Previewer): it's just not saved
    }
}

/** Current watch battery level (0-100) and whether it's charging. */
export function readBattery(cb) {
    try {
        battery.getStatus({
            success: function (d) {
                let lvl = d.level;
                if (lvl <= 1) { lvl = lvl * 100; } // some versions return 0..1
                cb(Math.round(lvl), !!d.charging);
            },
            fail: function () { cb(-1, false); }
        });
    } catch (e) {
        cb(-1, false);
    }
}

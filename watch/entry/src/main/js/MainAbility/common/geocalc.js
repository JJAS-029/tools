/**
 * Pure geodesic math for "Lugares" (GPS tags: Haversine distance, bearing,
 * cardinal direction, relative arrow). Zero platform imports -> unit-tested in Node.
 */

const RAD = Math.PI / 180;
const EARTH_M = 6371000;

const CARD_SHORT = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
const CARD_LONG = [
    'al norte', 'al noreste', 'al este', 'al sureste',
    'al sur', 'al suroeste', 'al oeste', 'al noroeste'
];
const ARROWS = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];

export function defaultPlaces() {
    return [
        { id: 'bike', name: 'Bici', lat: 0, lon: 0, saved: false },
        { id: 'car', name: 'Carro', lat: 0, lon: 0, saved: false },
        { id: 'koala', name: 'Casa Koala', lat: 0, lon: 0, saved: false },
        { id: 'work', name: 'Trabajo', lat: 0, lon: 0, saved: false },
        { id: 'park', name: 'Parquímetro', lat: 0, lon: 0, saved: false }
    ];
}

export function haversineM(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * RAD;
    const dLon = (lon2 - lon1) * RAD;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * EARTH_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Initial compass bearing in degrees [0, 360) from point 1 to point 2. */
export function bearingDeg(lat1, lon1, lat2, lon2) {
    const f1 = lat1 * RAD;
    const f2 = lat2 * RAD;
    const dl = (lon2 - lon1) * RAD;
    const y = Math.sin(dl) * Math.cos(f2);
    const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
    const deg = (Math.atan2(y, x) / RAD + 360) % 360;
    return Math.round(deg) % 360;
}

export function octant(deg) {
    const d = ((Number(deg) % 360) + 360) % 360;
    return Math.round(d / 45) % 8;
}

export function cardinalShort(deg) {
    return CARD_SHORT[octant(deg)];
}

export function cardinalLong(deg) {
    return CARD_LONG[octant(deg)];
}

/** Arrow relative to current heading (if heading < 0, uses absolute bearing). */
export function relArrow(bearing, heading) {
    const diff = heading >= 0 ? (bearing - heading + 360) % 360 : bearing;
    return ARROWS[octant(diff)];
}

export function fmtDist(meters) {
    const m = Math.max(0, Number(meters) || 0);
    if (m < 1000) {
        return Math.round(m) + ' m';
    }
    const km = m / 1000;
    if (km < 10) {
        return (Math.round(km * 10) / 10) + ' km';
    }
    return Math.round(km) + ' km';
}

import router from '@system.router';
import geolocation from '@system.geolocation';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { defaultPlaces, haversineM, bearingDeg, cardinalShort, fmtDist } from '../../common/geocalc.js';

const IMG = '/common/images/';
const ICONS = ['bt_bike.png', 'pl_car.png', 'u_1.png', 'u_0.png', 'pl_park.png'];

let places = defaultPlaces();
let curLat = 0;
let curLon = 0;
let hasFix = false;

export default {
    data: {
        gpsText: 'Buscando GPS...',
        rows: []
    },
    onInit() {
        const rows = [];
        for (let i = 0; i < 5; i++) {
            rows.push({
                kind: 'place',
                idx: i,
                icon: IMG + ICONS[i],
                n: places[i].name,
                s: 'Sin guardar',
                bg: '#1d201f',
                color: '#f1f3f1',
                sub: '#9da39f'
            });
        }
        rows.push({
            kind: 'hw',
            idx: -1,
            icon: IMG + 'pl_hw.png',
            n: 'Probar sensores',
            s: 'GPS, brújula, pulso',
            bg: '#2b2633',
            color: '#d0bcff',
            sub: '#c4c7c5'
        });
        this.rows = rows;

        load('places', defaultPlaces(), (list) => {
            if (list && list.length === 5) {
                places = list;
            }
            this.refresh();
        });
        this.readGps();
    },
    onShow() {
        focusCrown(this.$refs.list);
        this.refresh();
    },
    readGps() {
        try {
            geolocation.getLocation({
                success: (d) => {
                    curLat = Number(d.latitude);
                    curLon = Number(d.longitude);
                    hasFix = true;
                    this.gpsText = 'GPS listo · Mantén = guardar';
                    this.refresh();
                },
                fail: () => {
                    // Previewer fallback (CDMX Zócalo) so UI can be tested without real GPS
                    curLat = 19.4326;
                    curLon = -99.1332;
                    hasFix = true;
                    this.gpsText = 'GPS simulado (CDMX)';
                    this.refresh();
                }
            });
        } catch (e) {
            curLat = 19.4326;
            curLon = -99.1332;
            hasFix = true;
            this.gpsText = 'GPS simulado (CDMX)';
            this.refresh();
        }
    },
    refresh() {
        for (let i = 0; i < 5; i++) {
            const p = places[i];
            const r = this.rows[i];
            r.n = p.name;
            if (!p.saved) {
                r.s = 'Toca para guardar';
                r.bg = '#1d201f';
                r.color = '#f1f3f1';
                r.sub = '#9da39f';
            } else if (hasFix) {
                const dist = haversineM(curLat, curLon, p.lat, p.lon);
                const brg = bearingDeg(curLat, curLon, p.lat, p.lon);
                r.s = fmtDist(dist) + ' · ' + cardinalShort(brg);
                r.bg = '#162722';
                r.color = '#a6f2d1';
                r.sub = '#c4c7c5';
            } else {
                r.s = 'Guardado';
                r.bg = '#162722';
                r.color = '#a6f2d1';
                r.sub = '#c4c7c5';
            }
        }
    },
    saveHere(idx) {
        if (!hasFix) {
            this.gpsText = 'Esperando GPS...';
            return;
        }
        places[idx].lat = curLat;
        places[idx].lon = curLon;
        places[idx].saved = true;
        save('places', places);
        try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        this.gpsText = places[idx].name + ' guardado';
        this.refresh();
    },
    tap(i) {
        const r = this.rows[i];
        if (!r) {
            return;
        }
        if (r.kind === 'hw') {
            tick();
            router.replace({ uri: 'pages/hwtest/hwtest' });
            return;
        }
        const p = places[r.idx];
        if (!p.saved) {
            this.saveHere(r.idx);
        } else {
            tick();
            router.replace({ uri: 'pages/placego/placego', params: { idx: '' + r.idx } });
        }
    },
    hold(i) {
        const r = this.rows[i];
        if (r && r.kind === 'place') {
            this.saveHere(r.idx);
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

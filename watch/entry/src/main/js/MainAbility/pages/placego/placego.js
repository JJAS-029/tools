import router from '@system.router';
import geolocation from '@system.geolocation';
import sensor from '@system.sensor';
import vibrator from '@system.vibrator';
import { load, save } from '../../common/store.js';
import { defaultPlaces, haversineM, bearingDeg, cardinalLong, relArrow, fmtDist } from '../../common/geocalc.js';

let places = defaultPlaces();
let target = null;
let curLat = 0;
let curLon = 0;
let hasFix = false;
let heading = -1;
let arrivedBuzz = false;

export default {
    data: {
        idx: '0',
        name: 'Lugar',
        arrow: '•',
        distText: 'GPS...',
        dirText: 'Buscando señal',
        dialBg: '#1d201f',
        dialCol: '#80d5d0'
    },
    onInit() {
        arrivedBuzz = false;
        heading = -1;
        load('places', defaultPlaces(), (list) => {
            if (list && list.length === 5) {
                places = list;
            }
            const i = Math.max(0, Math.min(4, Number(this.idx) || 0));
            target = places[i];
            this.name = target.name;
            this.startSensors();
        });
    },
    onDestroy() {
        try { geolocation.unsubscribe(); } catch (e) {}
        try { sensor.unsubscribeCompass(); } catch (e) {}
    },
    startSensors() {
        try {
            geolocation.subscribe({
                success: (d) => {
                    curLat = Number(d.latitude);
                    curLon = Number(d.longitude);
                    hasFix = true;
                    this.refresh();
                },
                fail: () => {
                    // Simulated offset (~420m away) for Previewer
                    if (target && target.saved) {
                        curLat = target.lat - 0.0028;
                        curLon = target.lon - 0.0026;
                        hasFix = true;
                        this.refresh();
                    }
                }
            });
        } catch (e) {
            if (target && target.saved) {
                curLat = target.lat - 0.0028;
                curLon = target.lon - 0.0026;
                hasFix = true;
                this.refresh();
            }
        }
        try {
            sensor.subscribeCompass({
                success: (d) => {
                    if (d && d.direction !== undefined) {
                        heading = Number(d.direction);
                        this.refresh();
                    }
                },
                fail: () => {}
            });
        } catch (e) {}
    },
    refresh() {
        if (!target || !hasFix) {
            return;
        }
        const dist = haversineM(curLat, curLon, target.lat, target.lon);
        const brg = bearingDeg(curLat, curLon, target.lat, target.lon);
        if (dist <= 40) {
            this.dialBg = '#162722';
            this.dialCol = '#a6f2d1';
            this.arrow = '✓';
            this.distText = '¡Llegaste!';
            this.dirText = fmtDist(dist);
            if (!arrivedBuzz) {
                arrivedBuzz = true;
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            }
        } else {
            this.dialBg = '#1c2b2a';
            this.dialCol = '#80d5d0';
            this.arrow = relArrow(brg, heading);
            this.distText = fmtDist(dist);
            this.dirText = cardinalLong(brg) + (heading >= 0 ? ' · Brújula' : '');
        }
    },
    updateHere() {
        if (!hasFix || !target) {
            return;
        }
        target.lat = curLat;
        target.lon = curLon;
        target.saved = true;
        save('places', places);
        try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        this.refresh();
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/places/places' });
        }
    }
};

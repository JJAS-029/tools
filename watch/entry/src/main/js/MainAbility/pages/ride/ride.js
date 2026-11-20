import router from '@system.router';
import geolocation from '@system.geolocation';
import sensor from '@system.sensor';
import vibrator from '@system.vibrator';
import { tick } from '../../common/haptics.js';
import { load } from '../../common/store.js';
import { defaultBike, bikeState } from '../../common/battcalc.js';
import { haversineM } from '../../common/geocalc.js';

const LIMITS = [150, 160, 170, 180];

let lastLat = 0;
let lastLon = 0;
let lastTs = 0;
let lastBuzz = 0;

export default {
    data: {
        limIdx: 1, // 160 bpm
        limitText: 'Máx 160 bpm ⇄',
        chipBg: '#1c2b2a',
        chipCol: '#80d5d0',
        speedText: '0.0',
        heroBg: '#162722',
        heroCol: '#a6f2d1',
        hrText: '-- bpm',
        zoneText: 'Pulso',
        hrBg: '#1d201f',
        hrCol: '#f1f3f1',
        rangeText: '-- km'
    },
    onInit() {
        lastTs = 0;
        lastBuzz = 0;
        load('bike', defaultBike(), (b) => {
            const st = bikeState(b, new Date().getTime());
            this.rangeText = (st.charged ? st.remaining : b.rangeKm) + ' km';
        });
        this.startSensors();
    },
    onDestroy() {
        try { geolocation.unsubscribe(); } catch (e) {}
        try { sensor.unsubscribeHeartRate(); } catch (e) {}
    },
    startSensors() {
        try {
            geolocation.subscribe({
                success: (d) => {
                    const now = new Date().getTime();
                    const lat = Number(d.latitude);
                    const lon = Number(d.longitude);
                    if (d.speed !== undefined && d.speed >= 0) {
                        this.speedText = (Number(d.speed) * 3.6).toFixed(1);
                    } else if (lastTs > 0 && now > lastTs) {
                        const m = haversineM(lastLat, lastLon, lat, lon);
                        const kmh = (m / ((now - lastTs) / 1000)) * 3.6;
                        if (kmh < 80) { this.speedText = kmh.toFixed(1); }
                    }
                    lastLat = lat;
                    lastLon = lon;
                    lastTs = now;
                },
                fail: () => { this.speedText = 'GPS --'; }
            });
        } catch (e) { this.speedText = 'GPS --'; }

        try {
            sensor.subscribeHeartRate({
                success: (d) => {
                    const bpm = Math.round(Number(d.heartRate) || 0);
                    if (bpm <= 0) { return; }
                    this.hrText = bpm + ' bpm';
                    const lim = LIMITS[this.limIdx];
                    if (bpm >= lim) {
                        this.hrBg = '#5c1d1a';
                        this.hrCol = '#ffb4ab';
                        this.zoneText = '¡Baja ritmo!';
                        const now = new Date().getTime();
                        if (now - lastBuzz > 8000) {
                            lastBuzz = now;
                            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
                        }
                    } else if (bpm >= lim - 15) {
                        this.hrBg = '#2f2a20';
                        this.hrCol = '#ffd27a';
                        this.zoneText = 'Zona alta';
                    } else {
                        this.hrBg = '#162722';
                        this.hrCol = '#a6f2d1';
                        this.zoneText = 'Zona bien';
                    }
                },
                fail: () => {}
            });
        } catch (e) {}
    },
    nextLimit() {
        tick();
        this.limIdx = (this.limIdx + 1) % LIMITS.length;
        this.limitText = 'Máx ' + LIMITS[this.limIdx] + ' bpm ⇄';
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/bikecare/bikecare' });
        }
    }
};

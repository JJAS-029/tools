import router from '@system.router';
import geolocation from '@system.geolocation';
import sensor from '@system.sensor';
import { focusCrown } from '../../common/haptics.js';
import { cardinalShort } from '../../common/geocalc.js';

const OK = { bg: '#162722', color: '#a6f2d1', sub: '#c4c7c5' };
const NO = { bg: '#33201d', color: '#ffb4a8', sub: '#c4c7c5' };
const WAIT = { bg: '#1d201f', color: '#f1f3f1', sub: '#9da39f' };

export default {
    data: {
        rows: []
    },
    onInit() {
        this.rows = [
            { n: 'GPS', s: 'Probando...', bg: WAIT.bg, color: WAIT.color, sub: WAIT.sub },
            { n: 'Brújula', s: 'Probando...', bg: WAIT.bg, color: WAIT.color, sub: WAIT.sub },
            { n: 'Pulso', s: 'Probando...', bg: WAIT.bg, color: WAIT.color, sub: WAIT.sub },
            { n: 'Pasos', s: 'Probando...', bg: WAIT.bg, color: WAIT.color, sub: WAIT.sub },
            { n: 'Acelerómetro', s: 'Probando...', bg: WAIT.bg, color: WAIT.color, sub: WAIT.sub }
        ];
        this.probeAll();
    },
    onShow() {
        focusCrown(this.$refs.list);
    },
    onDestroy() {
        try { sensor.unsubscribeCompass(); } catch (e) {}
        try { sensor.unsubscribeHeartRate(); } catch (e) {}
        try { sensor.unsubscribeStepCounter(); } catch (e) {}
        try { sensor.unsubscribeAccelerometer(); } catch (e) {}
    },
    mark(i, text, pal) {
        const r = this.rows[i];
        r.s = text;
        r.bg = pal.bg;
        r.color = pal.color;
        r.sub = pal.sub;
    },
    probeAll() {
        // 0: GPS
        try {
            geolocation.getLocation({
                success: (d) => this.mark(0, d.latitude.toFixed(4) + ', ' + d.longitude.toFixed(4), OK),
                fail: (d, c) => this.mark(0, 'No disp. (' + c + ')', NO)
            });
        } catch (e) { this.mark(0, 'No soportado', NO); }

        // 1: Compass
        try {
            sensor.subscribeCompass({
                success: (d) => this.mark(1, Math.round(d.direction) + '° ' + cardinalShort(d.direction), OK),
                fail: (d, c) => this.mark(1, 'No disp. (' + c + ')', NO)
            });
        } catch (e) { this.mark(1, 'No soportado', NO); }

        // 2: Heart rate
        try {
            sensor.subscribeHeartRate({
                success: (d) => this.mark(2, d.heartRate + ' bpm', OK),
                fail: (d, c) => this.mark(2, 'No disp. (' + c + ')', NO)
            });
        } catch (e) { this.mark(2, 'No soportado', NO); }

        // 3: Step counter
        try {
            sensor.subscribeStepCounter({
                success: (d) => this.mark(3, d.steps + ' pasos', OK),
                fail: (d, c) => this.mark(3, 'No disp. (' + c + ')', NO)
            });
        } catch (e) { this.mark(3, 'No soportado', NO); }

        // 4: Accelerometer
        try {
            sensor.subscribeAccelerometer({
                interval: 'normal',
                success: (d) => this.mark(4, 'x:' + d.x.toFixed(1) + ' y:' + d.y.toFixed(1), OK),
                fail: (d, c) => this.mark(4, 'No disp. (' + c + ')', NO)
            });
        } catch (e) { this.mark(4, 'No soportado', NO); }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/places/places' });
        }
    }
};

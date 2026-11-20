import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { drawWavyRing } from '../../common/wavyring.js';
import { load, save } from '../../common/store.js';
import { dayKey } from '../../common/workcalc.js';

const NAMES = ['Agua 2L', 'Estirarse', 'Moverse', 'Leer 15m', 'Dormir bien'];
let state = { day: '', done: [false, false, false, false, false], streak: 0 };

export default {
    data: {
        pct: 0,
        ringColor: '#a8c8ff',
        bigText: '0/5',
        smallText: 'Hábitos',
        rows: []
    },
    onInit() {
        const rows = [];
        for (let i = 0; i < NAMES.length; i++) {
            rows.push({ idx: i, n: NAMES[i], s: 'Pendiente', bg: '#1d201f', color: '#f1f3f1', sub: '#9da39f' });
        }
        this.rows = rows;

        const today = dayKey(new Date().getTime());
        load('habits', { day: today, done: [false, false, false, false, false], streak: 0 }, (s) => {
            if (s && s.done && s.done.length === 5) {
                if (s.day !== today) {
                    const prevAll = s.done.every((x) => x);
                    state = { day: today, done: [false, false, false, false, false], streak: prevAll ? (s.streak || 0) + 1 : 0 };
                    save('habits', state);
                } else {
                    state = s;
                }
            } else {
                state = { day: today, done: [false, false, false, false, false], streak: 0 };
            }
            this.refresh();
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
        setTimeout(() => { this.drawRing(); }, 80);
    },
    drawRing() {
        drawWavyRing(this, 'ring', {
            w: 210, h: 174, cy: 94, r: 76,
            pct: this.pct, color: this.ringColor, track: '#1f2531'
        });
    },
    refresh() {
        let count = 0;
        for (let i = 0; i < NAMES.length; i++) {
            const ok = !!state.done[i];
            if (ok) { count++; }
            const r = this.rows[i];
            r.n = (ok ? '✓ ' : '○ ') + NAMES[i];
            r.s = ok ? 'Hecho hoy' : 'Toca para marcar';
            r.bg = ok ? '#162722' : '#1d201f';
            r.color = ok ? '#a6f2d1' : '#f1f3f1';
            r.sub = ok ? '#c4c7c5' : '#9da39f';
        }
        this.pct = Math.round((count / NAMES.length) * 100);
        this.ringColor = count === NAMES.length ? '#a6f2d1' : '#a8c8ff';
        this.bigText = count + '/' + NAMES.length;
        this.smallText = state.streak > 0 ? state.streak + ' d racha' : (count === 5 ? '¡Listo!' : 'Hoy');
        this.drawRing();
    },
    tap(i) {
        if (i < 0 || i >= NAMES.length) {
            return;
        }
        state.done[i] = !state.done[i];
        save('habits', state);
        const all = state.done.every((x) => x);
        if (all) {
            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        } else {
            tick();
        }
        this.refresh();
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

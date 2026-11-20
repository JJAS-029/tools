import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';

const PROFILES = [
    { id: 'agua', name: 'Agua', goal: 8, max: 16, accent: '#a8c8ff', on: '#0a2f60', bg: '#1f2531' },
    { id: 'reps', name: 'Reps', goal: 12, max: 50, accent: '#ffb4a8', on: '#561e15', bg: '#33201d' },
    { id: 'libre', name: 'Libre', goal: 0, max: 99, accent: '#d0bcff', on: '#381e72', bg: '#2b2633' }
];

let state = { idx: 0, vals: [0, 0, 0] };

export default {
    data: {
        count: 0,
        pct: 0,
        maxVal: 16,
        chipText: 'Agua ⇄',
        chipBg: '#1f2531',
        accent: '#a8c8ff',
        onAccent: '#0a2f60',
        ringColor: '#a8c8ff',
        subText: 'de 8'
    },
    onInit() {
        load('counter', { idx: 0, vals: [0, 0, 0] }, (s) => {
            if (s && s.vals && s.vals.length === 3) {
                state = s;
            }
            this.refresh();
        });
    },
    onShow() {
        focusCrown(this.$refs.slider);
    },
    refresh() {
        const p = PROFILES[state.idx] || PROFILES[0];
        const v = Number(state.vals[state.idx]) || 0;
        this.count = v;
        this.maxVal = p.max;
        this.chipText = p.name + ' ⇄';
        this.chipBg = p.bg;
        this.accent = p.accent;
        this.onAccent = p.on;
        if (p.goal > 0) {
            this.pct = Math.min(100, Math.round((v / p.goal) * 100));
            const done = v >= p.goal;
            this.ringColor = done ? '#a6f2d1' : p.accent;
            this.subText = done ? '¡Meta!' : 'de ' + p.goal;
        } else {
            this.pct = Math.min(100, Math.round((v / p.max) * 100));
            this.ringColor = p.accent;
            this.subText = 'libre';
        }
    },
    setVal(next) {
        const p = PROFILES[state.idx] || PROFILES[0];
        const prev = Number(state.vals[state.idx]) || 0;
        const clamped = Math.max(0, Math.min(p.max, Math.round(next)));
        if (clamped === prev) {
            return;
        }
        state.vals[state.idx] = clamped;
        save('counter', state);
        if (p.goal > 0 && prev < p.goal && clamped >= p.goal) {
            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        } else {
            tick();
        }
        this.refresh();
    },
    inc() {
        this.setVal((state.vals[state.idx] || 0) + 1);
    },
    dec() {
        this.setVal((state.vals[state.idx] || 0) - 1);
    },
    reset() {
        state.vals[state.idx] = 0;
        save('counter', state);
        try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        this.refresh();
    },
    onSlide(e) {
        if (e && e.value !== undefined) {
            this.setVal(e.value);
        }
    },
    nextProfile() {
        tick();
        state.idx = (state.idx + 1) % PROFILES.length;
        save('counter', state);
        this.refresh();
        focusCrown(this.$refs.slider);
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

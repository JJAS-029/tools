import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';

const DAY_MS = 86400000;

function defaultDays(now) {
    return {
        koalaTs: now - 30 * DAY_MS,   // days since
        tripTs: now + 45 * DAY_MS,    // countdown
        bikeStreak: 0                 // manual +1 streak
    };
}

let st = null;

export default {
    data: {
        rows: []
    },
    onInit() {
        this.rows = [
            { kind: 'koala', n: '', s: '', bg: '#33202a', color: '#ffb0cd', sub: '#c4c7c5' },
            { kind: 'trip', n: '', s: '', bg: '#1f2531', color: '#a8c8ff', sub: '#c4c7c5' },
            { kind: 'bike', n: '', s: '', bg: '#162722', color: '#a6f2d1', sub: '#c4c7c5' },
            { kind: 'info', n: 'Tip', s: 'Toca: +1 · Mantén: 0', bg: '#000000', color: '#9da39f', sub: '#6f6a73' }
        ];
        const now = new Date().getTime();
        load('days', defaultDays(now), (saved) => {
            st = saved || defaultDays(now);
            this.refresh();
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
    },
    refresh() {
        const now = new Date().getTime();
        const kDays = Math.max(0, Math.floor((now - st.koalaTs) / DAY_MS));
        const tDays = Math.max(0, Math.ceil((st.tripTs - now) / DAY_MS));

        this.rows[0].n = kDays + ' días';
        this.rows[0].s = 'Con Koala';

        this.rows[1].n = tDays === 0 ? '¡Hoy!' : 'Faltan ' + tDays + ' d';
        this.rows[1].s = 'Próximo viaje';

        this.rows[2].n = (st.bikeStreak || 0) + ' días';
        this.rows[2].s = 'Racha bici · +1';
    },
    tap(i) {
        const r = this.rows[i];
        if (!r || !st || r.kind === 'info') {
            return;
        }
        tick();
        if (r.kind === 'koala') {
            st.koalaTs -= DAY_MS; // +1 day elapsed
        } else if (r.kind === 'trip') {
            st.tripTs += DAY_MS;  // +1 day remaining
        } else if (r.kind === 'bike') {
            st.bikeStreak = (st.bikeStreak || 0) + 1;
        }
        save('days', st);
        this.refresh();
    },
    hold(i) {
        const r = this.rows[i];
        if (!r || !st || r.kind === 'info') {
            return;
        }
        const now = new Date().getTime();
        if (r.kind === 'koala') { st.koalaTs = now; }
        else if (r.kind === 'trip') { st.tripTs = now + 7 * DAY_MS; }
        else if (r.kind === 'bike') { st.bikeStreak = 0; }
        save('days', st);
        try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        this.refresh();
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

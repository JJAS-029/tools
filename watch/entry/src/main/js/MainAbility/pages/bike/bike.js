import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { row, INFO, ITEM, ACTION, TONAL } from '../../common/rows.js';
import { defaultBike, bikeState, bikeCharge, fmtWhen, fmtDur, levelColor } from '../../common/battcalc.js';

// Bike data OUTSIDE `data`: lite observes every change in `data` and with the
// growing trip list it ran out of memory (froze after several taps).
let bike = null;

// Fixed list slots: built ONCE; each tap only changes texts.
const ETA = 0;
const SINCE = 1;
const USE0 = 2; // 2, 3, 4 = the three uses
const UNDO = 5;
const CHARGE = 6;
const RANGE = 7;
const MAX_TRIPS = 10; // older ones get merged (only the recent ones are needed to undo)

const DIM = { color: '#6f6a73', sub: '#4a4458', bg: '#141218' };

export default {
    data: {
        pct: 0,
        ringColor: '#80d5d0',
        bigText: '--',
        smallText: 'Cargando...',
        rows: []
    },
    onInit() {
        const rows = [
            row({ kind: 'info', n: '', s: '' }, '', INFO),
            row({ kind: 'info', n: '', s: '' }, '', INFO)
        ];
        for (let i = 0; i < 3; i++) {
            rows.push(row({ kind: 'use', idx: i, n: '', s: '' }, 'u_' + i + '.png', ITEM));
        }
        rows.push(row({ kind: 'undo', n: 'Deshacer', s: '' }, '', TONAL));
        rows.push(row({ kind: 'charge', n: 'Cargué 100%', s: 'Reinicia cuenta' }, 'bt_charge.png', ACTION));
        rows.push(row({ kind: 'range', n: 'Autonomía', s: '' }, '', TONAL));
        rows.push(row({ kind: 'info', n: 'Tip', s: 'Mantén = editar km' }, '', INFO));
        this.rows = rows;

        load('bike', defaultBike(), (b) => {
            bike = b;
            this.refresh();
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
    },
    set(k, n, s) {
        const r = this.rows[k];
        if (r.n !== n) { r.n = n; }
        if (r.s !== s) { r.s = s; }
    },
    refresh() {
        const b = bike;
        const now = new Date().getTime();
        const st = bikeState(b, now);

        if (!st.charged) {
            this.pct = 0;
            this.bigText = '--';
            this.smallText = b.rangeKm + ' km';
            this.set(ETA, 'Sin carga', 'Toca Cargué 100%');
            this.set(SINCE, '', '');
        } else {
            this.pct = st.pct;
            this.ringColor = levelColor(st.pct);
            this.bigText = st.pct + '%';
            this.smallText = st.remaining + ' km';
            // Big value on top, short label below (Pixel Watch style).
            this.set(ETA, st.etaTs ? fmtWhen(st.etaTs, now) : 'Calculando',
                st.daily > 0 ? 'Cargar · ' + st.daily + ' km/día' : 'Cuándo cargar');
            this.set(SINCE, 'Hace ' + fmtDur(st.sinceMs), 'Carga · ' + st.used + ' km usados');
        }

        for (let i = 0; i < 3; i++) {
            const u = b.uses[i];
            const left = st.left[i];
            this.set(USE0 + i, u.n,
                u.km + ' km' + (st.charged ? ' · ' + left + (left === 1 ? ' viaje' : ' viajes') : ''));
        }

        // "Undo" always exists (fixed list); dimmed when there's nothing to undo.
        const undo = this.rows[UNDO];
        const has = b.trips.length > 0;
        const c = has ? TONAL : DIM;
        if (undo.bg !== c.bg) {
            undo.color = c.color;
            undo.sub = c.sub;
            undo.bg = c.bg;
        }
        this.set(UNDO, 'Deshacer', has ? 'Quitar ' + b.trips[b.trips.length - 1].km + ' km' : 'Nada que quitar');
        this.set(RANGE, 'Autonomía', b.rangeKm + ' km por carga');
    },
    tap(i) {
        const r = this.rows[i];
        if (!r || !bike || r.kind === 'info') {
            return;
        }
        const b = bike;
        const now = new Date().getTime();
        if (r.kind === 'use') {
            if (!b.chargeTs) {
                b.chargeTs = now; // first time: assume it started full
            }
            b.trips.push({ km: b.uses[r.idx].km, ts: now });
            if (b.trips.length > MAX_TRIPS) {
                // merge the two oldest so storage doesn't grow
                const a = b.trips.shift();
                b.trips[0] = { km: a.km + b.trips[0].km, ts: b.trips[0].ts };
            }
            tick();
            if (bikeState(b, now).pct <= 20) {
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            }
        } else if (r.kind === 'undo') {
            if (b.trips.length === 0) {
                return;
            }
            b.trips.pop();
            tick();
        } else if (r.kind === 'charge') {
            bikeCharge(b, now);
            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        } else if (r.kind === 'range') {
            tick();
            router.replace({ uri: 'pages/batedit/batedit',
                params: { kind: 'range', idx: 0, label: 'Autonomía', val: b.rangeKm } });
            return;
        }
        save('bike', b);
        this.refresh();
    },
    hold(i) {
        const r = this.rows[i];
        if (r && bike && r.kind === 'use') {
            tick();
            const u = bike.uses[r.idx];
            router.replace({ uri: 'pages/batedit/batedit',
                params: { kind: 'use', idx: r.idx, label: u.n, val: u.km } });
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/battery/battery' });
        }
    }
};

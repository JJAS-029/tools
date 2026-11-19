import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { row, INFO, ITEM, ACTION, TONAL } from '../../common/rows.js';
import { defaultBike, bikeState, bikeCharge, fmtWhen, fmtDur, levelColor } from '../../common/battcalc.js';

export default {
    data: {
        pct: 0,
        ringColor: '#80d5d0',
        bigText: '--',
        smallText: 'Cargando...',
        rows: [],
        bike: null
    },
    onInit() {
        load('bike', defaultBike(), (b) => {
            this.bike = b;
            this.refresh();
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
    },
    refresh() {
        const b = this.bike;
        const now = new Date().getTime();
        const s = bikeState(b, now);
        const rows = [];

        if (!s.charged) {
            this.pct = 0;
            this.bigText = '--';
            this.smallText = b.rangeKm + ' km';
            rows.push(row({ kind: 'info', n: 'Sin carga', s: 'Toca Cargué 100%' }, '', INFO));
        } else {
            this.pct = s.pct;
            this.ringColor = levelColor(s.pct);
            this.bigText = s.pct + '%';
            this.smallText = s.remaining + ' km';
            // Big value on top, short label below (Pixel Watch style).
            rows.push(row({ kind: 'info', n: s.etaTs ? fmtWhen(s.etaTs, now) : 'Calculando',
                s: s.daily > 0 ? 'Cargar · ' + s.daily + ' km/día' : 'Cuándo cargar' }, '', INFO));
            rows.push(row({ kind: 'info', n: 'Hace ' + fmtDur(s.sinceMs),
                s: 'Carga · ' + s.used + ' km usados' }, '', INFO));
        }

        // Frequent uses: tap = 1 trip, hold = change km.
        for (let i = 0; i < b.uses.length; i++) {
            const u = b.uses[i];
            const left = s.left[i];
            rows.push(row({ kind: 'use', idx: i, n: u.n,
                s: u.km + ' km' + (s.charged ? ' · ' + left + (left === 1 ? ' viaje' : ' viajes') : '') },
                'u_' + (i % 3) + '.png', ITEM));
        }
        if (b.trips.length > 0) {
            const last = b.trips[b.trips.length - 1];
            rows.push(row({ kind: 'undo', n: 'Deshacer', s: 'Quitar ' + last.km + ' km' }, '', TONAL));
        }
        rows.push(row({ kind: 'charge', n: 'Cargué 100%', s: 'Reinicia cuenta' }, 'bt_charge.png', ACTION));
        rows.push(row({ kind: 'range', n: 'Autonomía', s: b.rangeKm + ' km por carga' }, '', TONAL));
        rows.push(row({ kind: 'info', n: 'Tip', s: 'Mantén = editar km' }, '', INFO));
        this.rows = rows;
    },
    tap(i) {
        const r = this.rows[i];
        if (!r || r.kind === 'info') {
            return;
        }
        const b = this.bike;
        const now = new Date().getTime();
        if (r.kind === 'use') {
            if (!b.chargeTs) {
                b.chargeTs = now; // first time: assume it started full
            }
            b.trips.push({ km: b.uses[r.idx].km, ts: now });
            tick();
            const s = bikeState(b, now);
            if (s.pct <= 20) {
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            }
        } else if (r.kind === 'undo') {
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
        if (r && r.kind === 'use') {
            tick();
            const u = this.bike.uses[r.idx];
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

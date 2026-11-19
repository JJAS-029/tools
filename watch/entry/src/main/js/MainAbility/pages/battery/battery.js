import router from '@system.router';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, readBattery } from '../../common/store.js';
import { row, ITEM } from '../../common/rows.js';
import { defaultBike, defaultWatch, bikeState, watchState, fmtWhen } from '../../common/battcalc.js';

// Summary of both batteries; tap to open each one.
export default {
    data: {
        rows: []
    },
    onInit() {
        this.rows = [
            row({ uri: 'pages/bike/bike', n: 'Bici', s: '...' }, 'bt_bike.png', ITEM),
            row({ uri: 'pages/watchbat/watchbat', n: 'Reloj', s: '...' }, 'bt_watch.png', ITEM)
        ];
        const now = new Date().getTime();
        load('bike', defaultBike(), (b) => {
            const s = bikeState(b, now);
            this.setSub(0, s.charged
                ? s.pct + '% · ' + (s.etaTs ? 'cargar ' + fmtWhen(s.etaTs, now) : s.remaining + ' km')
                : 'Sin carga registrada');
        });
        load('watchbat', defaultWatch(), (w) => {
            readBattery((lvl) => {
                if (lvl < 0) {
                    this.setSub(1, 'Sin lectura');
                    return;
                }
                const s = watchState(w, lvl, now);
                this.setSub(1, lvl + '% · ' + (s.etaTs ? 'dura a ' + fmtWhen(s.etaTs, now) : 'calculando'));
            });
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
    },
    setSub(i, text) {
        // Reassign the array so the list updates.
        const rows = this.rows.slice();
        const r = {};
        for (const k in rows[i]) {
            r[k] = rows[i][k];
        }
        r.s = text;
        rows[i] = r;
        this.rows = rows;
    },
    tap(i) {
        const r = this.rows[i];
        if (r) {
            tick();
            router.replace({ uri: r.uri });
        }
    },
    hold(i) {
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

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
                ? s.pct + '% · ' + (s.etaTs ? fmtWhen(s.etaTs, now) : s.remaining + ' km')
                : 'Sin carga aún');
        });
        load('watchbat', defaultWatch(), (w) => {
            readBattery((lvl) => {
                if (lvl < 0) {
                    this.setSub(1, 'Sin lectura');
                    return;
                }
                const s = watchState(w, lvl, now);
                this.setSub(1, lvl + '% · ' + (s.etaTs ? fmtWhen(s.etaTs, now) : 'midiendo'));
            });
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
    },
    setSub(i, text) {
        // Only change the text (rebuilding the list costs memory on lite).
        this.rows[i].s = text;
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

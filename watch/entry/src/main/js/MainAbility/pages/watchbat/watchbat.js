import router from '@system.router';
import vibrator from '@system.vibrator';
import { focusCrown } from '../../common/haptics.js';
import { load, save, readBattery } from '../../common/store.js';
import { row, INFO, ACTION } from '../../common/rows.js';
import { defaultWatch, watchState, watchCharge, fmtWhen, fmtDur, levelColor } from '../../common/battcalc.js';

export default {
    data: {
        pct: 0,
        ringColor: '#80d5d0',
        bigText: '--',
        smallText: 'Leyendo...',
        rows: [],
        w: null,
        level: -1,
        charging: false
    },
    onInit() {
        load('watchbat', defaultWatch(), (w) => {
            this.w = w;
            readBattery((lvl, charging) => {
                this.level = lvl;
                this.charging = charging;
                // If you open it while it's charging at 100%, the charge is recorded on its own.
                if (charging && lvl >= 99) {
                    watchCharge(w, lvl, new Date().getTime());
                    save('watchbat', w);
                }
                this.refresh();
            });
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
    },
    refresh() {
        const rows = [];
        const lvl = this.level;
        if (lvl < 0) {
            this.bigText = '--';
            this.smallText = 'Sin lectura';
            rows.push(row({ kind: 'info', n: 'Sin lectura', s: 'Prueba en el reloj' }, '', INFO));
            this.rows = rows;
            return;
        }
        const now = new Date().getTime();
        const s = watchState(this.w, lvl, now);
        this.pct = lvl;
        this.ringColor = levelColor(lvl);
        this.bigText = lvl + '%';
        if (this.charging) {
            this.smallText = 'Cargando';
        } else {
            this.smallText = s.hoursLeft > 0 ? '≈ ' + fmtDur(s.hoursLeft * 3600000) : 'Calculando';
        }

        if (!s.charged) {
            rows.push(row({ kind: 'info', n: 'Sin carga', s: 'Toca Lo cargué' }, '', INFO));
        } else {
            rows.push(row({ kind: 'info', n: s.etaTs ? fmtWhen(s.etaTs, now) : 'Midiendo',
                s: s.etaTs ? 'Se acaba la pila' : 'Faltan ~2 h de datos' }, '', INFO));
            if (s.rate > 0) {
                rows.push(row({ kind: 'info', n: '~' + s.rate + ' %/h',
                    s: s.measured ? 'Consumo actual' : 'Cargas anteriores' }, '', INFO));
            }
            rows.push(row({ kind: 'info', n: 'Hace ' + fmtDur(s.sinceMs),
                s: 'Carga · desde ' + this.w.chargeLevel + '%' }, '', INFO));
        }
        rows.push(row({ kind: 'charge', n: 'Lo cargué', s: 'Al 100%' }, 'bt_charge.png', ACTION));
        rows.push(row({ kind: 'info', n: 'Tip', s: 'Ábrela al cargar' }, '', INFO));
        this.rows = rows;
    },
    tap(i) {
        const r = this.rows[i];
        if (r && r.kind === 'charge' && this.level >= 0) {
            watchCharge(this.w, this.level, new Date().getTime());
            save('watchbat', this.w);
            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            this.refresh();
        }
    },
    hold(i) {
        // no long-press actions on this screen
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/battery/battery' });
        }
    }
};

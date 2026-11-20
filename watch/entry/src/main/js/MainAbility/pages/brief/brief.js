import router from '@system.router';
import bridge from '../../common/bridge.js';
import { PUBLIC } from '../../common/flavor.js';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save, readBattery } from '../../common/store.js';
import { defaultBike, bikeState } from '../../common/battcalc.js';
import { defaultWork, workState, fmtMoney, fmtClock } from '../../common/workcalc.js';
import { defaultCard, cardTrips } from '../../common/metrodata.js';
import { defaultUnitCfg } from '../../common/unitcalc.js';
import {
    greeting, fmtDateShort, specialDay, upcomingSpecialDay,
    defaultWeather, weatherAdvice
} from '../../common/briefcalc.js';

const IMG = '/common/images/';

// Fixed slots in Now Brief list (lite memory rule)
const WEATHER = 0;
const DAY = 1;
const BIKE = 2;
const WORK = 3;
const MI = 4;
const FX = 5;

const C_ITEM = { bg: '#1d201f', color: '#f1f3f1', sub: '#9da39f' };
const C_OK = { bg: '#162722', color: '#a6f2d1', sub: '#c4c7c5' };
const C_WARN = { bg: '#5c1d1a', color: '#ffb4ab', sub: '#f1f3f1' };
const C_CAUT = { bg: '#2f2a20', color: '#ffd27a', sub: '#c4c7c5' };
const C_LILAC = { bg: '#2b2633', color: '#d0bcff', sub: '#c4c7c5' };

export default {
    data: {
        greetText: 'Now Brief',
        dateText: '',
        rows: []
    },
    onInit() {
        this.rows = [
            { kind: 'weather', uri: '', icon: IMG + 'br_sun.png', n: 'Clima', s: 'Consultando...', bg: C_ITEM.bg, color: C_ITEM.color, sub: C_ITEM.sub },
            { kind: 'day', uri: '', icon: IMG + 'br_star.png', n: 'Hoy', s: '...', bg: C_LILAC.bg, color: C_LILAC.color, sub: C_LILAC.sub },
            { kind: 'bike', uri: 'pages/bike/bike', icon: IMG + 'bt_bike.png', n: 'Bici', s: '...', bg: C_ITEM.bg, color: C_ITEM.color, sub: C_ITEM.sub },
            { kind: 'work', uri: 'pages/work/work', icon: IMG + 'w_cash.png', n: 'Jornada', s: '...', bg: C_ITEM.bg, color: C_ITEM.color, sub: C_ITEM.sub },
            { kind: 'mi', uri: 'pages/metrocard/metrocard', icon: IMG + 'mi_card.png', n: 'Tarjeta MI', s: '...', bg: C_ITEM.bg, color: C_ITEM.color, sub: C_ITEM.sub },
            { kind: 'fx', uri: 'pages/units/units', icon: IMG + 'uc_usd.png', n: 'Reloj · USD', s: '...', bg: C_ITEM.bg, color: C_ITEM.color, sub: C_ITEM.sub }
        ];

        bridge.on('brief.weather', (w) => {
            if (w && w.updated) {
                save('weather', w);
                this.applyWeather(w);
            }
        });
        this.refreshAll();
        bridge.send('brief.get');
    },
    onShow() {
        focusCrown(this.$refs.list);
        this.refreshAll();
    },
    onDestroy() {
        bridge.off('brief.weather');
    },
    setRow(idx, n, s, c) {
        const r = this.rows[idx];
        r.n = n;
        r.s = s;
        if (c) {
            r.bg = c.bg;
            r.color = c.color;
            r.sub = c.sub;
        }
    },
    applyWeather(w) {
        const adv = weatherAdvice(w);
        if (adv.level === 'idle') {
            this.setRow(WEATHER, 'Clima CDMX', PUBLIC ? 'Con la app del teléfono' : 'Toca para actualizar', C_ITEM);
            return;
        }
        const pal = adv.level === 'warn' ? C_WARN : (adv.level === 'caution' ? C_CAUT : C_OK);
        const t = Math.round(Number(w.temp) || 0);
        const mn = Math.round(Number(w.min) || 0);
        const mx = Math.round(Number(w.max) || 0);
        this.setRow(WEATHER, t + '° · ' + mn + '°/' + mx + '°', adv.text, pal);
    },
    refreshAll() {
        const now = new Date().getTime();
        this.greetText = greeting(now);
        this.dateText = fmtDateShort(now);

        // Special day / efeméride
        const sp = specialDay(now);
        if (sp) {
            this.setRow(DAY, sp, 'Fecha especial', C_LILAC);
        } else {
            const up = upcomingSpecialDay(now);
            if (up) {
                const when = up.inDays === 1 ? 'Mañana' : 'En ' + up.inDays + ' días';
                this.setRow(DAY, up.name, when, C_ITEM);
            } else {
                this.setRow(DAY, 'Día tranquilo', 'Sin fechas próximas', C_ITEM);
            }
        }

        // Weather (cached first, then live via bridge)
        load('weather', defaultWeather(), (w) => {
            this.applyWeather(w);
        });

        // Bike battery
        load('bike', defaultBike(), (b) => {
            const st = bikeState(b, now);
            if (!st.charged) {
                this.setRow(BIKE, 'Bici sin carga', 'Toca para iniciar', C_CAUT);
            } else if (st.pct <= 25) {
                this.setRow(BIKE, 'Cargar bici', st.pct + '% · ' + st.remaining + ' km', C_WARN);
            } else {
                this.setRow(BIKE, 'Bici ' + st.pct + '%', st.remaining + ' km listos', C_OK);
            }
        });

        // Workday
        load('work', defaultWork(), (w) => {
            const st = workState(w, now);
            if (st.phase === 'before') {
                this.setRow(WORK, 'Turno ' + fmtClock(st.effStart), 'Meta ' + fmtMoney(st.dayTotal, false), C_ITEM);
            } else if (st.phase === 'done') {
                this.setRow(WORK, fmtMoney(st.earned + st.overtimeEarned, false) + ' hoy', 'Jornada 100%', C_OK);
            } else {
                this.setRow(WORK, fmtMoney(st.earned, false) + ' · ' + st.pct + '%', 'Sales ' + fmtClock(st.effEnd), C_OK);
            }
        });

        // Tarjeta MI
        load('micard', defaultCard(), (c) => {
            const bal = Number(c.balance) || 0;
            const trips = cardTrips(bal, 5);
            if (trips <= 2) {
                this.setRow(MI, 'Recargar MI', '$' + bal + ' · ' + trips + ' viajes', C_CAUT);
            } else {
                this.setRow(MI, 'MI $' + bal, trips + ' viajes Metro', C_ITEM);
            }
        });

        // Watch battery + USD rate
        load('unitcfg', defaultUnitCfg(), (cfg) => {
            const rate = Number(cfg.usdRate) || 20.0;
            readBattery((lvl) => {
                const batTxt = lvl >= 0 ? 'Reloj ' + lvl + '%' : 'Tipo de cambio';
                const pal = lvl >= 0 && lvl <= 20 ? C_WARN : C_ITEM;
                this.setRow(FX, 'USD $' + rate.toFixed(2), batTxt, pal);
            });
        });
    },
    tap(i) {
        const r = this.rows[i];
        if (!r) {
            return;
        }
        tick();
        if (r.kind === 'weather') {
            bridge.send('brief.get');
            return;
        }
        if (r.uri) {
            router.replace({ uri: r.uri });
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { row, ITEM, ACTION, TONAL } from '../../common/rows.js';
import {
    defaultWork, workState, dayKey,
    fmtClock, fmtDurMin, fmtSecs, fmtMoney
} from '../../common/workcalc.js';

// Stored outside `data` so lite's observer doesn't grow memory over time.
let work = null;

// Fixed list slots: built once in onInit(), only texts/colors change.
const EARNED = 0;
const CHECKIN = 1;
const MEETING = 2;
const RATE = 3;
const PAYROLL = 4;
const START = 5;
const END = 6;
const LUNCH = 7;

const HERO = { color: '#a6f2d1', sub: '#c4c7c5', bg: '#162722' };
const MEET_ON = { color: '#ffb4ab', sub: '#f1f3f1', bg: '#5c1d1a' };

export default {
    data: {
        pct: 0,
        ringColor: '#a6f2d1',
        smallColor: '#a6f2d1',
        bigText: '--',
        smallText: '...',
        rows: []
    },
    onInit() {
        this.ticker = null;
        this.rows = [
            row({ kind: 'info', n: '$0.00', s: 'Hoy' }, 'w_cash.png', HERO),
            row({ kind: 'checkin', n: 'Llegué ahora', s: 'Marcar hoy' }, 'w_in.png', ACTION),
            row({ kind: 'meeting', n: 'Junta', s: 'Medir costo' }, 'w_meet.png', ITEM),
            row({ kind: 'rate', n: '$150 / h', s: 'Editar pago' }, 'w_rate.png', TONAL),
            row({ kind: 'payroll', n: 'Nómina', s: 'Quincena' }, 'w_pay.png', ITEM),
            row({ kind: 'start', n: 'Entrada', s: '09:00' }, 'w_clock.png', ITEM),
            row({ kind: 'end', n: 'Salida', s: '18:00' }, 'w_clock.png', ITEM),
            row({ kind: 'lunch', n: 'Comida', s: '60 min' }, 'w_lunch.png', ITEM)
        ];

        load('work', defaultWork(), (w) => {
            const def = defaultWork();
            for (const k in def) {
                if (w[k] === undefined) { w[k] = def[k]; }
            }
            work = w;
            this.refresh();
            this.startTicker();
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
        if (work) {
            this.refresh();
            this.startTicker();
        }
    },
    onHide() {
        this.stopTicker();
    },
    onDestroy() {
        this.stopTicker();
    },
    startTicker() {
        this.stopTicker();
        this.ticker = setInterval(() => {
            if (work) {
                this.refresh();
            }
        }, 1000);
    },
    stopTicker() {
        if (this.ticker) {
            clearInterval(this.ticker);
            this.ticker = null;
        }
    },
    set(k, n, s) {
        const r = this.rows[k];
        if (r.n !== n) { r.n = n; }
        if (r.s !== s) { r.s = s; }
    },
    setColors(k, c) {
        const r = this.rows[k];
        if (r.bg !== c.bg) {
            r.color = c.color;
            r.sub = c.sub;
            r.bg = c.bg;
        }
    },
    refresh() {
        const w = work;
        const now = new Date().getTime();
        const st = workState(w, now);

        // Ring: only short text inside so it never collides with the arc.
        this.pct = st.pct;
        this.bigText = st.pct + '%';
        if (st.phase === 'before') {
            this.ringColor = '#b4ccff';
            this.smallColor = '#b4ccff';
            this.smallText = fmtDurMin(st.startsInMin);
        } else if (st.phase === 'done') {
            const extra = st.overtimeMin >= 1;
            this.ringColor = extra ? '#ffd27a' : '#80d5d0';
            this.smallColor = this.ringColor;
            this.smallText = extra ? '+' + fmtDurMin(st.overtimeMin) : 'Listo';
        } else {
            this.ringColor = '#a6f2d1';
            this.smallColor = '#a6f2d1';
            this.smallText = '-' + fmtDurMin(st.leftMin);
        }

        // Hero card: exact live earnings + day target (fits cleanly without ellipsis).
        const totalNow = st.earned + st.overtimeEarned;
        this.set(
            EARNED,
            fmtMoney(totalNow),
            'Día ' + fmtMoney(st.dayTotal, false) + ' · ' + fmtClock(st.effEnd)
        );

        if (st.checkedIn) {
            this.setColors(CHECKIN, TONAL);
            this.set(CHECKIN, 'Desde ' + fmtClock(st.effStart), 'Usar fijo');
        } else {
            this.setColors(CHECKIN, ACTION);
            this.set(CHECKIN, 'Llegué ahora', 'Marcar hoy');
        }

        if (st.meetOn) {
            this.setColors(MEETING, MEET_ON);
            this.set(MEETING, fmtMoney(st.meetCost), fmtSecs(st.meetSecs) + ' · Parar');
        } else {
            this.setColors(MEETING, ITEM);
            this.set(MEETING, 'Junta', 'Medir costo');
        }

        this.set(RATE, fmtMoney(w.rate, false) + ' / h', st.paidHrs + ' h · Editar');
        this.set(PAYROLL, 'Nómina', 'Qna ' + fmtMoney(st.biweekly, false));
        this.set(START, 'Entrada', fmtClock(w.startMin));
        this.set(END, 'Salida', fmtClock(w.endMin));
        this.set(LUNCH, 'Comida', w.lunchMin > 0 ? w.lunchMin + ' min' : 'Pagada');
    },
    tap(i) {
        const r = this.rows[i];
        if (!r || !work || r.kind === 'info') {
            return;
        }
        const now = new Date().getTime();
        if (r.kind === 'checkin') {
            const today = dayKey(now);
            if (work.checkInDay === today && work.checkInMin >= 0) {
                work.checkInDay = '';
                work.checkInMin = -1;
                tick();
            } else {
                const d = new Date(now);
                work.checkInDay = today;
                work.checkInMin = d.getHours() * 60 + d.getMinutes();
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            }
            save('work', work);
            this.refresh();
            return;
        }
        if (r.kind === 'meeting') {
            work.meetStartTs = work.meetStartTs > 0 ? 0 : now;
            tick();
            save('work', work);
            this.refresh();
            return;
        }
        tick();
        if (r.kind === 'rate') {
            router.replace({ uri: 'pages/workedit/workedit', params: { kind: 'rate', label: 'Pago / hora', val: work.rate } });
        } else if (r.kind === 'payroll') {
            const biw = Math.round(workState(work, now).biweekly);
            router.replace({ uri: 'pages/workedit/workedit', params: { kind: 'payroll', label: 'Quincena', val: biw } });
        } else if (r.kind === 'start') {
            router.replace({ uri: 'pages/workedit/workedit', params: { kind: 'start', label: 'Entrada', val: work.startMin } });
        } else if (r.kind === 'end') {
            router.replace({ uri: 'pages/workedit/workedit', params: { kind: 'end', label: 'Salida', val: work.endMin } });
        } else if (r.kind === 'lunch') {
            router.replace({ uri: 'pages/workedit/workedit', params: { kind: 'lunch', label: 'Comida', val: work.lunchMin } });
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

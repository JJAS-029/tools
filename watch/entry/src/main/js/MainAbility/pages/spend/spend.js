import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';

const CATS = [
    { name: 'Comida ⇄', col: '#ffd27a', bg: '#2f2a20' },
    { name: 'Transp. ⇄', col: '#a8c8ff', bg: '#1f2531' },
    { name: 'Antojo ⇄', col: '#ffb0cd', bg: '#33202a' },
    { name: 'Otro ⇄', col: '#d0bcff', bg: '#2b2633' }
];

const AMOUNTS = [];
for (let a = 10; a <= 200; a += 10) { AMOUNTS.push(a); }
for (let b = 225; b <= 500; b += 25) { AMOUNTS.push(b); }
for (let c = 550; c <= 1500; c += 50) { AMOUNTS.push(c); }

let log = [];

function fmtMxn(v) {
    const s = '' + Math.round(v);
    let out = '';
    for (let i = 0; i < s.length; i++) {
        if (i > 0 && (s.length - i) % 3 === 0) { out += ','; }
        out += s.charAt(i);
    }
    return '$' + out;
}

export default {
    data: {
        catIdx: 0,
        catText: 'Comida ⇄',
        catCol: '#ffd27a',
        catBg: '#2f2a20',
        totalText: '$0 sem',
        subText: '0 gastos · Mantén = 0',
        range: [],
        sel: 4, // $50
        curAmt: 50
    },
    onInit() {
        const r = [];
        for (let i = 0; i < AMOUNTS.length; i++) {
            r.push(fmtMxn(AMOUNTS[i]));
        }
        this.range = r;
        this.curAmt = AMOUNTS[this.sel];

        load('spend', [], (saved) => {
            if (saved && saved.length) {
                log = saved;
            }
            this.refresh();
        });
    },
    onShow() {
        focusCrown(this.$refs.wheel);
    },
    refresh() {
        const c = CATS[this.catIdx];
        this.catText = c.name;
        this.catCol = c.col;
        this.catBg = c.bg;

        let total = 0;
        for (let i = 0; i < log.length; i++) {
            total += Number(log[i].a) || 0;
        }
        this.totalText = fmtMxn(total) + ' sem';
        if (log.length === 0) {
            this.subText = 'Sin gastos aún';
        } else {
            const last = log[log.length - 1];
            this.subText = log.length + ' · Últ: ' + fmtMxn(last.a);
        }
    },
    nextCat() {
        tick();
        this.catIdx = (this.catIdx + 1) % CATS.length;
        this.refresh();
    },
    onPick(e) {
        const i = e.newSelected !== undefined ? Number(e.newSelected) : this.sel;
        if (i >= 0 && i < AMOUNTS.length) {
            this.curAmt = AMOUNTS[i];
        }
        tick();
    },
    addSpend() {
        log.push({ a: this.curAmt, c: this.catIdx });
        if (log.length > 40) {
            log.shift();
        }
        save('spend', log);
        try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        this.refresh();
    },
    undo() {
        if (log.length === 0) {
            return;
        }
        log.pop();
        save('spend', log);
        tick();
        this.refresh();
    },
    resetWeek() {
        log = [];
        save('spend', log);
        try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        this.refresh();
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

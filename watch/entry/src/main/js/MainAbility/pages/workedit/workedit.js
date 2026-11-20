import router from '@system.router';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { defaultWork, fmtClock, fmtMoney, rateFromBiweekly } from '../../common/workcalc.js';

// Kept outside `data` so lite doesn't observe the parallel values array.
let values = [];

function closestIdx(arr, target) {
    let best = 0;
    let diff = Math.abs(arr[0] - target);
    for (let i = 1; i < arr.length; i++) {
        const d = Math.abs(arr[i] - target);
        if (d < diff) {
            diff = d;
            best = i;
        }
    }
    return best;
}

export default {
    data: {
        kind: 'rate',
        label: '',
        val: 0,
        range: [],
        sel: 0
    },
    onInit() {
        const r = [];
        values = [];
        if (this.kind === 'rate') {
            for (let v = 20; v <= 600; v += 5) {
                values.push(v);
                r.push('$' + v + ' / h');
            }
            for (let v2 = 610; v2 <= 1500; v2 += 10) {
                values.push(v2);
                r.push('$' + v2 + ' / h');
            }
        } else if (this.kind === 'payroll') {
            for (let p = 3000; p <= 60000; p += 500) {
                values.push(p);
                r.push(fmtMoney(p, false));
            }
        } else if (this.kind === 'start') {
            for (let m = 360; m <= 840; m += 15) { // 06:00 .. 14:00
                values.push(m);
                r.push(fmtClock(m));
            }
        } else if (this.kind === 'end') {
            for (let e = 780; e <= 1380; e += 15) { // 13:00 .. 23:00
                values.push(e);
                r.push(fmtClock(e));
            }
        } else if (this.kind === 'lunch') {
            const opts = [0, 30, 45, 60, 90, 120];
            for (let i = 0; i < opts.length; i++) {
                values.push(opts[i]);
                r.push(opts[i] === 0 ? 'Pagada' : opts[i] + ' min');
            }
        }
        this.range = r;
        const cur = Number(this.val);
        this.sel = closestIdx(values, isNaN(cur) ? values[0] : cur);
        this.val = values[this.sel];
    },
    onShow() {
        focusCrown(this.$refs.wheel);
    },
    onPick(e) {
        const i = e.newSelected !== undefined ? Number(e.newSelected) : this.sel;
        if (i >= 0 && i < values.length) {
            this.val = values[i];
        }
        tick();
    },
    done() {
        tick();
        load('work', defaultWork(), (w) => {
            const def = defaultWork();
            for (const k in def) {
                if (w[k] === undefined) { w[k] = def[k]; }
            }
            if (this.kind === 'rate') {
                w.rate = this.val;
            } else if (this.kind === 'payroll') {
                w.rate = rateFromBiweekly(this.val, w);
            } else if (this.kind === 'start') {
                w.startMin = this.val;
                if (w.endMin <= w.startMin + 60) {
                    w.endMin = Math.min(1380, w.startMin + 540);
                }
            } else if (this.kind === 'end') {
                w.endMin = Math.max(w.startMin + 60, this.val);
            } else if (this.kind === 'lunch') {
                w.lunchMin = this.val;
            }
            save('work', w);
            router.replace({ uri: 'pages/work/work' });
        });
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/work/work' });
        }
    }
};

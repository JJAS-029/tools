import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import {
    getUnit, defaultUnitCfg, convert, fmtVal, buildValues, defaultIndex
} from '../../common/unitcalc.js';

let unit = null;
let vals = [];
let usdRate = 20.0;

export default {
    data: {
        mode: 'conv',
        unitId: 'usd',
        isRate: false,
        rev: false,
        chipBg: '#162722',
        chipColor: '#a6f2d1',
        chipText: 'USD → MXN ⇄',
        resText: '$200.00 MXN',
        range: [],
        sel: 0,
        curVal: 10
    },
    onInit() {
        this.isRate = this.mode === 'rate';
        this.rev = false;

        // Build picker-view range SYNCHRONOUSLY once in onInit() so lite never
        // mutates range after mount or overlaps instances.
        if (this.isRate) {
            this.chipBg = '#2f2a20';
            this.chipColor = '#ffd27a';
            this.chipText = '1 USD en MXN';
            vals = [];
            const r = [];
            for (let v = 1400; v <= 2600; v += 25) {
                const f = v / 100;
                vals.push(f);
                r.push('$' + f.toFixed(2));
            }
            this.range = r;
            this.sel = this.closestIdx(usdRate);
            this.curVal = vals[this.sel];
            this.resText = '$' + this.curVal.toFixed(2) + ' MXN';
        } else {
            unit = getUnit(this.unitId);
            this.chipBg = unit.bg;
            this.chipColor = unit.color;
            // Pure numbers in the wheel so swapping direction never changes range.
            vals = buildValues(unit.id, false);
            const r = [];
            for (let i = 0; i < vals.length; i++) {
                r.push('' + vals[i]);
            }
            this.range = r;
            this.sel = defaultIndex(unit.id, false, vals);
            this.curVal = vals[this.sel];
            this.updateConvUi();
        }

        // Load saved USD rate asynchronously; only updates text, never range.
        load('unitcfg', defaultUnitCfg(), (cfg) => {
            usdRate = Number(cfg.usdRate) || 20.0;
            if (this.isRate) {
                this.sel = this.closestIdx(usdRate);
                this.curVal = vals[this.sel];
                this.resText = '$' + this.curVal.toFixed(2) + ' MXN';
            } else {
                this.updateConvUi();
            }
        });
    },
    onShow() {
        focusCrown(this.$refs.wheel);
    },
    closestIdx(target) {
        let best = 0;
        let diff = Math.abs(vals[0] - target);
        for (let i = 1; i < vals.length; i++) {
            const d = Math.abs(vals[i] - target);
            if (d < diff) { diff = d; best = i; }
        }
        return best;
    },
    updateConvUi() {
        if (!unit) {
            return;
        }
        const from = this.rev ? unit.b : unit.a;
        const to = this.rev ? unit.a : unit.b;
        this.chipText = from + ' → ' + to + ' ⇄';
        const out = convert(unit.id, this.curVal, this.rev, usdRate);
        this.resText = fmtVal(out, unit.id, this.rev) + ' ' + to;
    },
    onPick(e) {
        const i = e.newSelected !== undefined ? Number(e.newSelected) : this.sel;
        if (i >= 0 && i < vals.length) {
            this.curVal = vals[i];
            if (this.isRate) {
                this.resText = '$' + this.curVal.toFixed(2) + ' MXN';
            } else {
                this.updateConvUi();
            }
        }
        tick();
    },
    flip() {
        if (this.isRate) {
            return;
        }
        tick();
        this.rev = !this.rev;
        this.updateConvUi();
    },
    saveRate() {
        usdRate = this.curVal;
        save('unitcfg', { usdRate: usdRate });
        try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        router.replace({ uri: 'pages/units/units' });
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/units/units' });
        }
    }
};

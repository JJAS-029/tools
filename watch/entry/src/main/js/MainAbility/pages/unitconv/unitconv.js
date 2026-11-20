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
        chipText: 'USD → MXN',
        resText: '$200.00 MXN',
        range: [],
        sel: 0,
        curVal: 10
    },
    onInit() {
        this.isRate = this.mode === 'rate';
        load('unitcfg', defaultUnitCfg(), (cfg) => {
            usdRate = Number(cfg.usdRate) || 20.0;
            if (this.isRate) {
                this.setupRate();
            } else {
                unit = getUnit(this.unitId);
                this.chipBg = unit.bg;
                this.chipColor = unit.color;
                this.setupConv();
            }
        });
    },
    onShow() {
        focusCrown(this.$refs.wheel);
    },
    setupRate() {
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
        let best = 0;
        let diff = Math.abs(vals[0] - usdRate);
        for (let i = 1; i < vals.length; i++) {
            const d = Math.abs(vals[i] - usdRate);
            if (d < diff) { diff = d; best = i; }
        }
        this.sel = best;
        this.curVal = vals[best];
        this.resText = '$' + this.curVal.toFixed(2) + ' MXN';
        focusCrown(this.$refs.wheel);
    },
    setupConv() {
        const from = this.rev ? unit.b : unit.a;
        const to = this.rev ? unit.a : unit.b;
        this.chipText = from + ' → ' + to + ' ⇄';
        vals = buildValues(unit.id, this.rev);
        const r = [];
        for (let i = 0; i < vals.length; i++) {
            r.push((unit.id === 'usd' ? '$' : '') + vals[i] + ' ' + from);
        }
        this.range = r;
        this.sel = defaultIndex(unit.id, this.rev, vals);
        this.curVal = vals[this.sel];
        this.updateResult();
        focusCrown(this.$refs.wheel);
    },
    updateResult() {
        const to = this.rev ? unit.a : unit.b;
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
                this.updateResult();
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
        this.setupConv();
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

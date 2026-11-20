import router from '@system.router';
import { tick, focusCrown } from '../../common/haptics.js';

const TIPS = [0, 10, 15, 20];
const PPL = [1, 2, 3, 4, 5, 6, 8, 10];
const BILLS = [];
for (let b = 50; b <= 500; b += 10) { BILLS.push(b); }
for (let b2 = 550; b2 <= 2000; b2 += 50) { BILLS.push(b2); }
for (let b3 = 2100; b3 <= 6000; b3 += 100) { BILLS.push(b3); }

function fmtMxn(v) {
    const r = Math.round(v);
    const s = '' + r;
    let out = '';
    for (let i = 0; i < s.length; i++) {
        if (i > 0 && (s.length - i) % 3 === 0) { out += ','; }
        out += s.charAt(i);
    }
    return '$' + out;
}

export default {
    data: {
        bill: 600,
        tipIdx: 2, // 15%
        pplIdx: 1, // 2 personas
        eachText: '$345 c/u',
        metaText: 'Total $690 · +$90',
        tipTab: 'Prop 15%',
        pplTab: '2 pers.',
        range: [],
        sel: 0
    },
    onInit() {
        // Picker range is built ONCE (mutating picker-view range crashes lite).
        const r = [];
        for (let i = 0; i < BILLS.length; i++) {
            r.push(fmtMxn(BILLS[i]));
        }
        this.range = r;
        const idx = BILLS.indexOf(this.bill);
        this.sel = idx >= 0 ? idx : 0;
        this.recalc();
    },
    onShow() {
        focusCrown(this.$refs.wheel);
    },
    nextTip() {
        tick();
        this.tipIdx = (this.tipIdx + 1) % TIPS.length;
        this.recalc();
    },
    nextPeople() {
        tick();
        this.pplIdx = (this.pplIdx + 1) % PPL.length;
        this.recalc();
    },
    onPick(e) {
        const i = e.newSelected !== undefined ? Number(e.newSelected) : this.sel;
        if (i >= 0 && i < BILLS.length) {
            this.bill = BILLS[i];
            this.recalc();
        }
        tick();
    },
    recalc() {
        const tipPct = TIPS[this.tipIdx];
        const people = PPL[this.pplIdx];
        const tipAmt = (this.bill * tipPct) / 100;
        const total = this.bill + tipAmt;
        const each = total / people;
        this.tipTab = 'Prop ' + tipPct + '%';
        this.pplTab = people === 1 ? '1 pers.' : people + ' pers.';
        this.eachText = people === 1 ? fmtMxn(total) : fmtMxn(each) + ' c/u';
        this.metaText = 'Total ' + fmtMxn(total) + ' · +' + fmtMxn(tipAmt);
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

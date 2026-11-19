import router from '@system.router';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { defaultBike } from '../../common/battcalc.js';

// Edits the km of a use (kind 'use') or the range per charge (kind 'range')
// with a picker-view wheel, which the crown turns natively.
export default {
    data: {
        kind: 'use',
        idx: 0,
        label: '',
        val: 0,
        range: [],
        sel: 0,
        min: 1
    },
    onInit() {
        const max = this.kind === 'range' ? 150 : 60;
        this.min = this.kind === 'range' ? 10 : 1;
        const r = [];
        for (let v = this.min; v <= max; v++) {
            r.push(v + ' km');
        }
        this.range = r;
        const cur = Number(this.val) || this.min;
        this.val = Math.max(this.min, Math.min(max, cur));
        this.sel = this.val - this.min;
    },
    onShow() {
        focusCrown(this.$refs.wheel);
    },
    onPick(e) {
        const i = e.newSelected !== undefined ? e.newSelected : this.sel;
        this.val = this.min + Number(i);
        tick();
    },
    done() {
        tick();
        load('bike', defaultBike(), (b) => {
            if (this.kind === 'range') {
                b.rangeKm = this.val;
            } else if (b.uses[this.idx]) {
                b.uses[this.idx].km = this.val;
            }
            save('bike', b);
            router.replace({ uri: 'pages/bike/bike' });
        });
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/bike/bike' });
        }
    }
};

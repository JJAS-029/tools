import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { getLine, transfersOf } from '../../common/metrodata.js';

let line = null;
let ordered = [];

export default {
    data: {
        lineId: '1',
        rev: false,
        curIdx: -1,
        destIdx: -1,
        chipBg: '#4a1b2e',
        chipColor: '#f28ab2',
        dirText: '',
        hintText: 'Toca: voy aquí · Mantén: bajar',
        rows: []
    },
    onInit() {
        line = getLine(this.lineId);
        this.chipBg = line.bg;
        this.chipColor = line.color;
        // Build fixed row slots once (lite memory rule)
        const rows = [];
        for (let i = 0; i < line.s.length; i++) {
            rows.push({
                n: '',
                s: '',
                bg: '#1d201f',
                dot: line.color,
                color: '#f1f3f1',
                sub: '#9da39f'
            });
        }
        this.rows = rows;
        this.rebuildOrder();
    },
    onShow() {
        focusCrown(this.$refs.list);
    },
    rebuildOrder() {
        ordered = [];
        const len = line.s.length;
        for (let i = 0; i < len; i++) {
            ordered.push(this.rev ? line.s[len - 1 - i] : line.s[i]);
        }
        this.dirText = 'L' + line.id + ' → ' + ordered[len - 1];
        this.refresh();
    },
    refresh() {
        const len = ordered.length;
        if (this.curIdx >= 0 && this.destIdx > this.curIdx) {
            const left = this.destIdx - this.curIdx;
            this.hintText = left === 1 ? '¡Bajas en la siguiente!' : 'Faltan ' + left + ' est.';
        } else if (this.curIdx >= 0 && this.curIdx < len - 1) {
            this.hintText = 'Sigue: ' + ordered[this.curIdx + 1];
        } else if (this.curIdx === len - 1) {
            this.hintText = 'Terminal';
        } else {
            this.hintText = 'Toca: aquí · Mantén: bajar';
        }

        for (let i = 0; i < len; i++) {
            const st = ordered[i];
            const r = this.rows[i];
            const tr = transfersOf(st, line.id);
            const trTxt = tr.length > 0 ? 'Transb: L' + tr.join(', L') : (i === len - 1 ? 'Terminal' : 'Estación ' + (i + 1));

            r.n = st;
            if (i === this.curIdx) {
                r.bg = line.bg;
                r.dot = line.color;
                r.color = line.color;
                r.sub = '#f1f3f1';
                r.s = 'Aquí · ' + (tr.length > 0 ? 'L' + tr.join(',') : (i < len - 1 ? '→ ' + ordered[i + 1] : 'Fin'));
            } else if (i === this.destIdx) {
                r.bg = '#5c1d1a';
                r.dot = '#ffb4ab';
                r.color = '#ffb4ab';
                r.sub = '#f1f3f1';
                r.s = 'Bajar aquí';
            } else if (this.curIdx >= 0 && i === this.curIdx + 1) {
                r.bg = '#242927';
                r.dot = '#a6f2d1';
                r.color = '#f1f3f1';
                r.sub = '#a6f2d1';
                r.s = 'Siguiente' + (tr.length > 0 ? ' · L' + tr.join(',') : '');
            } else {
                r.bg = '#1d201f';
                r.dot = tr.length > 0 ? '#ffd27a' : line.color;
                r.color = '#f1f3f1';
                r.sub = tr.length > 0 ? '#ffd27a' : '#9da39f';
                r.s = trTxt;
            }
        }
    },
    flipDir() {
        tick();
        const len = ordered.length;
        this.rev = !this.rev;
        if (this.curIdx >= 0) { this.curIdx = len - 1 - this.curIdx; }
        if (this.destIdx >= 0) { this.destIdx = len - 1 - this.destIdx; }
        this.rebuildOrder();
    },
    tap(i) {
        this.curIdx = i;
        if (this.destIdx > 0 && this.destIdx - this.curIdx === 1) {
            // 1 station before destination: long vibration!
            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        } else {
            tick();
        }
        this.refresh();
    },
    hold(i) {
        this.destIdx = this.destIdx === i ? -1 : i;
        try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        this.refresh();
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/metro/metro' });
        }
    }
};

import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { defaultBike } from '../../common/battcalc.js';

const CHECK_NAMES = ['Casco', 'Luces', 'Llantas', 'Batería bici', 'Candado'];
const MAINT_DEF = [
    { id: 'tires', name: 'Aire llantas', every: 100, lastKm: 0 },
    { id: 'chain', name: 'Lubricar cadena', every: 300, lastKm: 0 },
    { id: 'brakes', name: 'Revisar frenos', every: 1000, lastKm: 0 },
    { id: 'service', name: 'Servicio gral.', every: 2500, lastKm: 0 }
];

let totalKm = 0;
let maint = [];
let checks = [false, false, false, false, false];

function cloneMaint() {
    const out = [];
    for (let i = 0; i < MAINT_DEF.length; i++) {
        const m = MAINT_DEF[i];
        out.push({ id: m.id, name: m.name, every: m.every, lastKm: m.lastKm });
    }
    return out;
}

export default {
    data: {
        tab: 0, // 0 = Checklist, 1 = Mantenimiento
        tabText: 'Checklist ⇄',
        rows: []
    },
    onInit() {
        // Fixed 6 slots: 5 items + 1 shortcut to Direccionales
        const rows = [];
        for (let i = 0; i < 6; i++) {
            rows.push({ kind: 'item', idx: i, n: '', s: '', bg: '#1d201f', color: '#f1f3f1', sub: '#9da39f' });
        }
        this.rows = rows;
        maint = cloneMaint();

        load('bike', defaultBike(), (b) => {
            let sum = 0;
            if (b && b.trips) {
                for (let i = 0; i < b.trips.length; i++) {
                    sum += Number(b.trips[i].km) || 0;
                }
            }
            totalKm = sum;
            load('bikecare', { maint: cloneMaint(), odoBase: 0 }, (saved) => {
                if (saved && saved.maint && saved.maint.length === MAINT_DEF.length) {
                    maint = saved.maint;
                }
                if (saved && saved.odoBase) {
                    totalKm = Math.max(totalKm, Number(saved.odoBase) || 0);
                }
                this.refresh();
            });
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
    },
    refresh() {
        this.tabText = this.tab === 0 ? 'Checklist ⇄' : 'Mantto (' + totalKm + ' km) ⇄';

        if (this.tab === 0) {
            let doneCount = 0;
            for (let i = 0; i < 5; i++) {
                const ok = checks[i];
                if (ok) { doneCount++; }
                const r = this.rows[i];
                r.kind = 'check';
                r.idx = i;
                r.n = (ok ? '✓ ' : '○ ') + CHECK_NAMES[i];
                r.s = ok ? 'Listo' : 'Toca para marcar';
                r.bg = ok ? '#162722' : '#1d201f';
                r.color = ok ? '#a6f2d1' : '#f1f3f1';
                r.sub = ok ? '#c4c7c5' : '#9da39f';
            }
            const last = this.rows[5];
            last.kind = 'signal';
            last.n = 'Direccionales';
            last.s = doneCount === 5 ? '¡Listo para rodar!' : 'Flechas nocturnas';
            last.bg = '#452b0d';
            last.color = '#ffab40';
            last.sub = '#f1f3f1';
        } else {
            for (let j = 0; j < 4; j++) {
                const m = maint[j];
                const used = Math.max(0, totalKm - (m.lastKm || 0));
                const left = m.every - used;
                const r = this.rows[j];
                r.kind = 'maint';
                r.idx = j;
                r.n = m.name;
                if (left <= 0) {
                    r.s = '¡Toca hoy! · Hecho';
                    r.bg = '#5c1d1a';
                    r.color = '#ffb4ab';
                    r.sub = '#f1f3f1';
                } else if (left <= 30) {
                    r.s = 'Faltan ' + left + ' km';
                    r.bg = '#2f2a20';
                    r.color = '#ffd27a';
                    r.sub = '#c4c7c5';
                } else {
                    r.s = 'En ' + left + ' km · Hecho';
                    r.bg = '#1d201f';
                    r.color = '#f1f3f1';
                    r.sub = '#9da39f';
                }
            }
            const r4 = this.rows[4];
            r4.kind = 'addkm';
            r4.n = '+10 km odómetro';
            r4.s = 'Total: ' + totalKm + ' km';
            r4.bg = '#1f2531';
            r4.color = '#a8c8ff';
            r4.sub = '#c4c7c5';

            const r5 = this.rows[5];
            r5.kind = 'ride';
            r5.n = 'Modo bici vivo';
            r5.s = 'Velocidad GPS y pulso';
            r5.bg = '#162722';
            r5.color = '#a6f2d1';
            r5.sub = '#c4c7c5';
        }
    },
    toggleTab() {
        tick();
        this.tab = 1 - this.tab;
        this.refresh();
    },
    tap(i) {
        const r = this.rows[i];
        if (!r) {
            return;
        }
        if (r.kind === 'signal') {
            tick();
            router.replace({ uri: 'pages/signal/signal' });
            return;
        }
        if (r.kind === 'ride') {
            tick();
            router.replace({ uri: 'pages/ride/ride' });
            return;
        }
        if (r.kind === 'check') {
            checks[r.idx] = !checks[r.idx];
            let all = true;
            for (let k = 0; k < 5; k++) { if (!checks[k]) { all = false; } }
            if (all) {
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            } else {
                tick();
            }
            this.refresh();
            return;
        }
        if (r.kind === 'maint') {
            maint[r.idx].lastKm = totalKm;
            save('bikecare', { maint: maint, odoBase: totalKm });
            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            this.refresh();
            return;
        }
        if (r.kind === 'addkm') {
            totalKm += 10;
            save('bikecare', { maint: maint, odoBase: totalKm });
            tick();
            this.refresh();
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

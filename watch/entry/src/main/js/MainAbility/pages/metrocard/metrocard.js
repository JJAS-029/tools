import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { FARES, defaultCard, cardTrips, applyTrip } from '../../common/metrodata.js';

let card = null;
const AMOUNTS = [];

export default {
    data: {
        balText: '$50',
        tripsText: '10 viajes Metro',
        picking: false,
        pickMode: 'add',
        pickBtn: 'Recargar',
        range: [],
        sel: 4,
        pickVal: 50,
        rows: []
    },
    onInit() {
        const rows = [];
        for (let i = 0; i < FARES.length; i++) {
            const f = FARES[i];
            rows.push({
                kind: 'trip',
                cost: f.cost,
                n: f.name + '  -$' + f.cost,
                s: 'Descontar viaje',
                bg: '#1d201f',
                color: '#f1f3f1',
                sub: '#9da39f'
            });
        }
        rows.push({
            kind: 'add',
            n: 'Recargar saldo',
            s: 'Sumar con corona',
            bg: '#80d5d0',
            color: '#003735',
            sub: '#204a48'
        });
        rows.push({
            kind: 'set',
            n: 'Ajustar saldo',
            s: 'Poner monto exacto',
            bg: '#2f2a20',
            color: '#ffd27a',
            sub: '#a9a4ad'
        });
        this.rows = rows;

        AMOUNTS.length = 0;
        const r = [];
        for (let a = 5; a <= 500; a += 5) {
            AMOUNTS.push(a);
            r.push('$' + a);
        }
        this.range = r;

        load('micard', defaultCard(), (c) => {
            card = c;
            this.refresh();
        });
    },
    onShow() {
        focusCrown(this.picking ? this.$refs.wheel : this.$refs.list);
    },
    refresh() {
        const bal = Number(card.balance) || 0;
        const t = cardTrips(bal, 5);
        this.balText = '$' + bal;
        this.tripsText = t + (t === 1 ? ' viaje' : ' viajes') + ' Metro';
    },
    tap(i) {
        const r = this.rows[i];
        if (!r || !card) {
            return;
        }
        if (r.kind === 'trip') {
            applyTrip(card, r.cost);
            save('micard', card);
            if (card.balance <= 10) {
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            } else {
                tick();
            }
            this.refresh();
            return;
        }
        tick();
        this.pickMode = r.kind;
        this.pickBtn = r.kind === 'add' ? 'Recargar' : 'Guardar';
        this.sel = r.kind === 'add' ? 9 : Math.max(0, Math.min(AMOUNTS.length - 1, Math.round(card.balance / 5) - 1));
        this.pickVal = AMOUNTS[this.sel];
        this.picking = true;
        focusCrown(this.$refs.wheel);
    },
    onPick(e) {
        const i = e.newSelected !== undefined ? Number(e.newSelected) : this.sel;
        if (i >= 0 && i < AMOUNTS.length) {
            this.pickVal = AMOUNTS[i];
        }
        tick();
    },
    confirmTopup() {
        if (!card) {
            return;
        }
        if (this.pickMode === 'add') {
            card.balance = Math.min(500, (Number(card.balance) || 0) + this.pickVal);
        } else {
            card.balance = this.pickVal;
        }
        save('micard', card);
        try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        this.picking = false;
        this.refresh();
        focusCrown(this.$refs.list);
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            if (this.picking) {
                this.picking = false;
                focusCrown(this.$refs.list);
            } else {
                router.replace({ uri: 'pages/metro/metro' });
            }
        }
    }
};

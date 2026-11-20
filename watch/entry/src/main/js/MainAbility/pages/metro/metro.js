import router from '@system.router';
import { tick, focusCrown } from '../../common/haptics.js';
import { load } from '../../common/store.js';
import { LINES, defaultCard, cardTrips } from '../../common/metrodata.js';

const IMG = '/common/images/';

export default {
    data: {
        rows: []
    },
    onInit() {
        const rows = [
            {
                kind: 'card',
                icon: IMG + 'mi_card.png',
                n: 'Tarjeta MI',
                s: '$50 · 10 viajes',
                bg: '#162722',
                color: '#a6f2d1',
                sub: '#c4c7c5'
            }
        ];
        for (let i = 0; i < LINES.length; i++) {
            const ln = LINES[i];
            rows.push({
                kind: 'line',
                id: ln.id,
                icon: IMG + 'ml_' + ln.id + '.png',
                n: ln.name,
                s: ln.s[0] + ' – ' + ln.s[ln.s.length - 1],
                bg: '#1d201f',
                color: '#f1f3f1',
                sub: '#9da39f'
            });
        }
        this.rows = rows;
        this.refreshCard();
    },
    onShow() {
        focusCrown(this.$refs.list);
        this.refreshCard();
    },
    refreshCard() {
        load('micard', defaultCard(), (c) => {
            const bal = Number(c.balance) || 0;
            const trips = cardTrips(bal, 5);
            const r = this.rows[0];
            r.n = '$' + bal + ' · MI';
            r.s = trips + (trips === 1 ? ' viaje' : ' viajes') + ' Metro';
        });
    },
    tap(i) {
        const r = this.rows[i];
        if (!r) {
            return;
        }
        tick();
        if (r.kind === 'card') {
            router.replace({ uri: 'pages/metrocard/metrocard' });
        } else {
            router.replace({ uri: 'pages/metroline/metroline', params: { lineId: r.id } });
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

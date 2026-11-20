import router from '@system.router';
import bridge from '../../common/bridge.js';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { UNITS, defaultUnitCfg } from '../../common/unitcalc.js';

const IMG = '/common/images/';

export default {
    data: {
        rows: []
    },
    onInit() {
        const rows = [];
        for (let i = 0; i < UNITS.length; i++) {
            const u = UNITS[i];
            rows.push({
                kind: 'unit',
                id: u.id,
                icon: IMG + 'uc_' + u.id + '.png',
                n: u.a + ' ↔ ' + u.b,
                s: u.name,
                bg: '#1d201f',
                color: '#f1f3f1',
                sub: '#9da39f'
            });
        }
        rows.push({
            kind: 'rate',
            id: 'rate',
            icon: IMG + 'w_rate.png',
            n: 'Dólar $20.00',
            s: 'Editar cambio',
            bg: '#2f2a20',
            color: '#ffd27a',
            sub: '#a9a4ad'
        });
        this.rows = rows;
        this.refreshRate();
        bridge.on('fx.rate', (d) => {
            const r = Number(d.usd);
            if (r > 5 && r < 100) {
                save('unitcfg', { usdRate: r });
                this.applyRate(r);
            }
        });
        bridge.send('fx.get');
    },
    onDestroy() {
        bridge.off('fx.rate');
    },
    onShow() {
        focusCrown(this.$refs.list);
        this.refreshRate();
    },
    applyRate(rate) {
        this.rows[0].s = '1 USD = $' + rate.toFixed(2);
        this.rows[this.rows.length - 1].n = 'Dólar $' + rate.toFixed(2);
    },
    refreshRate() {
        load('unitcfg', defaultUnitCfg(), (cfg) => {
            this.applyRate(Number(cfg.usdRate) || 20.0);
        });
    },
    tap(i) {
        const r = this.rows[i];
        if (!r) {
            return;
        }
        tick();
        if (r.kind === 'rate') {
            router.replace({ uri: 'pages/unitconv/unitconv', params: { mode: 'rate' } });
        } else {
            router.replace({ uri: 'pages/unitconv/unitconv', params: { mode: 'conv', unitId: r.id } });
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

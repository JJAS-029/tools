import router from '@system.router';
import bridge from '../../common/bridge.js';
import { tick } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';

// Local starter slots; with Wear Engine the phone syncs real QR items into storage ('qrs').
const DEFAULT_QRS = [
    { label: 'Mi WhatsApp ⇄', value: 'https://wa.me/5215500000000', sub: '1/3 · Toca para cambiar' },
    { label: 'Mi CLABE ⇄', value: 'CLABE:000000000000000000', sub: '2/3 · Edita desde el cel' },
    { label: 'JJAS Tools ⇄', value: 'https://github.com/JJAS-029/tools', sub: '3/3 · Proyecto' }
];

let items = DEFAULT_QRS;

export default {
    data: {
        idx: 0,
        label: 'Mi WhatsApp ⇄',
        qrValue: 'https://wa.me/5215500000000',
        subText: '1/3 · Toca para cambiar'
    },
    onInit() {
        load('qrs', DEFAULT_QRS, (list) => {
            if (list && list.length > 0) {
                items = list;
            }
            this.idx = 0;
            this.refresh();
        });
        bridge.on('qr.list', (list) => {
            if (list && list.length > 0) {
                items = list;
                save('qrs', items);
                this.idx = 0;
                this.refresh();
            }
        });
    },
    onDestroy() {
        bridge.off('qr.list');
    },
    refresh() {
        const it = items[this.idx] || DEFAULT_QRS[0];
        this.label = it.label;
        this.qrValue = it.value;
        this.subText = it.sub || ((this.idx + 1) + '/' + items.length + ' · Toca para cambiar');
    },
    nextQr() {
        tick();
        this.idx = (this.idx + 1) % items.length;
        this.refresh();
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

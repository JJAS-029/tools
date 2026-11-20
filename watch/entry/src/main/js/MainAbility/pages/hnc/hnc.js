import router from '@system.router';
import { tick } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { HOLOGRAMS, defaultHnc, hncStatus } from '../../common/hnccalc.js';

let cfg = defaultHnc();

export default {
    data: {
        digit: 1,
        holo: '0',
        heroBg: '#162722',
        heroCol: '#a6f2d1',
        titleText: 'Sí circulas',
        reasonText: 'Holo 0 · Diario',
        stickerText: 'Verde · Jueves',
        stickerHex: '#66bb6a'
    },
    onInit() {
        load('hnc', defaultHnc(), (c) => {
            if (c) {
                cfg = c;
            }
            this.refresh();
        });
    },
    refresh() {
        const now = new Date().getTime();
        const st = hncStatus(cfg, now);
        this.digit = cfg.digit;
        this.holo = cfg.holo;
        this.heroBg = st.ok ? '#162722' : '#5c1d1a';
        this.heroCol = st.ok ? '#a6f2d1' : '#ffb4ab';
        this.titleText = st.title;
        this.reasonText = st.reason;
        this.stickerText = st.sticker.colorName + ' · ' + st.sticker.dayName;
        this.stickerHex = st.sticker.hex;
    },
    nextDigit() {
        tick();
        cfg.digit = (Number(cfg.digit) + 1) % 10;
        save('hnc', cfg);
        this.refresh();
    },
    nextHolo() {
        tick();
        const idx = HOLOGRAMS.indexOf('' + cfg.holo);
        cfg.holo = HOLOGRAMS[(idx + 1) % HOLOGRAMS.length];
        save('hnc', cfg);
        this.refresh();
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick } from '../../common/haptics.js';

const MODES = [
    {
        name: 'Dado ⇄', btn: 'Tirar',
        accent: '#ffb0cd', on: '#5e1133', bg: '#33202a',
        items: ['1', '2', '3', '4', '5', '6']
    },
    {
        name: 'Moneda ⇄', btn: 'Lanzar',
        accent: '#ffd27a', on: '#402d00', bg: '#2f2a20',
        items: ['Águila', 'Sol']
    },
    {
        name: '¿Cenar? ⇄', btn: 'Girar',
        accent: '#a6f2d1', on: '#003826', bg: '#162722',
        items: ['Tacos', 'Pizza', 'Sushi', 'Burgers', 'Pozole', 'Tortas', 'Alitas', 'Ramen']
    },
    {
        name: 'Sí / No ⇄', btn: 'Decidir',
        accent: '#d0bcff', on: '#381e72', bg: '#2b2633',
        items: ['¡Sí!', 'No', 'Tal vez', '¡Dale!']
    }
];

export default {
    data: {
        modeIdx: 0,
        rolling: false,
        modeText: 'Dado ⇄',
        btnText: 'Tirar',
        chipBg: '#33202a',
        accent: '#ffb0cd',
        onAccent: '#5e1133',
        orbBg: '#1d201f',
        orbCol: '#f1f3f1',
        subCol: '#9da39f',
        resText: '?',
        subText: 'Toca para tirar'
    },
    onInit() {
        this.timer = null;
        this.applyMode();
    },
    onDestroy() {
        this.stopAnim();
    },
    stopAnim() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.rolling = false;
    },
    applyMode() {
        const m = MODES[this.modeIdx];
        this.modeText = m.name;
        this.btnText = m.btn;
        this.chipBg = m.bg;
        this.accent = m.accent;
        this.onAccent = m.on;
        this.orbBg = '#1d201f';
        this.orbCol = m.accent;
        this.subCol = '#9da39f';
        this.resText = '?';
        this.subText = 'Toca para girar';
    },
    nextMode() {
        this.stopAnim();
        tick();
        this.modeIdx = (this.modeIdx + 1) % MODES.length;
        this.applyMode();
    },
    roll() {
        if (this.rolling) {
            return;
        }
        const m = MODES[this.modeIdx];
        this.rolling = true;
        this.orbBg = m.bg;
        this.subText = 'Girando...';
        let step = 0;
        const total = 7;
        this.timer = setInterval(() => {
            const pick = m.items[Math.floor(Math.random() * m.items.length)];
            this.resText = pick;
            step++;
            if (step >= total) {
                this.stopAnim();
                this.subText = 'Listo';
                this.subCol = m.accent;
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            } else {
                tick();
            }
        }, 90);
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

import router from '@system.router';
import { tick } from '../../common/haptics.js';

const AMBER = '#ff9100';
const RED = '#ff3b30';
const DARK = '#141414';
const OFF_BTN = '#1d201f';

export default {
    data: {
        mode: 'off', // 'off' | 'left' | 'right' | 'hazard'
        lit: false,
        lampBg: DARK,
        lampCol: '#9da39f',
        glyph: '◀  ▶',
        label: 'Toca un lado',
        leftBg: OFF_BTN, leftCol: '#f1f3f1',
        rightBg: OFF_BTN, rightCol: '#f1f3f1'
    },
    onInit() {
        this.blinker = null;
    },
    onDestroy() {
        this.stopBlink();
    },
    stopBlink() {
        if (this.blinker) {
            clearInterval(this.blinker);
            this.blinker = null;
        }
    },
    setDir(m) {
        tick();
        if (this.mode === m) {
            this.mode = 'off';
        } else {
            this.mode = m;
        }
        this.apply();
    },
    toggleHazard() {
        this.setDir(this.mode === 'hazard' ? 'off' : 'hazard');
    },
    apply() {
        this.stopBlink();
        this.leftBg = this.mode === 'left' ? AMBER : OFF_BTN;
        this.leftCol = this.mode === 'left' ? '#000000' : '#f1f3f1';
        this.rightBg = this.mode === 'right' ? AMBER : OFF_BTN;
        this.rightCol = this.mode === 'right' ? '#000000' : '#f1f3f1';

        if (this.mode === 'off') {
            this.lit = false;
            this.lampBg = DARK;
            this.lampCol = '#9da39f';
            this.glyph = '◀  ▶';
            this.label = 'Toca un lado';
            return;
        }
        this.lit = true;
        this.renderLamp();
        this.blinker = setInterval(() => {
            this.lit = !this.lit;
            this.renderLamp();
        }, 400);
    },
    renderLamp() {
        const col = this.mode === 'hazard' ? RED : AMBER;
        if (this.mode === 'left') {
            this.glyph = '◀◀◀';
            this.label = 'IZQUIERDA';
        } else if (this.mode === 'right') {
            this.glyph = '▶▶▶';
            this.label = 'DERECHA';
        } else {
            this.glyph = '▲  ▲';
            this.label = 'PREVENTIVAS';
        }
        this.lampBg = this.lit ? col : DARK;
        this.lampCol = this.lit ? '#000000' : col;
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/bikecare/bikecare' });
        }
    }
};

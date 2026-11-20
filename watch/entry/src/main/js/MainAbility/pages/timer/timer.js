import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick } from '../../common/haptics.js';
import { drawWavyRing } from '../../common/wavyring.js';

let wavePhase = 0;

const PRESETS = [
    { name: 'Pomodoro ⇄', work: 25 * 60, rest: 5 * 60, rounds: 4 },
    { name: 'HIIT 30/15 ⇄', work: 30, rest: 15, rounds: 8 },
    { name: 'HIIT 45/15 ⇄', work: 45, rest: 15, rounds: 8 },
    { name: 'Estirar ⇄', work: 40, rest: 10, rounds: 6 }
];

function fmt(secs) {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
}

export default {
    data: {
        presetIdx: 0,
        running: false,
        resting: false,
        round: 1,
        left: 25 * 60,
        pct: 100,
        presetText: 'Pomodoro ⇄',
        clockText: '25:00',
        phaseText: 'Foco 1/4',
        goText: 'Iniciar',
        accent: '#ffb4a8',
        onAccent: '#561e15',
        chipBg: '#33201d'
    },
    onInit() {
        this.ticker = null;
        this.loadPreset();
    },
    onShow() {
        this.drawRing();
        setTimeout(() => { this.drawRing(); }, 80);
    },
    onDestroy() {
        this.stopTick();
    },
    drawRing() {
        drawWavyRing(this, 'ring', {
            w: 210, h: 180, cy: 96, r: 78,
            pct: this.pct, color: this.accent, track: this.chipBg, phase: wavePhase
        });
    },
    stopTick() {
        if (this.ticker) {
            clearInterval(this.ticker);
            this.ticker = null;
        }
        this.running = false;
    },
    loadPreset() {
        this.stopTick();
        const p = PRESETS[this.presetIdx];
        this.resting = false;
        this.round = 1;
        this.left = p.work;
        this.presetText = p.name;
        this.refresh();
    },
    refresh() {
        const p = PRESETS[this.presetIdx];
        const total = this.resting ? p.rest : p.work;
        this.pct = total > 0 ? Math.round((this.left / total) * 100) : 0;
        this.clockText = fmt(this.left);
        this.phaseText = (this.resting ? 'Pausa ' : 'Foco ') + this.round + '/' + p.rounds;
        this.goText = this.running ? 'Pausar' : 'Iniciar';
        if (this.resting) {
            this.accent = '#a6f2d1';
            this.onAccent = '#003826';
            this.chipBg = '#162722';
        } else {
            this.accent = '#ffb4a8';
            this.onAccent = '#561e15';
            this.chipBg = '#33201d';
        }
        this.drawRing();
    },
    toggle() {
        tick();
        if (this.running) {
            this.stopTick();
            this.refresh();
            return;
        }
        this.running = true;
        this.refresh();
        this.ticker = setInterval(() => {
            this.left--;
            wavePhase += 0.65;
            if (this.left <= 0) {
                this.advancePhase();
            } else {
                this.refresh();
            }
        }, 1000);
    },
    advancePhase() {
        const p = PRESETS[this.presetIdx];
        if (!this.resting) {
            // Work -> Rest: long buzz
            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            this.resting = true;
            this.left = p.rest;
        } else {
            // Rest -> Next work round (or finished): double short buzz
            if (this.round >= p.rounds) {
                this.stopTick();
                this.resting = false;
                this.round = 1;
                this.left = p.work;
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            } else {
                this.round++;
                this.resting = false;
                this.left = p.work;
                tick();
                setTimeout(() => { tick(); }, 180);
            }
        }
        this.refresh();
    },
    reset() {
        tick();
        this.loadPreset();
    },
    nextPreset() {
        tick();
        this.presetIdx = (this.presetIdx + 1) % PRESETS.length;
        this.loadPreset();
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

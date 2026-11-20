import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';

const DIM = ['#2b2633', '#162722', '#2f2a20', '#4a1b2e'];
const LIT = ['#d0bcff', '#a6f2d1', '#ffd27a', '#ffb0cd'];

let seq = [];
let step = 0;
let best = 0;

export default {
    data: {
        playing: false,
        showing: false,
        headerText: 'Máx 0',
        btnText: 'Jugar',
        bg0: DIM[0],
        bg1: DIM[1],
        bg2: DIM[2],
        bg3: DIM[3]
    },
    onInit() {
        this.timers = [];
        load('simon', { best: 0 }, (s) => {
            best = (s && Number(s.best)) || 0;
            this.headerText = 'Máx ' + best;
        });
    },
    onDestroy() {
        this.clearTimers();
    },
    clearTimers() {
        for (let i = 0; i < this.timers.length; i++) {
            clearTimeout(this.timers[i]);
        }
        this.timers = [];
    },
    setPad(idx, on) {
        const col = on ? LIT[idx] : DIM[idx];
        if (idx === 0) { this.bg0 = col; }
        else if (idx === 1) { this.bg1 = col; }
        else if (idx === 2) { this.bg2 = col; }
        else if (idx === 3) { this.bg3 = col; }
    },
    allDim() {
        this.bg0 = DIM[0]; this.bg1 = DIM[1]; this.bg2 = DIM[2]; this.bg3 = DIM[3];
    },
    startGame() {
        this.clearTimers();
        seq = [];
        step = 0;
        this.playing = true;
        this.btnText = 'Reiniciar';
        this.nextRound();
    },
    nextRound() {
        seq.push(Math.floor(Math.random() * 4));
        step = 0;
        this.showing = true;
        this.headerText = 'Niv ' + seq.length + ' · Mira';
        this.allDim();

        let t = 350;
        for (let i = 0; i < seq.length; i++) {
            const p = seq[i];
            this.timers.push(setTimeout(() => {
                this.setPad(p, true);
                tick();
            }, t));
            this.timers.push(setTimeout(() => {
                this.setPad(p, false);
            }, t + 360));
            t += 520;
        }
        this.timers.push(setTimeout(() => {
            this.showing = false;
            this.headerText = 'Niv ' + seq.length + ' · ¡Tú!';
        }, t));
    },
    press(idx) {
        if (!this.playing || this.showing) {
            return;
        }
        this.setPad(idx, true);
        this.timers.push(setTimeout(() => { this.setPad(idx, false); }, 200));

        if (idx !== seq[step]) {
            this.playing = false;
            const score = Math.max(0, seq.length - 1);
            if (score > best) {
                best = score;
                save('simon', { best: best });
            }
            this.headerText = 'Fin ' + score + ' · Máx ' + best;
            this.btnText = 'Otra vez';
            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            return;
        }
        tick();
        step++;
        if (step >= seq.length) {
            if (seq.length > best) {
                best = seq.length;
                save('simon', { best: best });
            }
            this.showing = true;
            this.headerText = '¡Bien! Nivel ' + seq.length;
            this.timers.push(setTimeout(() => { this.nextRound(); }, 700));
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

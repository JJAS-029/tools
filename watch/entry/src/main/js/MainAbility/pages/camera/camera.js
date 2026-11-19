import router from '@system.router';
import vibrator from '@system.vibrator';
import bridge from '../../common/bridge.js';
import { tick, focusCrown, crownSteps } from '../../common/haptics.js';

const IMG = '/common/images/';
const TIMERS = [0, 3, 10];
const WHITE = '#f1f3f1';
const BLUE = '#b4ccff';
const RED = '#ffb4ab';

export default {
    data: {
        chip: 'Cámara',
        status: 'Abriendo...',
        statusColor: WHITE,
        shutterIcon: IMG + 'shutter.png',
        timerIdx: 0,
        timerText: 'No',
        sideText: 'Atrás',
        busy: false
    },
    onInit() {
        bridge.on('cam.state', (s) => {
            if (s.open) {
                this.sideText = s.front ? 'Frente' : 'Atrás';
                if (!this.busy) {
                    this.setStatus('Lista', WHITE);
                }
            } else {
                this.setBusy(false);
                this.setStatus('Cerrada', WHITE);
            }
        });
        bridge.on('cam.count', (d) => {
            this.setStatus(d.s + '...', BLUE);
            tick();
        });
        bridge.on('cam.result', (r) => {
            this.setBusy(false);
            if (r.ok) {
                this.setStatus('¡Foto guardada!', BLUE);
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            } else {
                this.setStatus(r.msg || 'Error', RED);
            }
        });
        bridge.send('cam.open');
    },
    onShow() {
        // The crown changes the timer.
        focusCrown(this.$refs.page);
    },
    onDestroy() {
        bridge.off('cam.state');
        bridge.off('cam.count');
        bridge.off('cam.result');
        bridge.send('cam.close');
    },
    setStatus(text, color) {
        this.status = text;
        this.statusColor = color;
    },
    setBusy(b) {
        this.busy = b;
        this.shutterIcon = IMG + (b ? 'shutter_busy.png' : 'shutter.png');
    },
    shoot() {
        if (this.busy) {
            return;
        }
        tick();
        this.setBusy(true);
        const t = TIMERS[this.timerIdx];
        this.setStatus(t > 0 ? t + '...' : 'Disparando...', BLUE);
        bridge.send('cam.shoot', { timer: t });
    },
    setTimer(idx) {
        this.timerIdx = idx;
        const t = TIMERS[idx];
        this.timerText = t === 0 ? 'No' : t + ' s';
    },
    cycleTimer() {
        tick();
        this.setTimer((this.timerIdx + 1) % TIMERS.length);
    },
    onCrown(e) {
        const steps = crownSteps(e);
        if (steps !== 0) {
            tick();
            const n = TIMERS.length;
            this.setTimer(((this.timerIdx + steps) % n + n) % n);
        }
    },
    flip() {
        if (this.busy) {
            return;
        }
        tick();
        bridge.send('cam.flip');
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

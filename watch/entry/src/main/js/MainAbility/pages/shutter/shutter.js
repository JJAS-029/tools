import router from '@system.router';
import sensor from '@system.sensor';
import vibrator from '@system.vibrator';
import bridge from '../../common/bridge.js';
import { tick } from '../../common/haptics.js';

let lastShake = 0;

const IMG = '/common/images/';
const TIMERS = [0, 3, 10];
const WHITE = '#f1f3f1';
const BLUE = '#b4ccff';
const RED = '#ffb4ab';
const CHIP_PHOTO = '#1b2d52';
const CHIP_VIDEO = '#5c1d1a';

function clock(s) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
}

export default {
    data: {
        chip: 'Foto',
        chipBg: CHIP_PHOTO,
        chipColor: BLUE,
        status: 'Abriendo...',
        statusColor: WHITE,
        shutterIcon: IMG + 'shutter.png',
        timerIdx: 0,
        timerText: 'No',
        sideText: 'Atrás',
        busy: false,
        video: false,
        recording: false,
        recSecs: 0
    },
    onInit() {
        this.ticker = null;
        bridge.on('cam.state', (s) => {
            if (s.open) {
                this.sideText = s.front ? 'Frente' : 'Atrás';
                if (s.mode && !this.recording) {
                    this.setVideo(s.mode === 'video');
                }
                if (!this.busy && !this.recording) {
                    this.setStatus('Lista', WHITE);
                }
            } else {
                this.stopClock();
                this.recording = false;
                this.setBusy(false);
                this.setStatus('Cerrada', WHITE);
            }
        });
        bridge.on('cam.count', (d) => {
            this.setStatus(d.s + '...', this.video ? RED : BLUE);
            tick();
        });
        bridge.on('cam.rec.state', (d) => {
            if (d.on) {
                this.recording = true;
                this.busy = false;
                this.startClock();
                try { vibrator.vibrate({ mode: 'short' }); } catch (e) {}
            } else {
                this.stopClock();
                this.recording = false;
                if (this.busy) {
                    // Timer cancelled before recording started
                    this.busy = false;
                    this.setStatus('Lista', WHITE);
                }
            }
            this.refreshShutter();
        });
        bridge.on('cam.result', (r) => {
            this.setBusy(false);
            if (r.ok) {
                this.setStatus(r.video ? '¡Video guardado!' : '¡Foto guardada!', BLUE);
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            } else {
                this.setStatus(r.msg || 'Error', RED);
            }
        });
        bridge.send('cam.open');
        // Shake-to-shoot gesture using accelerometer (while screen is open)
        try {
            sensor.subscribeAccelerometer({
                interval: 'normal',
                success: (d) => {
                    const mag = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z);
                    const now = new Date().getTime();
                    if (mag > 22 && now - lastShake > 2500 && !this.busy) {
                        lastShake = now;
                        this.shoot();
                    }
                },
                fail: () => {}
            });
        } catch (e) {}
    },
    onDestroy() {
        this.stopClock();
        try { sensor.unsubscribeAccelerometer(); } catch (e) {}
        bridge.off('cam.state');
        bridge.off('cam.count');
        bridge.off('cam.rec.state');
        bridge.off('cam.result');
        // If a video is recording, the phone saves it before closing.
        bridge.send('cam.close');
    },
    setStatus(text, color) {
        this.status = text;
        this.statusColor = color;
    },
    refreshShutter() {
        let name = 'shutter';
        if (this.video) {
            name = this.recording ? 'rec_stop' : (this.busy ? 'rec_busy' : 'rec');
        } else if (this.busy) {
            name = 'shutter_busy';
        }
        this.shutterIcon = IMG + name + '.png';
    },
    setBusy(b) {
        this.busy = b;
        this.refreshShutter();
    },
    setVideo(v) {
        this.video = v;
        this.chip = v ? 'Video' : 'Foto';
        this.chipBg = v ? CHIP_VIDEO : CHIP_PHOTO;
        this.chipColor = v ? RED : BLUE;
        this.refreshShutter();
    },
    toggleMode() {
        if (this.busy || this.recording) {
            return;
        }
        tick();
        this.setVideo(!this.video);
        bridge.send('cam.mode', { m: this.video ? 'video' : 'photo' });
    },
    startClock() {
        this.stopClock();
        this.recSecs = 0;
        this.setStatus('REC ' + clock(0), RED);
        this.ticker = setInterval(() => {
            this.recSecs++;
            this.setStatus('REC ' + clock(this.recSecs), RED);
        }, 1000);
    },
    stopClock() {
        if (this.ticker) {
            clearInterval(this.ticker);
            this.ticker = null;
        }
    },
    shoot() {
        const t = TIMERS[this.timerIdx];
        if (this.video) {
            if (this.recording || this.busy) {
                // Stop the video (or cancel the timer)
                tick();
                if (this.recording) {
                    this.setStatus('Guardando...', BLUE);
                }
                bridge.send('cam.rec', { a: 'stop' });
                return;
            }
            tick();
            this.setBusy(true);
            this.setStatus(t > 0 ? t + '...' : 'Iniciando...', RED);
            bridge.send('cam.rec', { a: 'start', timer: t });
            return;
        }
        if (this.busy) {
            return;
        }
        tick();
        this.setBusy(true);
        this.setStatus(t > 0 ? t + '...' : 'Disparando...', BLUE);
        bridge.send('cam.shoot', { timer: t });
    },
    setTimer(idx) {
        this.timerIdx = idx;
        const t = TIMERS[idx];
        this.timerText = t === 0 ? 'No' : t + ' s';
    },
    cycleTimer() {
        if (this.recording) {
            return;
        }
        tick();
        this.setTimer((this.timerIdx + 1) % TIMERS.length);
    },
    flip() {
        if (this.busy || this.recording) {
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

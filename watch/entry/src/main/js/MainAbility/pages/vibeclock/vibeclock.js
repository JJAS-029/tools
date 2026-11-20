import router from '@system.router';
import vibrator from '@system.vibrator';

function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
}

export default {
    data: {
        busy: false,
        clockText: '00:00',
        pulseText: 'Toca para vibrar',
        orbBg: '#1d201f'
    },
    onInit() {
        this.timers = [];
        this.updateClock();
    },
    onDestroy() {
        this.clearAll();
    },
    clearAll() {
        for (let i = 0; i < this.timers.length; i++) {
            clearTimeout(this.timers[i]);
        }
        this.timers = [];
        this.busy = false;
    },
    updateClock() {
        const d = new Date();
        this.clockText = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    },
    buzzTime() {
        if (this.busy) {
            return;
        }
        this.clearAll();
        const d = new Date();
        const h12 = d.getHours() % 12 || 12;
        const quarters = Math.floor(d.getMinutes() / 15); // 0..3
        this.clockText = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
        this.busy = true;
        this.orbBg = '#2b2633';

        // Schedule: h12 long pulses, pause, quarters short pulses
        let t = 0;
        for (let i = 0; i < h12; i++) {
            const num = i + 1;
            this.timers.push(setTimeout(() => {
                this.pulseText = 'Hora ' + num + '/' + h12;
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            }, t));
            t += 520;
        }
        t += 450;
        if (quarters === 0) {
            this.timers.push(setTimeout(() => {
                this.pulseText = 'En punto';
            }, t));
        } else {
            for (let q = 0; q < quarters; q++) {
                const qn = q + 1;
                this.timers.push(setTimeout(() => {
                    this.pulseText = ':' + (qn * 15);
                    try { vibrator.vibrate({ mode: 'short' }); } catch (e) {}
                }, t));
                t += 320;
            }
        }
        this.timers.push(setTimeout(() => {
            this.busy = false;
            this.orbBg = '#1d201f';
            this.pulseText = 'Toca para repetir';
        }, t + 300));
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

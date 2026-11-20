import router from '@system.router';
import sensor from '@system.sensor';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';
import { defaultBike } from '../../common/battcalc.js';
import {
    defaultKoala, tickKoala, syncSteps, syncBikeTrips,
    actFeed, actPlay, actPet, actToggleSleep, koalaMood
} from '../../common/koalacalc.js';

const IMG = '/common/images/';
let koala = null;
let frame = 0;

export default {
    data: {
        sprite: IMG + 'ko_idle_0.png',
        moodText: 'Cargando...',
        food: 80,
        mood: 80,
        energy: 80,
        rows: []
    },
    onInit() {
        this.anim = null;
        this.rows = [
            { kind: 'feed', n: 'Comer', s: '+25 saciedad', bg: '#162722', color: '#a6f2d1', sub: '#c4c7c5' },
            { kind: 'play', n: 'Jugar', s: '+25 ánimo', bg: '#33202a', color: '#ffb0cd', sub: '#c4c7c5' },
            { kind: 'pet', n: 'Mimar', s: '+15 ánimo', bg: '#2b2633', color: '#d0bcff', sub: '#c4c7c5' },
            { kind: 'sleep', n: 'Dormir', s: 'Recarga energía', bg: '#1f2531', color: '#a8c8ff', sub: '#c4c7c5' }
        ];

        const now = new Date().getTime();
        load('koala', defaultKoala(now), (k) => {
            koala = tickKoala(k || defaultKoala(now), now);
            // Sync bike trips from Baterías
            load('bike', defaultBike(), (b) => {
                if (b && b.trips) {
                    const gained = syncBikeTrips(koala, b.trips.length);
                    if (gained > 0) {
                        this.moodText = '¡Feliz por tu bici!';
                    }
                }
                save('koala', koala);
                this.refresh();
                this.startAnim();
            });
            this.readSteps();
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
        if (koala) {
            tickKoala(koala, new Date().getTime());
            this.refresh();
            this.startAnim();
        }
    },
    onHide() {
        this.stopAnim();
    },
    onDestroy() {
        this.stopAnim();
        try { sensor.unsubscribeStepCounter(); } catch (e) {}
    },
    readSteps() {
        try {
            sensor.subscribeStepCounter({
                success: (d) => {
                    if (koala && d && d.steps !== undefined) {
                        const gained = syncSteps(koala, d.steps);
                        if (gained > 0) {
                            save('koala', koala);
                            this.refresh();
                        }
                    }
                },
                fail: () => {}
            });
        } catch (e) {}
    },
    startAnim() {
        this.stopAnim();
        this.anim = setInterval(() => {
            frame = 1 - frame;
            this.updateSprite();
        }, 750);
    },
    stopAnim() {
        if (this.anim) {
            clearInterval(this.anim);
            this.anim = null;
        }
    },
    updateSprite() {
        if (!koala) {
            return;
        }
        const m = koalaMood(koala);
        if (m.pose === 'sleep') {
            this.sprite = IMG + (frame ? 'ko_sleep_1.png' : 'ko_sleep_0.png');
        } else if (m.pose === 'sad') {
            this.sprite = IMG + 'ko_sad.png';
        } else if (m.pose === 'happy') {
            this.sprite = IMG + (frame ? 'ko_happy_1.png' : 'ko_happy_0.png');
        } else {
            this.sprite = IMG + (frame ? 'ko_idle_1.png' : 'ko_idle_0.png');
        }
    },
    refresh() {
        if (!koala) {
            return;
        }
        this.food = koala.food;
        this.mood = koala.mood;
        this.energy = koala.energy;
        const m = koalaMood(koala);
        this.moodText = m.text;
        this.rows[0].s = 'Eucalipto · ' + (koala.leaves || 0) + ' hojas';
        this.rows[3].n = koala.sleeping ? 'Despertar' : 'Dormir';
        this.rows[3].s = koala.sleeping ? 'Cargando energía' : 'Recarga energía';
        this.updateSprite();
    },
    petQuick() {
        if (!koala) {
            return;
        }
        actPet(koala);
        save('koala', koala);
        tick();
        this.refresh();
    },
    tap(i) {
        const r = this.rows[i];
        if (!r || !koala) {
            return;
        }
        tickKoala(koala, new Date().getTime());
        if (r.kind === 'feed') {
            actFeed(koala);
            tick();
        } else if (r.kind === 'play') {
            actPlay(koala);
            tick();
        } else if (r.kind === 'pet') {
            actPet(koala);
            tick();
        } else if (r.kind === 'sleep') {
            actToggleSleep(koala);
            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        }
        save('koala', koala);
        this.refresh();
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick } from '../../common/haptics.js';

// Built-in English vocabulary deck; syncs with AnkiDroid once Wear Engine arrives.
const DECK = [
    { q: 'Thorough', a: 'Minucioso', ex: 'A thorough review' },
    { q: 'Wrap up', a: 'Concluir', ex: 'Let us wrap up' },
    { q: 'Figure out', a: 'Resolver', ex: 'Figure out the bug' },
    { q: 'Deadline', a: 'Fecha límite', ex: 'Before the deadline' },
    { q: 'Straightforward', a: 'Directo / fácil', ex: 'Quite straightforward' },
    { q: 'Catch up', a: 'Ponerse al día', ex: 'Catch up later' },
    { q: 'Trade-off', a: 'Compromiso', ex: 'Speed trade-off' },
    { q: 'Reliable', a: 'Confiable', ex: 'A reliable app' },
    { q: 'Hold on', a: 'Espera', ex: 'Hold on a sec' },
    { q: 'Reach out', a: 'Contactar', ex: 'Reach out to me' },
    { q: 'Carry out', a: 'Ejecutar', ex: 'Carry out a test' },
    { q: 'Feedback', a: 'Comentarios', ex: 'Great feedback' },
    { q: 'Seamless', a: 'Sin fricción', ex: 'Seamless sync' },
    { q: 'Overlook', a: 'Pasar por alto', ex: 'Easy to overlook' },
    { q: 'Workaround', a: 'Solución alt.', ex: 'Quick workaround' }
];

let queue = [];
let doneCount = 0;

export default {
    data: {
        flipped: false,
        progText: 'Anki 0/15',
        mainText: '',
        subText: '',
        cardBg: '#1d201f',
        cardCol: '#f1f3f1'
    },
    onInit() {
        this.resetDeck();
    },
    resetDeck() {
        queue = [];
        for (let i = 0; i < DECK.length; i++) {
            queue.push(i);
        }
        doneCount = 0;
        this.showTop();
    },
    showTop() {
        this.flipped = false;
        this.progText = 'Anki ' + doneCount + '/' + DECK.length;
        if (queue.length === 0) {
            this.cardBg = '#162722';
            this.cardCol = '#a6f2d1';
            this.mainText = '¡Mazo listo!';
            this.subText = 'Toca para repasar';
            return;
        }
        const c = DECK[queue[0]];
        this.cardBg = '#1d201f';
        this.cardCol = '#f1f3f1';
        this.mainText = c.q;
        this.subText = 'Inglés · Toca';
    },
    flip() {
        tick();
        if (queue.length === 0) {
            this.resetDeck();
            return;
        }
        if (this.flipped) {
            return;
        }
        const c = DECK[queue[0]];
        this.flipped = true;
        this.cardBg = '#1f2531';
        this.cardCol = '#a8c8ff';
        this.mainText = c.a;
        this.subText = c.ex;
    },
    grade(good) {
        if (queue.length === 0) {
            return;
        }
        const idx = queue.shift();
        if (good) {
            doneCount++;
            if (queue.length === 0) {
                try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            } else {
                tick();
            }
        } else {
            // Re-queue 3 cards later
            const pos = Math.min(queue.length, 3);
            queue.splice(pos, 0, idx);
            tick();
        }
        this.showTop();
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

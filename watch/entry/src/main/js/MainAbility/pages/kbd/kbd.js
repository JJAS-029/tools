import router from '@system.router';
import vibrator from '@system.vibrator';
import { tick, focusCrown } from '../../common/haptics.js';
import { load, save } from '../../common/store.js';

const CHARS = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' '
];

// Frequent Spanish work/daily words for crown autocomplete
const DICT = [
    'llamar', 'llegué', 'enviar', 'revisar', 'comprar', 'correo', 'junta',
    'hoy', 'mañana', 'tarde', 'casa', 'bici', 'trabajo', 'pagar', 'pendiente',
    'recordar', 'aviso', 'listo', 'hola', 'gracias', 'mamá', 'koala', 'agua',
    'cita', 'médico', 'banco', 'proyecto', 'código', 'nota', 'tarea', 'salir'
];

export default {
    data: {
        raw: '',
        text: 'Escribe...',
        curChar: 'a',
        sug0: 'llamar',
        sug1: 'enviar',
        range: [],
        sel: 0
    },
    onInit() {
        const r = [];
        for (let i = 0; i < CHARS.length; i++) {
            r.push(CHARS[i] === ' ' ? 'Espacio' : CHARS[i].toUpperCase());
        }
        this.range = r;
        this.updateSugs();
    },
    onShow() {
        focusCrown(this.$refs.wheel);
    },
    onPick(e) {
        const i = e.newSelected !== undefined ? Number(e.newSelected) : this.sel;
        if (i >= 0 && i < CHARS.length) {
            this.curChar = CHARS[i] === ' ' ? '␣' : CHARS[i].toUpperCase();
            this.sel = i;
        }
        tick();
    },
    currentPrefix() {
        const idx = this.raw.lastIndexOf(' ');
        return (idx === -1 ? this.raw : this.raw.slice(idx + 1)).toLowerCase();
    },
    updateSugs() {
        const pre = this.currentPrefix();
        const found = [];
        if (pre.length > 0) {
            for (let i = 0; i < DICT.length && found.length < 2; i++) {
                if (DICT[i].indexOf(pre) === 0 && DICT[i] !== pre) {
                    found.push(DICT[i]);
                }
            }
        }
        this.sug0 = found[0] || 'llamar';
        this.sug1 = found[1] || 'revisar';
        this.text = this.raw.length > 0 ? this.raw : 'Escribe...';
    },
    addChar() {
        tick();
        const ch = CHARS[this.sel] || 'a';
        if (this.raw.length < 40) {
            this.raw += ch;
        }
        this.updateSugs();
    },
    pickSug(idx) {
        tick();
        const word = idx === 0 ? this.sug0 : this.sug1;
        const sp = this.raw.lastIndexOf(' ');
        const head = sp === -1 ? '' : this.raw.slice(0, sp + 1);
        this.raw = (head + word + ' ').slice(0, 42);
        this.updateSugs();
    },
    backspace() {
        if (this.raw.length > 0) {
            tick();
            this.raw = this.raw.slice(0, -1);
            this.updateSugs();
        }
    },
    clearText() {
        this.raw = '';
        try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
        this.updateSugs();
    },
    saveNote() {
        const clean = this.raw.trim();
        if (!clean) {
            return;
        }
        load('quicknotes', [], (list) => {
            const arr = list && list.length ? list : [];
            arr.unshift({ t: clean, ts: new Date().getTime() });
            if (arr.length > 10) { arr.pop(); }
            save('quicknotes', arr);
            try { vibrator.vibrate({ mode: 'long' }); } catch (e) {}
            this.raw = '';
            this.text = '¡Nota guardada!';
        });
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

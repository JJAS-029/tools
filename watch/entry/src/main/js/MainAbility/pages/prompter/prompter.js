import router from '@system.router';
import { tick, focusCrown } from '../../common/haptics.js';
import { load } from '../../common/store.js';

const DOCS = [
    {
        title: 'Notas reloj ⇄',
        lines: ['Tus notas del', 'teclado aparecen', 'aquí guardadas', 'al instante.']
    },
    {
        title: 'Demo pitch ⇄',
        lines: [
            'Hola a todos,',
            'hoy les muestro',
            'JJAS Tools para',
            'Huawei Watch Fit 3.',
            'Corre sin internet',
            'y se sincroniza',
            'con el teléfono',
            'por Bluetooth.',
            '¡Gracias!'
        ]
    },
    {
        title: 'Checklist ⇄',
        lines: [
            '1. Revisar llaves',
            '2. Cartera y MI',
            '3. Celular cargado',
            '4. Casco y luces',
            '5. Avisar salida'
        ]
    }
];

export default {
    data: {
        idx: 0,
        docTitle: 'Notas reloj ⇄',
        lines: []
    },
    onInit() {
        load('quicknotes', [], (notes) => {
            if (notes && notes.length > 0) {
                const arr = [];
                for (let i = 0; i < notes.length; i++) {
                    arr.push('• ' + notes[i].t);
                }
                DOCS[0].lines = arr;
            }
            this.loadDoc();
        });
    },
    onShow() {
        focusCrown(this.$refs.list);
    },
    loadDoc() {
        const d = DOCS[this.idx];
        this.docTitle = d.title;
        this.lines = d.lines;
    },
    nextDoc() {
        tick();
        this.idx = (this.idx + 1) % DOCS.length;
        this.loadDoc();
        focusCrown(this.$refs.list);
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

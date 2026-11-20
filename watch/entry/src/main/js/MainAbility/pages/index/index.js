import router from '@system.router';
import { tick, focusCrown } from '../../common/haptics.js';
import app from '@system.app';

const IMG = '/common/images/';

export default {
    onShow() {
        focusCrown(this.$refs.list);
    },
    data: {
        apps: [
            { name: 'Now Brief', sub: 'Resumen del día', icon: IMG + 't_brief.png', uri: 'pages/brief/brief' },
            { name: 'Música', sub: 'Reproduciendo', icon: IMG + 't_music.png', uri: 'pages/music/music' },
            { name: 'Playlists', sub: 'Spotify', icon: IMG + 't_list.png', uri: 'pages/playlists/playlists' },
            { name: 'Cámara', sub: 'Foto y video', icon: IMG + 't_camera.png', uri: 'pages/shutter/shutter' },
            { name: 'Baterías', sub: 'Bici y reloj', icon: IMG + 't_batt.png', uri: 'pages/battery/battery' },
            { name: 'Jornada', sub: 'Turno y pago', icon: IMG + 't_work.png', uri: 'pages/work/work' },
            { name: 'Metro', sub: 'CDMX y MI', icon: IMG + 't_metro.png', uri: 'pages/metro/metro' },
            { name: 'Lugares', sub: 'GPS y brújula', icon: IMG + 't_places.png', uri: 'pages/places/places' },
            { name: 'Unidades', sub: 'lb, °F, USD...', icon: IMG + 't_units.png', uri: 'pages/units/units' },
            { name: 'Contador', sub: 'Agua y reps', icon: IMG + 't_count.png', uri: 'pages/counter/counter' },
            { name: 'Propinas', sub: 'Dividir cuenta', icon: IMG + 't_tip.png', uri: 'pages/tip/tip' },
            { name: 'Decidir', sub: 'Dado y moneda', icon: IMG + 't_decide.png', uri: 'pages/decide/decide' },
            { name: 'No Circula', sub: 'CDMX', icon: IMG + 't_hnc.png', uri: 'pages/hnc/hnc' },
            { name: 'QR', sub: 'Cobro y contacto', icon: IMG + 't_qr.png', uri: 'pages/qr/qr' },
            { name: 'Navegar', sub: 'Pronto', icon: IMG + 't_nav.png', uri: '' },
            { name: 'Notas', sub: 'Pronto', icon: IMG + 't_notes.png', uri: '' },
            { name: 'Grabadora', sub: 'Pronto', icon: IMG + 't_mic.png', uri: '' }
        ]
    },
    open(idx) {
        const item = this.apps[idx];
        if (item && item.uri) {
            tick();
            router.replace({ uri: item.uri });
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            app.terminate();
        }
    }
};

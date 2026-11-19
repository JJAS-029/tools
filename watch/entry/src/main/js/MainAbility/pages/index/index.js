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
            { name: 'Música', sub: 'Reproduciendo', icon: IMG + 't_music.png', uri: 'pages/music/music' },
            { name: 'Playlists', sub: 'Spotify', icon: IMG + 't_list.png', uri: 'pages/playlists/playlists' },
            { name: 'Cámara', sub: 'Obturador', icon: IMG + 't_camera.png', uri: 'pages/camera/camera' },
            { name: 'QR', sub: 'Pronto', icon: IMG + 't_qr.png', uri: '' },
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

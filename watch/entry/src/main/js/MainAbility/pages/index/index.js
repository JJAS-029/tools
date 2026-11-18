import router from '@system.router';
import app from '@system.app';

const IMG = '/common/images/';

export default {
    data: {
        apps: [
            { name: 'Música', sub: 'Reproduciendo', color: '#1db954', icon: IMG + 'm_music.png', uri: 'pages/music/music' },
            { name: 'Playlists', sub: 'Spotify', color: '#14833b', icon: IMG + 'm_list.png', uri: 'pages/playlists/playlists' },
            { name: 'Cámara', sub: 'Pronto', color: '#3a7bfd', icon: IMG + 'm_camera.png', uri: '' },
            { name: 'QR', sub: 'Pronto', color: '#8e5cf6', icon: IMG + 'm_qr.png', uri: '' },
            { name: 'Navegar', sub: 'Pronto', color: '#f2994a', icon: IMG + 'm_nav.png', uri: '' },
            { name: 'Notas', sub: 'Pronto', color: '#f2c94c', icon: IMG + 'm_notes.png', uri: '' },
            { name: 'Grabadora', sub: 'Pronto', color: '#eb5757', icon: IMG + 'm_mic.png', uri: '' }
        ]
    },
    open(idx) {
        const item = this.apps[idx];
        if (item && item.uri) {
            router.replace({ uri: item.uri });
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            app.terminate();
        }
    }
};

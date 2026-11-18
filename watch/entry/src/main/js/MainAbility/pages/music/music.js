import router from '@system.router';
import bridge from '../../common/bridge.js';

const IMG = '/common/images/';

export default {
    data: {
        appName: 'Música',
        title: 'Conectando...',
        artist: '',
        playing: false,
        playIcon: IMG + 'play.png',
        percent: 0,
        volText: '--'
    },
    onInit() {
        bridge.on('media.state', (s) => this.applyState(s));
        bridge.send('media.get');
    },
    onDestroy() {
        bridge.off('media.state');
    },
    applyState(s) {
        this.appName = s.app || 'Música';
        this.title = s.title || 'Nada reproduciéndose';
        this.artist = s.artist || '';
        this.playing = !!s.playing;
        this.playIcon = IMG + (this.playing ? 'pause.png' : 'play.png');
        this.percent = s.dur > 0 ? Math.round((s.pos / s.dur) * 100) : 0;
        this.volText = (s.vol === undefined ? '--' : s.vol) + '%';
    },
    cmd(a) {
        bridge.send('media.cmd', { a: a });
    },
    toggle() {
        this.cmd(this.playing ? 'pause' : 'play');
    },
    prev() {
        this.cmd('prev');
    },
    next() {
        this.cmd('next');
    },
    volUp() {
        this.cmd('vol+');
    },
    volDown() {
        this.cmd('vol-');
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        } else if (e.direction === 'left') {
            router.replace({ uri: 'pages/playlists/playlists' });
        }
    }
};

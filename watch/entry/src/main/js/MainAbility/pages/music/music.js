import router from '@system.router';
import bridge from '../../common/bridge.js';
import { tick, focusCrown, crownSteps } from '../../common/haptics.js';

const IMG = '/common/images/';

export default {
    data: {
        appName: 'Música',
        title: 'Conectando...',
        artist: '',
        playing: false,
        playIcon: IMG + 'play_d.png',
        playRadius: 52,
        percent: 0,
        volText: '--'
    },
    onInit() {
        bridge.on('media.state', (s) => this.applyState(s));
        bridge.send('media.get');
    },
    onShow() {
        // The crown controls the volume on this screen.
        focusCrown(this.$refs.page);
    },
    onDestroy() {
        bridge.off('media.state');
    },
    onCrown(e) {
        const steps = crownSteps(e);
        if (steps !== 0) {
            tick();
            this.cmd(steps > 0 ? 'vol+' : 'vol-');
        }
    },
    applyState(s) {
        this.appName = s.app || 'Música';
        this.title = s.title || 'Nada reproduciéndose';
        this.artist = s.artist || '';
        this.playing = !!s.playing;
        this.playIcon = IMG + (this.playing ? 'pause_d.png' : 'play_d.png');
        // Shape morph: pill when paused, rounded square while playing.
        this.playRadius = this.playing ? 30 : 52;
        this.percent = s.dur > 0 ? Math.round((s.pos / s.dur) * 100) : 0;
        this.volText = (s.vol === undefined ? '--' : s.vol) + '%';
    },
    cmd(a) {
        bridge.send('media.cmd', { a: a });
    },
    press(a) {
        tick();
        this.cmd(a);
    },
    toggle() {
        this.press(this.playing ? 'pause' : 'play');
    },
    prev() {
        this.press('prev');
    },
    next() {
        this.press('next');
    },
    volUp() {
        this.press('vol+');
    },
    volDown() {
        this.press('vol-');
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        } else if (e.direction === 'left') {
            router.replace({ uri: 'pages/playlists/playlists' });
        }
    }
};

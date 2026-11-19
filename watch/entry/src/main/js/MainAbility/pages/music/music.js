import router from '@system.router';
import bridge from '../../common/bridge.js';
import { tick, focusCrown } from '../../common/haptics.js';
import { PALETTES, paletteIndex } from '../../common/palette.js';

const IMG = '/common/images/';
const TRACK_W = 280;

export default {
    data: {
        chipText: 'Música',
        title: 'Conectando...',
        artist: '',
        playing: false,
        pIdx: 0,
        pAccent: PALETTES[0].accent,
        pContainer: PALETTES[0].container,
        pSurface: PALETTES[0].surface,
        artIcon: IMG + 'art_0.png',
        playIcon: IMG + 'play_p0.png',
        playRadius: 52,
        fillWidth: 0,
        vol: 0
    },
    onInit() {
        bridge.on('media.state', (s) => this.applyState(s));
        bridge.send('media.get');
    },
    onShow() {
        // The crown moves the volume slider (lite: only list/slider/picker take the crown).
        focusCrown(this.$refs.vol);
    },
    onDestroy() {
        bridge.off('media.state');
    },
    onVol(e) {
        const v = Math.round(e.progress !== undefined ? e.progress : e.value);
        if (v === this.vol) {
            return;
        }
        this.vol = v;
        tick();
        bridge.send('media.cmd', { a: 'vol', v: v });
    },
    applyState(s) {
        this.title = s.title || 'Nada sonando';
        this.artist = s.artist || '';
        this.playing = !!s.playing;
        this.chipText = s.app || 'Música';

        // Dynamic color: each song gets its own palette and "cover" shape.
        const i = paletteIndex(s.title);
        if (i !== this.pIdx || this.artIcon === '') {
            const p = PALETTES[i];
            this.pIdx = i;
            this.pAccent = p.accent;
            this.pContainer = p.container;
            this.pSurface = p.surface;
            this.artIcon = IMG + 'art_' + i + '.png';
        }
        this.playIcon = IMG + (this.playing ? 'pause_p' : 'play_p') + i + '.png';
        // Shape morph: pill when paused, rounded square while playing.
        this.playRadius = this.playing ? 30 : 52;

        const pct = s.dur > 0 ? Math.min(1, s.pos / s.dur) : 0;
        this.fillWidth = Math.round(TRACK_W * pct);
        if (s.vol !== undefined) {
            this.vol = s.vol;
        }
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

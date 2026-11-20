import router from '@system.router';
import bridge from '../../common/bridge.js';
import { tick, focusCrown } from '../../common/haptics.js';
import { drawWavyBar } from '../../common/wavyring.js';
import { PALETTES, paletteIndex } from '../../common/palette.js';

const IMG = '/common/images/';
const FRAMES = 6;
let wavePhase = 0;

// image-animator frames: the shape turns and the note stays upright (common/images/art_<i>_<k>.png).
function frames(i) {
    const f = [];
    for (let k = 0; k < FRAMES; k++) {
        f.push({ src: IMG + 'art_' + i + '_' + k + '.png' });
    }
    return f;
}

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
        artFrames: frames(0),
        playIcon: IMG + 'play_p0.png',
        playRadius: 52,
        progPct: 0.2,
        vol: 0
    },
    onInit() {
        this.waveTimer = null;
        bridge.on('media.state', (s) => this.applyState(s));
        bridge.send('media.get');
    },
    onShow() {
        // The crown moves the volume slider (lite: only list/slider/picker take the crown).
        focusCrown(this.$refs.vol);
        setTimeout(() => { this.drawWave(); }, 80);
    },
    onDestroy() {
        this.stopWave();
        bridge.off('media.state');
    },
    drawWave() {
        drawWavyBar(this, 'wave', {
            w: 280, h: 24, pct: this.progPct,
            color: this.pAccent, track: this.pSurface, phase: wavePhase
        });
    },
    startWave() {
        this.stopWave();
        this.waveTimer = setInterval(() => {
            wavePhase += 0.55;
            this.drawWave();
        }, 250);
    },
    stopWave() {
        if (this.waveTimer) {
            clearInterval(this.waveTimer);
            this.waveTimer = null;
        }
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
        const wasPlaying = this.playing;
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
            this.artFrames = frames(i);
        }
        this.playIcon = IMG + (this.playing ? 'pause_p' : 'play_p') + i + '.png';
        // Shape morph: pill when paused, rounded square while playing.
        this.playRadius = this.playing ? 30 : 52;
        if (this.playing !== wasPlaying) {
            this.animate(this.playing);
            if (this.playing) { this.startWave(); } else { this.stopWave(); }
        }

        this.progPct = s.dur > 0 ? Math.min(1, s.pos / s.dur) : 0;
        this.drawWave();
        if (s.vol !== undefined) {
            this.vol = s.vol;
        }
    },
    animate(on) {
        const a = this.$refs.anim;
        try {
            if (on) { a.start(); } else { a.stop(); }
        } catch (e) {
            // no animator (Previewer/old version): the static image stays
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

import router from '@system.router';
import { tick, focusCrown } from '../../common/haptics.js';
import bridge from '../../common/bridge.js';
import { PALETTES } from '../../common/palette.js';

const IMG = '/common/images/';

export default {
    onShow() {
        focusCrown(this.$refs.list);
    },
    data: {
        // Received from playlists via router params.
        pid: '',
        pname: '',
        pidx: 0,
        headColor: PALETTES[0].accent,
        rows: [],
        msg: 'Cargando…',
        total: 0,
        loaded: 0,
        loading: false
    },
    pal() {
        return PALETTES[this.pidx] || PALETTES[0];
    },
    onInit() {
        this.headColor = this.pal().accent;
        bridge.on('sp.tracks.r', (r) => this.onPage(r));
        bridge.on('sp.play.r', () => router.replace({ uri: 'pages/music/music' }));
        bridge.on('sp.err', (e) => { this.loading = false; this.msg = e.msg; });
        this.load(0);
    },
    onDestroy() {
        bridge.off('sp.tracks.r');
        bridge.off('sp.play.r');
        bridge.off('sp.err');
    },
    load(off) {
        if (this.loading) { return; }
        this.loading = true;
        bridge.send('sp.tracks', { id: this.pid, off: off });
    },
    onPage(r) {
        if (r.id !== this.pid) { return; }
        this.loading = false;
        this.msg = '';
        const p = this.pal();
        const rows = [];
        if (r.off === 0) {
            // First page: start the list with "Play all".
            // "Play all" in the playlist's color (accent container).
            rows.push({ kind: 'all', n: 'Reproducir todo', s: r.locked ? '' : r.total + ' canciones',
                icon: IMG + 'play_p' + this.pidx + '.png', lcls: 'labels', color: p.on, sub: p.container, bg: p.accent });
        } else {
            // Next pages: keep what's already there, minus the "See more" row.
            for (let i = 0; i < this.rows.length; i++) {
                if (this.rows[i].kind !== 'more') { rows.push(this.rows[i]); }
            }
        }
        for (let j = 0; j < r.items.length; j++) {
            const t = r.items[j];
            rows.push({ kind: 'track', idx: r.off + j, n: t.n, s: t.a, icon: '', lcls: 'labels-wide',
                color: '#f1f3f1', sub: p.accent, bg: p.surface });
        }
        this.total = r.total;
        this.loaded = r.off + r.items.length;
        if (!r.locked && this.loaded < this.total) {
            rows.push({ kind: 'more', n: 'Ver más…', s: (this.total - this.loaded) + ' restantes', icon: '',
                lcls: 'labels-wide', color: p.accent, sub: '#a9a4ad', bg: p.container });
        }
        if (r.locked) {
            this.msg = 'Spotify no comparte su lista';
        }
        this.rows = rows;
    },
    open(i) {
        const row = this.rows[i];
        if (!row) { return; }
        tick();
        if (row.kind === 'more') {
            this.load(this.loaded);
        } else if (row.kind === 'all') {
            this.msg = 'Reproduciendo…';
            bridge.send('sp.play', { id: this.pid });
        } else {
            this.msg = 'Reproduciendo…';
            bridge.send('sp.play', { id: this.pid, idx: row.idx });
        }
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/playlists/playlists' });
        }
    }
};

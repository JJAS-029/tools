import router from '@system.router';
import { tick, focusCrown } from '../../common/haptics.js';
import bridge from '../../common/bridge.js';

// M3 Expressive: primary container for actions, tonal surface for items.
const ACTION = { color: '#00391c', sub: '#1f5c33', bg: '#9df5b0' };
const ITEM = { color: '#f1f3f1', sub: '#9da39f', bg: '#1d201f' };
const MORE = { color: '#9df5b0', sub: '#9da39f', bg: '#173a22' };

export default {
    onShow() {
        focusCrown(this.$refs.list);
    },
    data: {
        // Received from playlists via router params.
        pid: '',
        pname: '',
        rows: [],
        msg: 'Cargando…',
        total: 0,
        loaded: 0,
        loading: false
    },
    onInit() {
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
        const rows = [];
        if (r.off === 0) {
            // First page: start the list with "Play all".
            rows.push({ kind: 'all', n: 'Reproducir todo', s: r.locked ? '' : r.total + ' canciones', color: ACTION.color, sub: ACTION.sub, bg: ACTION.bg });
        } else {
            // Next pages: keep what's already there, minus the "See more" row.
            for (let i = 0; i < this.rows.length; i++) {
                if (this.rows[i].kind !== 'more') { rows.push(this.rows[i]); }
            }
        }
        for (let j = 0; j < r.items.length; j++) {
            const t = r.items[j];
            rows.push({ kind: 'track', idx: r.off + j, n: t.n, s: t.a, color: ITEM.color, sub: ITEM.sub, bg: ITEM.bg });
        }
        this.total = r.total;
        this.loaded = r.off + r.items.length;
        if (!r.locked && this.loaded < this.total) {
            rows.push({ kind: 'more', n: 'Ver más…', s: (this.total - this.loaded) + ' restantes', color: MORE.color, sub: MORE.sub, bg: MORE.bg });
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

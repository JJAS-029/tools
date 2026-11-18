import router from '@system.router';
import bridge from '../../common/bridge.js';

const WHITE = '#ffffff';
const GREEN = '#1db954';

export default {
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
            rows.push({ kind: 'all', n: 'Reproducir todo', s: r.locked ? '' : r.total + ' canciones', color: GREEN });
        } else {
            // Next pages: keep what's already there, minus the "See more" row.
            for (let i = 0; i < this.rows.length; i++) {
                if (this.rows[i].kind !== 'more') { rows.push(this.rows[i]); }
            }
        }
        for (let j = 0; j < r.items.length; j++) {
            const t = r.items[j];
            rows.push({ kind: 'track', idx: r.off + j, n: t.n, s: t.a, color: WHITE });
        }
        this.total = r.total;
        this.loaded = r.off + r.items.length;
        if (!r.locked && this.loaded < this.total) {
            rows.push({ kind: 'more', n: 'Ver más…', s: (this.total - this.loaded) + ' restantes', color: GREEN });
        }
        if (r.locked) {
            this.msg = 'Spotify no comparte su lista';
        }
        this.rows = rows;
    },
    open(i) {
        const row = this.rows[i];
        if (!row) { return; }
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

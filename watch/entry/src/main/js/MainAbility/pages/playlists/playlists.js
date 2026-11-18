import router from '@system.router';
import bridge from '../../common/bridge.js';

const WHITE = '#ffffff';
const GREEN = '#1db954';

export default {
    data: {
        rows: [],
        msg: 'Cargando…',
        total: 0,
        loaded: 0,
        loading: false
    },
    onInit() {
        bridge.on('sp.lists.r', (r) => this.onPage(r));
        bridge.on('sp.err', (e) => { this.loading = false; this.msg = e.msg; });
        this.load(0);
    },
    onDestroy() {
        bridge.off('sp.lists.r');
        bridge.off('sp.err');
    },
    load(off) {
        if (this.loading) { return; }
        this.loading = true;
        bridge.send('sp.lists', { off: off });
    },
    onPage(r) {
        this.loading = false;
        this.msg = '';
        // Drop the "See more" row if it exists.
        const rows = [];
        for (let i = 0; i < this.rows.length; i++) {
            if (this.rows[i].id !== '__more') { rows.push(this.rows[i]); }
        }
        if (r.off === 0 && r.liked !== undefined) {
            rows.push({ id: 'liked', n: 'Tus me gusta', s: r.liked + ' canciones', color: GREEN });
        }
        for (let j = 0; j < r.items.length; j++) {
            const p = r.items[j];
            rows.push({ id: p.id, n: p.n, s: p.c + ' canciones', color: WHITE });
        }
        this.total = r.total;
        this.loaded = r.off + r.items.length;
        if (this.loaded < this.total) {
            rows.push({ id: '__more', n: 'Ver más…', s: (this.total - this.loaded) + ' restantes', color: GREEN });
        }
        this.rows = rows;
        if (rows.length === 0) { this.msg = 'No tienes playlists'; }
    },
    open(idx) {
        const row = this.rows[idx];
        if (!row) { return; }
        if (row.id === '__more') {
            this.load(this.loaded);
            return;
        }
        router.replace({ uri: 'pages/tracks/tracks', params: { pid: row.id, pname: row.n } });
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

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
            rows.push({ id: 'liked', n: 'Tus me gusta', s: r.liked + ' canciones', color: ACTION.color, sub: ACTION.sub, bg: ACTION.bg });
        }
        for (let j = 0; j < r.items.length; j++) {
            const p = r.items[j];
            rows.push({ id: p.id, n: p.n, s: p.c + ' canciones', color: ITEM.color, sub: ITEM.sub, bg: ITEM.bg });
        }
        this.total = r.total;
        this.loaded = r.off + r.items.length;
        if (this.loaded < this.total) {
            rows.push({ id: '__more', n: 'Ver más…', s: (this.total - this.loaded) + ' restantes', color: MORE.color, sub: MORE.sub, bg: MORE.bg });
        }
        this.rows = rows;
        if (rows.length === 0) { this.msg = 'No tienes playlists'; }
    },
    open(idx) {
        const row = this.rows[idx];
        if (!row) { return; }
        tick();
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

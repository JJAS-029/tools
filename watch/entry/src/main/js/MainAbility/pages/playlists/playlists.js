import router from '@system.router';
import { tick, focusCrown } from '../../common/haptics.js';
import bridge from '../../common/bridge.js';
import { PALETTES, paletteIndex } from '../../common/palette.js';

const IMG = '/common/images/';
const PINK = PALETTES[4];
const LILAC = PALETTES[0];

// "Your likes": pink container. Each playlist: its own shape and color (same as in Music).
function likedRow(count) {
    return { id: 'liked', n: 'Tus me gusta', s: count + ' canciones', icon: IMG + 'lt_heart.png',
        lcls: 'labels', color: PINK.on, sub: '#7b2949', bg: PINK.accent };
}
function playlistRow(p) {
    const i = paletteIndex(p.n);
    return { id: p.id, n: p.n, s: p.c + ' canciones', icon: IMG + 'lt_' + i + '.png', pidx: i,
        lcls: 'labels', color: '#f1f3f1', sub: PALETTES[i].accent, bg: PALETTES[i].surface };
}
function moreRow(left) {
    return { id: '__more', n: 'Ver más…', s: left + ' restantes', icon: '',
        lcls: 'labels-wide', color: LILAC.accent, sub: '#a9a4ad', bg: LILAC.container };
}

export default {
    onShow() {
        focusCrown(this.$refs.list);
    },
    data: {
        headColor: LILAC.accent,
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
            rows.push(likedRow(r.liked));
        }
        for (let j = 0; j < r.items.length; j++) {
            const p = r.items[j];
            rows.push(playlistRow(p));
        }
        this.total = r.total;
        this.loaded = r.off + r.items.length;
        if (this.loaded < this.total) {
            rows.push(moreRow(this.total - this.loaded));
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
        // "Your likes" uses pink; each playlist passes its color to the song list.
        const pidx = row.id === 'liked' ? 4 : row.pidx;
        router.replace({ uri: 'pages/tracks/tracks', params: { pid: row.id, pname: row.n, pidx: pidx } });
    },
    onSwipe(e) {
        if (e.direction === 'right') {
            router.replace({ uri: 'pages/index/index' });
        }
    }
};

/**
 * Bridge between the watch and the phone app.
 * Messages: { t: "<type>", d: {...} }. See docs/protocol.md.
 *
 * MOCK = true simulates the phone so the screens can be tested in the
 * Previewer. When Wear Engine is approved, the P2P implementation goes
 * in realSend() and the init() receiver.
 */
const MOCK = true;

const handlers = {};

function emit(t, d) {
    const h = handlers[t];
    if (h) {
        h(d);
    }
}

// ---------- Simulated phone ----------
const mockMedia = {
    app: 'Spotify',
    title: 'Canción de prueba',
    artist: 'Artista de ejemplo',
    playing: false,
    pos: 42,
    dur: 213,
    vol: 50
};

const mockCam = { front: false, video: false, n: 0, v: 0 };

function copy(o) {
    const r = {};
    for (const k in o) {
        r[k] = o[k];
    }
    return r;
}

function mockSend(t, d) {
    if (t === 'media.cmd') {
        const a = d.a;
        if (a === 'play') { mockMedia.playing = true; }
        else if (a === 'pause') { mockMedia.playing = false; }
        else if (a === 'next') { mockMedia.title = 'Siguiente canción'; mockMedia.pos = 0; }
        else if (a === 'prev') { mockMedia.title = 'Canción anterior'; mockMedia.pos = 0; }
        else if (a === 'vol+') { mockMedia.vol = Math.min(100, mockMedia.vol + 10); }
        else if (a === 'vol-') { mockMedia.vol = Math.max(0, mockMedia.vol - 10); }
        else if (a === 'vol') { mockMedia.vol = d.v; }
    }
    if (t === 'media.get' || t === 'media.cmd') {
        setTimeout(function () { emit('media.state', copy(mockMedia)); }, 150);
    }
    if (t === 'sp.lists') {
        const total = 22;
        const items = [];
        for (let i = d.off; i < Math.min(total, d.off + 15); i++) {
            items.push({ id: 'pl' + i, n: 'Playlist ' + (i + 1), c: 10 + i });
        }
        const r = { off: d.off, total: total, items: items };
        if (d.off === 0) { r.liked = 348; }
        setTimeout(function () { emit('sp.lists.r', r); }, 300);
    }
    if (t === 'sp.tracks') {
        const tTotal = d.id === 'liked' ? 348 : 18;
        const tItems = [];
        for (let j = d.off; j < Math.min(tTotal, d.off + 15); j++) {
            tItems.push({ n: 'Canción ' + (j + 1), a: 'Artista ' + (j % 4 + 1) });
        }
        setTimeout(function () {
            emit('sp.tracks.r', { id: d.id, off: d.off, total: tTotal, locked: d.id === 'pl3', items: d.id === 'pl3' ? [] : tItems });
        }, 300);
    }
    if (t === 'sp.play') {
        mockMedia.playing = true;
        mockMedia.title = 'Canción ' + ((d.idx || 0) + 1);
        setTimeout(function () { emit('sp.play.r', { ok: true }); }, 200);
    }
    // Camera: the phone opens, counts down and "takes" the photo.
    if (t === 'cam.open') {
        setTimeout(function () { emit('cam.state', { open: true, front: mockCam.front, mode: mockCam.video ? 'video' : 'photo' }); }, 400);
    }
    if (t === 'cam.mode') {
        mockCam.video = d.m === 'video';
        setTimeout(function () { emit('cam.state', { open: true, front: mockCam.front, mode: d.m }); }, 200);
    }
    if (t === 'cam.rec' && d.a === 'start') {
        const rs = d.timer || 0;
        for (let q = rs; q >= 1; q--) {
            (function (s, wait) {
                setTimeout(function () { emit('cam.count', { s: s }); }, wait);
            })(q, (rs - q) * 1000);
        }
        setTimeout(function () { emit('cam.rec.state', { on: true }); }, rs * 1000 + 300);
    }
    if (t === 'cam.rec' && d.a === 'stop') {
        mockCam.v++;
        setTimeout(function () {
            emit('cam.rec.state', { on: false });
            emit('cam.result', { ok: true, name: 'JJAS_video_' + mockCam.v + '.mp4', video: true });
        }, 400);
    }
    if (t === 'cam.flip') {
        mockCam.front = !mockCam.front;
        setTimeout(function () { emit('cam.state', { open: true, front: mockCam.front }); }, 200);
    }
    if (t === 'cam.shoot') {
        const secs = d.timer || 0;
        for (let k = secs; k >= 1; k--) {
            (function (s, wait) {
                setTimeout(function () { emit('cam.count', { s: s }); }, wait);
            })(k, (secs - k) * 1000);
        }
        mockCam.n++;
        setTimeout(function () { emit('cam.result', { ok: true, name: 'JJAS_prueba_' + mockCam.n + '.jpg' }); }, secs * 1000 + 300);
    }
    if (t === 'fx.get') {
        setTimeout(function () { emit('fx.rate', { usd: 20.15, date: 'simulado' }); }, 200);
    }
    if (t === 'ping') {
        setTimeout(function () { emit('pong', { ts: d.ts }); }, 100);
    }
}

// ---------- Real transport (Wear Engine P2P), pending ----------
function realSend(t, d) {
    // TODO(Fase 1): p2pClient.send(peer, new Message(JSON.stringify({ t: t, d: d })))
    console.info('bridge.send (sin transporte) ' + t);
}

export default {
    on(t, cb) {
        handlers[t] = cb;
    },
    off(t) {
        delete handlers[t];
    },
    send(t, d) {
        const data = d || {};
        if (MOCK) {
            mockSend(t, data);
        } else {
            realSend(t, data);
        }
    },
    // Called by the P2P receiver with the raw text from the phone.
    receive(raw) {
        try {
            const m = JSON.parse(raw);
            emit(m.t, m.d || {});
        } catch (e) {
            console.error('bridge: mensaje inválido');
        }
    }
};

/**
 * Offline CDMX Metro (12 lines, 195 stations) + Tarjeta de Movilidad Integrada (MI).
 * Pure ES module with zero platform imports so it can be unit-tested in Node.
 */

export const LINES = [
    {
        id: '1', name: 'Línea 1', color: '#f28ab2', bg: '#4a1b2e',
        s: [
            'Pantitlán', 'Zaragoza', 'Gómez Farías', 'Blvd. Pto. Aéreo', 'Balbuena',
            'Moctezuma', 'San Lázaro', 'Candelaria', 'Merced', 'Pino Suárez',
            'Isabel la Católica', 'Salto del Agua', 'Balderas', 'Cuauhtémoc', 'Insurgentes',
            'Sevilla', 'Chapultepec', 'Juanacatlán', 'Tacubaya', 'Observatorio'
        ]
    },
    {
        id: '2', name: 'Línea 2', color: '#64b5f6', bg: '#15324d',
        s: [
            'Cuatro Caminos', 'Panteones', 'Tacuba', 'Cuitláhuac', 'Popotla',
            'Colegio Militar', 'Normal', 'San Cosme', 'Revolución', 'Hidalgo',
            'Bellas Artes', 'Allende', 'Zócalo', 'Pino Suárez', 'San Antonio Abad',
            'Chabacano', 'Viaducto', 'Xola', 'Villa de Cortés', 'Nativitas',
            'Portales', 'Ermita', 'General Anaya', 'Tasqueña'
        ]
    },
    {
        id: '3', name: 'Línea 3', color: '#b5c95a', bg: '#2f3614',
        s: [
            'Indios Verdes', 'Deportivo 18 de Marzo', 'Potrero', 'La Raza', 'Tlatelolco',
            'Guerrero', 'Hidalgo', 'Juárez', 'Balderas', 'Niños Héroes',
            'Hospital General', 'Centro Médico', 'Etiopía', 'Eugenia', 'División del Norte',
            'Zapata', 'Coyoacán', 'Viveros', 'M. Á. de Quevedo', 'Copilco',
            'Universidad'
        ]
    },
    {
        id: '4', name: 'Línea 4', color: '#7ce0d3', bg: '#163834',
        s: [
            'Martín Carrera', 'Talismán', 'Bondojito', 'Consulado', 'Canal del Norte',
            'Morelos', 'Candelaria', 'Fray Servando', 'Jamaica', 'Santa Anita'
        ]
    },
    {
        id: '5', name: 'Línea 5', color: '#ffd54f', bg: '#3d3210',
        s: [
            'Politécnico', 'Instituto del Petróleo', 'Autobuses del Norte', 'La Raza', 'Misterios',
            'Valle Gómez', 'Consulado', 'Eduardo Molina', 'Aragón', 'Oceanía',
            'Terminal Aérea', 'Hangares', 'Pantitlán'
        ]
    },
    {
        id: '6', name: 'Línea 6', color: '#ff7961', bg: '#4a1c15',
        s: [
            'El Rosario', 'Tezozómoc', 'UAM-Azcapotzalco', 'Ferrería', 'Norte 45',
            'Vallejo', 'Instituto del Petróleo', 'Lindavista', 'Deportivo 18 de Marzo', 'La Villa-Basílica',
            'Martín Carrera'
        ]
    },
    {
        id: '7', name: 'Línea 7', color: '#ffab40', bg: '#452b0d',
        s: [
            'El Rosario', 'Aquiles Serdán', 'Camarones', 'Refinería', 'Tacuba',
            'San Joaquín', 'Polanco', 'Auditorio', 'Constituyentes', 'Tacubaya',
            'San Pedro de los Pinos', 'San Antonio', 'Mixcoac', 'Barranca del Muerto'
        ]
    },
    {
        id: '8', name: 'Línea 8', color: '#66bb6a', bg: '#163819',
        s: [
            'Garibaldi', 'Bellas Artes', 'San Juan de Letrán', 'Salto del Agua', 'Doctores',
            'Obrera', 'Chabacano', 'La Viga', 'Santa Anita', 'Coyuya',
            'Iztacalco', 'Apatlaco', 'Aculco', 'Escuadrón 201', 'Atlalilco',
            'Iztapalapa', 'Cerro de la Estrella', 'UAM-I', 'Constitución de 1917'
        ]
    },
    {
        id: '9', name: 'Línea 9', color: '#c49a6c', bg: '#382918',
        s: [
            'Tacubaya', 'Patriotismo', 'Chilpancingo', 'Centro Médico', 'Lázaro Cárdenas',
            'Chabacano', 'Jamaica', 'Mixiuhca', 'Velódromo', 'Ciudad Deportiva',
            'Puebla', 'Pantitlán'
        ]
    },
    {
        id: 'A', name: 'Línea A', color: '#ba68c8', bg: '#371b3d',
        s: [
            'Pantitlán', 'Agrícola Oriental', 'Canal de San Juan', 'Tepalcates', 'Guelatao',
            'Peñón Viejo', 'Acatitla', 'Santa Marta', 'Los Reyes', 'La Paz'
        ]
    },
    {
        id: 'B', name: 'Línea B', color: '#80cbc4', bg: '#193633',
        s: [
            'Buenavista', 'Guerrero', 'Garibaldi', 'Lagunilla', 'Tepito',
            'Morelos', 'San Lázaro', 'R. Flores Magón', 'Romero Rubio', 'Oceanía',
            'Deportivo Oceanía', 'Bosque de Aragón', 'Villa de Aragón', 'Nezahualcóyotl', 'Impulsora',
            'Río de los Remedios', 'Múzquiz', 'Ecatepec', 'Olímpica', 'Plaza Aragón',
            'Ciudad Azteca'
        ]
    },
    {
        id: '12', name: 'Línea 12', color: '#e6c26e', bg: '#3b3015',
        s: [
            'Mixcoac', 'Insurgentes Sur', 'Hosp. 20 de Noviembre', 'Zapata', 'Parque de los Venados',
            'Eje Central', 'Ermita', 'Mexicaltzingo', 'Atlalilco', 'Culhuacán',
            'San Andrés Tomatlán', 'Lomas Estrella', 'Calle 11', 'Periférico Oriente', 'Tezonco',
            'Olivos', 'Nopalera', 'Zapotitlán', 'Tlaltenco', 'Tláhuac'
        ]
    }
];

export function getLine(id) {
    for (let i = 0; i < LINES.length; i++) {
        if (LINES[i].id === id) {
            return LINES[i];
        }
    }
    return LINES[0];
}

/** Returns other line IDs that share this station name (e.g. ['5','9','A']). */
export function transfersOf(station, excludeId) {
    const out = [];
    for (let i = 0; i < LINES.length; i++) {
        const ln = LINES[i];
        if (ln.id === excludeId) {
            continue;
        }
        if (ln.s.indexOf(station) !== -1) {
            out.push(ln.id);
        }
    }
    return out;
}

/** Shortest route between two station names (penalizes transfers lightly). */
export function findRoute(from, to) {
    if (!from || !to || from === to) {
        return [];
    }
    // Build adjacency: node = lineId + '|' + station
    const dist = {};
    const prev = {};
    const q = [];

    for (let i = 0; i < LINES.length; i++) {
        const ln = LINES[i];
        const idx = ln.s.indexOf(from);
        if (idx !== -1) {
            const k = ln.id + '|' + from;
            dist[k] = 0;
            q.push({ k: k, line: ln.id, st: from, d: 0 });
        }
    }

    let bestEnd = null;
    let bestDist = 99999;

    while (q.length > 0) {
        // Pick smallest d (graph has only 195 nodes, linear pick is fast & tiny)
        let bi = 0;
        for (let j = 1; j < q.length; j++) {
            if (q[j].d < q[bi].d) { bi = j; }
        }
        const cur = q.splice(bi, 1)[0];
        if (cur.d > dist[cur.k] || cur.d >= bestDist) {
            continue;
        }
        if (cur.st === to) {
            bestEnd = cur.k;
            bestDist = cur.d;
            break;
        }
        const ln = getLine(cur.line);
        const idx = ln.s.indexOf(cur.st);
        const nbrs = [];
        if (idx > 0) { nbrs.push({ line: ln.id, st: ln.s[idx - 1], w: 1 }); }
        if (idx < ln.s.length - 1) { nbrs.push({ line: ln.id, st: ln.s[idx + 1], w: 1 }); }
        const tr = transfersOf(cur.st, ln.id);
        for (let t = 0; t < tr.length; t++) {
            nbrs.push({ line: tr[t], st: cur.st, w: 3 });
        }
        for (let n = 0; n < nbrs.length; n++) {
            const nb = nbrs[n];
            const nk = nb.line + '|' + nb.st;
            const nd = cur.d + nb.w;
            if (dist[nk] === undefined || nd < dist[nk]) {
                dist[nk] = nd;
                prev[nk] = cur.k;
                q.push({ k: nk, line: nb.line, st: nb.st, d: nd });
            }
        }
    }

    if (!bestEnd) {
        return null;
    }
    const path = [];
    let p = bestEnd;
    while (p) {
        const sep = p.indexOf('|');
        path.unshift({ line: p.slice(0, sep), st: p.slice(sep + 1) });
        p = prev[p];
    }
    // Group consecutive stations on the same line into legs
    const legs = [];
    for (let u = 0; u < path.length; u++) {
        const step = path[u];
        const last = legs.length > 0 ? legs[legs.length - 1] : null;
        if (!last || last.line !== step.line) {
            legs.push({ line: step.line, from: step.st, to: step.st, stops: 0 });
        } else {
            last.to = step.st;
            last.stops++;
        }
    }
    return legs;
}

// ---------- Tarjeta de Movilidad Integrada (MI) ----------
export const FARES = [
    { id: 'metro', name: 'Metro', cost: 5 },
    { id: 'mb', name: 'Metrobús', cost: 6 },
    { id: 'cable', name: 'Cablebús', cost: 7 },
    { id: 'tren', name: 'Tren Ligero', cost: 3 }
];

export function defaultCard() {
    return { balance: 50 };
}

export function cardTrips(balance, cost) {
    const c = cost || 5;
    return Math.max(0, Math.floor((Number(balance) || 0) / c));
}

export function applyTrip(card, cost) {
    const bal = Math.max(0, (Number(card.balance) || 0) - cost);
    card.balance = Math.round(bal * 100) / 100;
    return card;
}

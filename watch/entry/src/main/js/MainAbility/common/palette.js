/**
 * Material You style palettes for music: each song gets one
 * (derived from its title), like when Android takes color from the cover.
 * Must match MUSIC_PALETTES in scripts/gen_watch_icons.py.
 */
export const PALETTES = [
    { accent: '#d0bcff', on: '#381e72', container: '#3b2f57', surface: '#2b2633' }, // lilac
    { accent: '#ffb4a8', on: '#561e15', container: '#5a2e27', surface: '#33201d' }, // coral
    { accent: '#a8c8ff', on: '#0a2f60', container: '#263a5c', surface: '#1f2531' }, // sky
    { accent: '#ffd27a', on: '#402d00', container: '#4f4020', surface: '#2f2a20' }, // amber
    { accent: '#ffb0cd', on: '#5e1133', container: '#5a2a3e', surface: '#33202a' }, // pink
    { accent: '#80d5d0', on: '#003735', container: '#204a48', surface: '#1c2b2a' }  // teal
];

export function paletteIndex(text) {
    let h = 0;
    const s = text || '';
    for (let i = 0; i < s.length; i++) {
        h = (h * 31 + s.charCodeAt(i)) % 100003;
    }
    return h % PALETTES.length;
}

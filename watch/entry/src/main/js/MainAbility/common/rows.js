/**
 * Rows for the M3 card lists (same markup in every page).
 * With icon: 56px tile + text; without icon: wide text.
 */
const IMG = '/common/images/';

export function row(fields, icon, colors) {
    const r = {
        icon: icon ? IMG + icon : '',
        lw: icon ? 252 : 300,
        lm: icon ? 12 : 24,
        color: colors.color,
        sub: colors.sub,
        bg: colors.bg
    };
    for (const k in fields) {
        r[k] = fields[k];
    }
    return r;
}

// M3 color roles (dark theme)
export const INFO = { color: '#f1f3f1', sub: '#a9a4ad', bg: '#000000' };
export const ITEM = { color: '#f1f3f1', sub: '#a9a4ad', bg: '#1d201f' };
export const ACTION = { color: '#003735', sub: '#204a48', bg: '#80d5d0' }; // teal
export const TONAL = { color: '#ffd27a', sub: '#a9a4ad', bg: '#2f2a20' }; // amber

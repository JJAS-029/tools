/**
 * Vibrations and digital crown.
 * Everything is wrapped in try/catch: the Previewer has no vibrator or crown
 * and must not break.
 */
import vibrator from '@system.vibrator';

export function tick() {
    try {
        vibrator.vibrate({ mode: 'short' });
    } catch (e) {
        // no vibrator (Previewer)
    }
}

/**
 * Gives a component crown focus (list, or the div with onrotation).
 * Call it from onShow() with this.$refs.<ref>.
 */
export function focusCrown(el) {
    try {
        if (el && el.rotation) {
            el.rotation({ focus: true });
        }
    } catch (e) {
        // no crown (Previewer)
    }
}

/**
 * Turns the crown's continuous turning into discrete "steps".
 * STEP = how much you have to turn per step (adjust on the real watch).
 */
const STEP = 0.5;
let acc = 0;

export function crownSteps(e) {
    acc += (e && e.rotateValue) || 0;
    let steps = 0;
    while (acc >= STEP) { steps++; acc -= STEP; }
    while (acc <= -STEP) { steps--; acc += STEP; }
    return steps;
}

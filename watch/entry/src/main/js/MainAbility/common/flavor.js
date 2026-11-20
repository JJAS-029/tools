/**
 * Build variant.
 *  - PUBLIC = false → personal version: everything, with the simulated phone (bridge MOCK)
 *    to test in the Previewer.
 *  - PUBLIC = true  → AppGallery version: only what works WITHOUT the phone (with no
 *    Wear Engine there's no link), no "Coming soon" items and no simulated data.
 * Switch with: bash scripts/set_flavor.sh public|personal
 */
export const PUBLIC = false;

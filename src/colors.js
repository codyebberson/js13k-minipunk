

/**
 * Creates a little-endian 32-bit color from red, green, and blue components.
 * @param {number} r Red (0-255).
 * @param {number} g Green (0-255).
 * @param {number} b Blue (0-255).
 * @return {number} A 32-bit little-endian color.
 */
function createColor(r, g, b) {
    return 0xFF000000 + (b << 16) + (g << 8) + r;
}

/**
 * Converts a color from HSV format to RGB format.
 *
 * Based on: https://stackoverflow.com/a/17243070/2051724
 *
 * @param {number} h Hue.
 * @param {number} s Saturation.
 * @param {number} v Value.
 * @return {number} A 32-bit little-endian color.
 */
function createHsvColor(h, s, v) {
    var r, g, b, i, f, p, q, t;
    i = (h * 6) | 0;
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return createColor(
        (/** @type {number} */ (r) * 255) | 0,
        (/** @type {number} */ (g) * 255) | 0,
        (/** @type {number} */ (b) * 255) | 0);
}

/**
 * Blends two RGB colors.
 * @param {number} r1
 * @param {number} g1
 * @param {number} b1
 * @param {number} r2
 * @param {number} g2
 * @param {number} b2
 * @param {number} f
 * @return {number} A 32-bit little-endian color.
 */
function blendColors(r1, g1, b1, r2, g2, b2, f) {
    let f2 = 1.0 - f;
    return createColor(
        (r1 * f2 + r2 * f) | 0,
        (g1 * f2 + g2 * f) | 0,
        (b1 * f2 + b2 * f) | 0);
}

/**
 * Blends two RGB colors.
 * @param {!vec3} c1
 * @param {!vec3} c2
 * @param {number} f
 * @return {number} A 32-bit little-endian color.
 */
function blendColors2(c1, c2, f) {
    let f2 = 1.0 - f;
    return createColor(
        (c1[0] * f2 + c2[0] * f) | 0,
        (c1[1] * f2 + c2[1] * f) | 0,
        (c1[2] * f2 + c2[2] * f) | 0);
}

let COLOR_HURT_VEC = vec3.fromValues(192, 0, 0);

/**
 * Controls logging level.
 * When false, all logging becomes no-op, so compiled to nothing.
 * @const {boolean}
 */
let DEBUG = false;

/**
 * Controls whether the AI is enabled.
 * Usefule when debugging world procedural generation.
 * @const {boolean}
 */
let AI_ENABLED = true;

/**
 * Epsilon for vec3 and mat4 comparisons.
 * @const {number}
 */
let EPSILON = 0.00001;

/**
 * Normalizes a radians value to the range -pi to +pi.
 * @param {number} radians
 * @return {number}
 */
function normalizeRadians(radians) {
    while (radians > Math.PI) {
        radians -= 2 * Math.PI;
    }
    while (radians < -Math.PI) {
        radians += 2 * Math.PI;
    }
    return radians;
}

/**
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function randomBetween(min, max) {
    return min + (max - min) * Math.random();
}

/**
 * Returns the sign of the number
 * @param {number} x
 * @return {number}
 */
function signum(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
}

/**
 * Safe mod, works with negative numbers.
 * @param {number} value
 * @param {number} modulus
 * @return {number}
 */
function mod(value, modulus) {
    return (value % modulus + modulus) % modulus;
}


/**
 * @param {string} str
 */
function log(str) {
    if (DEBUG) {
        console.log(str);
    }
}

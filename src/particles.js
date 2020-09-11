
/**
 * Global array of particles.
 * @const {!Array}
 */
let particles = [];

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} dx
 * @param {number} dy
 * @param {number} dz
 * @param {number} size
 * @param {number} color
 * @param {number} duration
 */
function createParticle(x, y, z, dx, dy, dz, size, color, duration) {
    particles.push({
        x: x,
        y: y,
        z: z,
        dx: dx,
        dy: dy,
        dz: dz,
        size: size,
        color: color,
        duration: duration,
        countdown: duration
    });
}

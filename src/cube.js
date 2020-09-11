
/** @typedef {!Array.<!vec3>} */
let cube = {};

/**
 * Creates a cube.
 * @return {!cube}
 */
cube.create = function() {
    let result = new Array(8).fill(0).map(() => vec3.create());
    cube.reset(result, 0, 0, 0, 1, 1, 1);
    return result;
};

/**
 * Resets a cube to the specified location and size.
 * @param {!cube} out
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} xr
 * @param {number} yr
 * @param {number} zr
 */
cube.reset = function(out, x, y, z, xr, yr, zr) {
    let x1 = x - xr, x2 = x + xr, y1 = y - yr, y2 = y + yr, z1 = z - zr, z2 = z + zr;
    vec3.set(out[0], x1, y2, z2);
    vec3.set(out[1], x2, y2, z2);
    vec3.set(out[2], x2, y2, z1);
    vec3.set(out[3], x1, y2, z1);
    vec3.set(out[4], x1, y1, z2);
    vec3.set(out[5], x2, y1, z2);
    vec3.set(out[6], x2, y1, z1);
    vec3.set(out[7], x1, y1, z1);
};

/**
 * @param {!cube} out
 * @param {!cube} a
 * @param {!vec3} b
 */
cube.add = function(out, a, b) {
    for (let i = 0; i < a.length; i++) {
        vec3.add(out[i], a[i], b);
    }
};

/**
 * @param {!cube} out
 * @param {!cube} a
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
cube.scale = function(out, a, x, y, z) {
    vec3.scale(out[0], a[0], x);
    vec3.scale(out[1], a[1], y);
    vec3.scale(out[2], a[2], z);
};

/**
 * @param {!cube} out
 * @param {!cube} a
 * @param {!vec3} origin
 * @param {number} theta
 */
cube.rotateX = function(out, a, origin, theta) {
    for (let i = 0; i < a.length; i++) {
        vec3.rotateX(out[i], a[i], origin, theta);
    }
};

/**
 * @param {!cube} out
 * @param {!cube} a
 * @param {!vec3} origin
 * @param {number} theta
 */
cube.rotateY = function(out, a, origin, theta) {
    for (let i = 0; i < a.length; i++) {
        vec3.rotateY(out[i], a[i], origin, theta);
    }
};

/**
 * @param {!cube} out
 * @param {!cube} a
 * @param {!vec3} origin
 * @param {number} theta
 */
cube.rotateZ = function(out, a, origin, theta) {
    for (let i = 0; i < a.length; i++) {
        vec3.rotateZ(out[i], a[i], origin, theta);
    }
};

/**
 * Skews the cube by adjusting the X and Z components.
 * Top and bottom are skewed independently.
 * @param {!cube} a
 * @param {number} topSkew
 * @param {number} bottomSkew
 */
cube.skew = function(a, topSkew, bottomSkew) {
    for (let i = 0; i < 8; i++) {
        let s = i < 4 ? topSkew : bottomSkew;
        a[i][0] *= s;
        a[i][5] *= s;
    }
};

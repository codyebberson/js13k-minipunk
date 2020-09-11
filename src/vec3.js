
// glMatrix - vec3
// https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/vec3.js

/** @typedef {!Float32Array} */
var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {!vec3} a new 3D vector
 */
vec3.create = function () {
    return new Float32Array(3);
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {!vec3} a vector to clone
 * @returns {!vec3} a new 3D vector
 */
vec3.clone = function (a) {
    var out = new Float32Array(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Calculates the length of a vec3
 *
 * @param {!vec3} a vector to calculate length of
 * @returns {number} length of a
 */
vec3.length = function (a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {number} x X component
 * @param {number} y Y component
 * @param {number} z Z component
 * @returns {!vec3} a new 3D vector
 */
vec3.fromValues = function (x, y, z) {
    let out = new Float32Array(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the source vector
 * @returns {!vec3} out
 */
vec3.copy = function (out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {!vec3} out the receiving vector
 * @param {number} x X component
 * @param {number} y Y component
 * @param {number} z Z component
 * @returns {!vec3} out
 */
vec3.set = function (out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {!vec3} out
 */
vec3.add = function (out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {!vec3} out
 */
vec3.subtract = function (out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Multiplies two vec3's
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {!vec3} out
 */
vec3.multiply = function (out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Divides two vec3's
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {!vec3} out
 */
vec3.divide = function (out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Math.ceil the components of a vec3
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a vector to ceil
 * @returns {!vec3} out
 */
vec3.ceil = function (out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    out[2] = Math.ceil(a[2]);
    return out;
};

/**
 * Returns the minimum of two vec3's
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {!vec3} out
 */
vec3.min = function (out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {!vec3} out
 */
vec3.max = function (out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the vector to scale
 * @param {number} b amount to scale the vector by
 * @returns {!vec3} out
 */
vec3.scale = function (out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @param {number} scale the amount to scale b by before adding
 * @returns {!vec3} out
 */
vec3.scaleAndAdd = function (out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {number} distance between a and b
 */
vec3.distance = function (a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return Math.hypot(x, y, z);
};

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {number} squared distance between a and b
 */
vec3.squaredDistance = function (a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return x * x + y * y + z * z;
};

/**
 * Calculates the squared length of a vec3
 *
 * @param {!vec3} a vector to calculate squared length of
 * @returns {number} squared length of a
 */
vec3.squaredLength = function (a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return x * x + y * y + z * z;
};

/**
 * Negates the components of a vec3
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a vector to negate
 * @returns {!vec3} out
 */
vec3.negate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a vector to invert
 * @returns {!vec3} out
 */
vec3.inverse = function (out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a vector to normalize
 * @returns {!vec3} out
 */
vec3.normalize = function (out, a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    let len = x * x + y * y + z * z;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {!vec3} out
 */
vec3.cross = function (out, a, b) {
    let ax = a[0], ay = a[1], az = a[2];
    let bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} origin the relative origin point for a and b
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @returns {!vec3} out
 */
vec3.cross2 = function (out, origin, a, b) {
    let ax = a[0] - origin[0], ay = a[1] - origin[1], az = a[2] - origin[2];
    let bx = b[0] - origin[0], by = b[1] - origin[1], bz = b[2] - origin[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @param {number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {!vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    let ax = a[0];
    let ay = a[1];
    let az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Performs a hermite interpolation with two control points
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @param {!vec3} c the third operand
 * @param {!vec3} d the fourth operand
 * @param {number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {!vec3} out
 */
vec3.hermite = function (out, a, b, c, d, t) {
    let factorTimes2 = t * t;
    let factor1 = factorTimes2 * (2 * t - 3) + 1;
    let factor2 = factorTimes2 * (t - 2) + t;
    let factor3 = factorTimes2 * (t - 1);
    let factor4 = factorTimes2 * (3 - 2 * t);

    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

    return out;
};

/**
 * Performs a bezier interpolation with two control points
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the first operand
 * @param {!vec3} b the second operand
 * @param {!vec3} c the third operand
 * @param {!vec3} d the fourth operand
 * @param {number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {!vec3} out
 */
vec3.bezier = function (out, a, b, c, d, t) {
    let inverseFactor = 1 - t;
    let inverseFactorTimesTwo = inverseFactor * inverseFactor;
    let factorTimes2 = t * t;
    let factor1 = inverseFactorTimesTwo * inverseFactor;
    let factor2 = 3 * t * inverseFactorTimesTwo;
    let factor3 = 3 * factorTimes2 * inverseFactor;
    let factor4 = factorTimes2 * t;

    out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
    out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
    out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;

    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {!vec3} out the receiving vector
 * @param {!vec3} a the vector to transform
 * @param {!mat4} m matrix to transform with
 * @returns {!vec3} out
 */
vec3.transformMat4 = function (out, a, m) {
    let x = a[0], y = a[1], z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
};

/**
 * Rotate a 3D vector around the x-axis
 * @param {!vec3} out The receiving vec3
 * @param {!vec3} a The vec3 point to rotate
 * @param {!vec3} b The origin of the rotation
 * @param {number} c The angle of rotation
 * @returns {!vec3} out
 */
vec3.rotateX = function (out, a, b, c) {
    let p = [], r = [];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];

    //perform rotation
    r[0] = p[0];
    r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
    r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];

    return out;
};

/**
 * Rotate a 3D vector around the y-axis
 * @param {!vec3} out The receiving vec3
 * @param {!vec3} a The vec3 point to rotate
 * @param {!vec3} b The origin of the rotation
 * @param {number} c The angle of rotation
 * @returns {!vec3} out
 */
vec3.rotateY = function (out, a, b, c) {
    let p = [], r = [];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];

    //perform rotation
    r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
    r[1] = p[1];
    r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];

    return out;
};

/**
 * Rotate a 3D vector around the z-axis
 * @param {!vec3} out The receiving vec3
 * @param {!vec3} a The vec3 point to rotate
 * @param {!vec3} b The origin of the rotation
 * @param {number} c The angle of rotation
 * @returns {!vec3} out
 */
vec3.rotateZ = function (out, a, b, c) {
    let p = [], r = [];
    //Translate point to the origin
    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2];

    //perform rotation
    r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
    r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
    r[2] = p[2];

    //translate to correct position
    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];

    return out;
};

/**
 * Get the angle between two 3D vectors
 * @param {!vec3} a The first operand
 * @param {!vec3} b The second operand
 * @returns {number} The angle in radians
 */
vec3.angle = function (a, b) {
    let tempA = vec3.fromValues(a[0], a[1], a[2]);
    let tempB = vec3.fromValues(b[0], b[1], b[2]);

    vec3.normalize(tempA, tempA);
    vec3.normalize(tempB, tempB);

    let cosine = vec3.dot(tempA, tempB);

    if (cosine > 1.0) {
        return 0;
    }
    else if (cosine < -1.0) {
        return Math.PI;
    } else {
        return Math.acos(cosine);
    }
};

/**
 * Returns a string representation of a vector
 *
 * @param {!vec3} a vector to represent as a string
 * @returns {string} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {!vec3} a The first vector.
 * @param {!vec3} b The second vector.
 * @returns {boolean} True if the vectors are equal, false otherwise.
 */
vec3.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
};

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {!vec3} a The first vector.
 * @param {!vec3} b The second vector.
 * @returns {boolean} True if the vectors are equal, false otherwise.
 */
vec3.equals = function (a, b) {
    let a0 = a[0], a1 = a[1], a2 = a[2];
    let b0 = b[0], b1 = b[1], b2 = b[2];
    return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
        Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)));
};

/**
 * Globally available constant origin vector.
 * Do not modify.
 * @const {!vec3}
 */
let origin = vec3.create();

/**
 * Globally available constant "forward" vector.
 * Forward is defined as positive Z-axis.
 * Do not modify.
 * @const {!vec3}
 */
let forward = vec3.fromValues(0.0, 0.0, 1.0);

/**
 * Globally available temp vector.
 * Modifiable.  Do not make assumptions about contents.
 * @const {!vec3}
 */
let tempVec = vec3.create();

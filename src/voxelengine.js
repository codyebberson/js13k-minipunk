
/*
 * Dimensions of the world in meters (default unit).
 */

/**
 * Size of the world in meters on the x-axis.
 * @const {number}
 */
let METERS_PER_WORLD_X = 512;

/**
 * Size of the world in meters on the y-axis.
 * @const {number}
 */
let METERS_PER_WORLD_Y = 256;

/**
 * Size of the world in meters on the z-axis.
 * @const {number}
 */
let METERS_PER_WORLD_Z = 512;

/*
 * Voxel scale.
 * Voxels are not cubes.
 * Voxels are 1 meter tall, 2 meters wide, and 2 meters deep.
 * These are internal constants.
 */

/**
 * Size of a voxel in meters on the x-axis.
 * @const {number}
 */
let VOXEL_SCALE_X = 4;

/**
 * Size of a voxel in meters on the y-axis.
 * @const {number}
 */
let VOXEL_SCALE_Y = 1;

/**
 * Size of a voxel in meters on the z-axis.
 * @const {number}
 */
let VOXEL_SCALE_Z = 4;

/*
 * Voxels per world.
 * These are internal constants.
 */

/**
 * Size of the world in voxels on the x-axis.
 * @const {number}
 */
let VOXELS_PER_WORLD_X = METERS_PER_WORLD_X / VOXEL_SCALE_X;

/**
 * Size of the world in voxels on the y-axis.
 * @const {number}
 */
let VOXELS_PER_WORLD_Y = METERS_PER_WORLD_Y / VOXEL_SCALE_Y;

/**
 * Size of the world in voxels on the z-axis.
 * @const {number}
 */
let VOXELS_PER_WORLD_Z = METERS_PER_WORLD_Z / VOXEL_SCALE_Z;

/**
 * Empty tile.
 * @const {number}
 */
let TILE_EMPTY = 0;
let TILE_DARK_GRASS = 3;
let TILE_STONE = 9;
let TILE_DARK_STONE = 10;
let TILE_CYAN_WINDOW_ON = 20;
let TILE_CYAN_WINDOW_OFF = 21;
let TILE_PINK_WINDOW_ON = 22;
let TILE_PINK_WINDOW_OFF = 23;
let TILE_YELLOW_WINDOW_ON = 24;
let TILE_YELLOW_WINDOW_OFF = 25;
let TILE_WHITE_WINDOW_ON = 26;
let TILE_WHITE_WINDOW_OFF = 27;
let TILE_RED = 28;
let TILE_WHITE = 29;
let TILE_SIDEWALK = 30;

/**
 * Returns a color for the given tile type.
 * @param {number} tile The tyle type.
 * @return {number} The tile color.
 */
function getTileColor(tile) {
    switch (tile) {
        case TILE_DARK_GRASS:
            return createHsvColor(116 / 360.0, randomBetween(.55, .60), randomBetween(.45, .50));
        case TILE_CYAN_WINDOW_ON:
            return createColor(64, 255, 255);
        case TILE_CYAN_WINDOW_OFF:
            return createColor(32, 128, 128);
        case TILE_PINK_WINDOW_ON:
            return createColor(255, 64, 255);
        case TILE_PINK_WINDOW_OFF:
            return createColor(128, 32, 128);
        case TILE_YELLOW_WINDOW_ON:
            return createColor(255, 128, 64);
        case TILE_YELLOW_WINDOW_OFF:
            return createColor(128, 64, 32);
        case TILE_WHITE_WINDOW_ON:
            return createColor(255, 255, 255);
        case TILE_WHITE_WINDOW_OFF:
            return createColor(128, 128, 128);
        case TILE_STONE:
            return createHsvColor(0, 0, randomBetween(.50, .60));
        case TILE_DARK_STONE:
            return createHsvColor(0, 0, randomBetween(.2, .22));
        case TILE_RED:
            return createColor(128, 0, 0);
        case TILE_WHITE:
            return createColor(224, 224, 224);
    }
    return 0;
}

class VoxelEngine {

    /**
     * Creates a new voxel engine.
     */
    constructor() {
        /**
         * Array of tile data.
         * 3D array flattened into a 1D array.
         * @type {!Uint8Array}
         * @private
         * @const
         */
        this.data = new Uint8Array(VOXELS_PER_WORLD_X * VOXELS_PER_WORLD_Y * VOXELS_PER_WORLD_Z);

        /**
         * WebGL buffers.
         * @type {?BufferSet}
         * @private
         */
        this.bufferSet = null;
    }

    /**
     * Returns true if the specified cube is out of range of the world.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {boolean}
     */
    isOutOfRange(x, y, z) {
        return x < 0 || x >= METERS_PER_WORLD_X ||
            y < 0 || y >= METERS_PER_WORLD_Y ||
            z < 0 || z >= METERS_PER_WORLD_Z;
    }

    /**
     * Returns the array index for the tile.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {number}
     */
    getIndex(x, y, z) {
        let x2 = (x / VOXEL_SCALE_X) | 0;
        let y2 = (y / VOXEL_SCALE_Y) | 0;
        let z2 = (z / VOXEL_SCALE_Z) | 0;
        return z2 * VOXELS_PER_WORLD_X * VOXELS_PER_WORLD_Y +
            y2 * VOXELS_PER_WORLD_X +
            x2;
    }

    /**
     * Returns the tile type for the tile.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {number}
     */
    getCube(x, y, z) {
        if (this.isOutOfRange(x, y, z)) {
            return TILE_EMPTY;
        }
        return this.data[this.getIndex(x, y, z)];
    }

    /**
     * Sets the tile type for the tile.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} v The tile type.
     */
    setCube(x, y, z, v) {
        if (this.isOutOfRange(x, y, z)) {
            return;
        }
        this.data[this.getIndex(x, y, z)] = v;
    }

    /**
     * Returns if the tiles is empty or out of range.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {boolean}
     */
    isEmpty(x, y, z) {
        return this.getCube(x, y, z) === TILE_EMPTY;
    }

    /**
     * Builds the WebGL BufferSet based on the tile data.
     */
    buildBuffers() {
        let i = 0;

        // Start with 6 quads for the skybox
        let count = 6;

        for (let z = 0; z < VOXELS_PER_WORLD_Z; z++) {
            for (let y = 0; y < VOXELS_PER_WORLD_Y; y++) {
                for (let x = 0; x < VOXELS_PER_WORLD_X; x++) {
                    let t = this.data[i++];
                    if (t === TILE_EMPTY) {
                        continue;
                    }
                    let x1 = x * VOXEL_SCALE_X;
                    let y1 = y * VOXEL_SCALE_Y;
                    let z1 = z * VOXEL_SCALE_Z;

                    if (this.isEmpty(x1, y1 + VOXEL_SCALE_Y, z1)) {
                        count++; // top
                    }

                    if (this.isEmpty(x1, y1 - 1, z1)) {
                        count++; // bottom
                    }

                    if (this.isEmpty(x1, y1, z1 + VOXEL_SCALE_Z)) {
                        count++; // north
                    }

                    if (this.isEmpty(x1, y1, z1 - 1)) {
                        count++; // south
                    }

                    if (this.isEmpty(x1 - 1, y1, z1)) {
                        count++; // west
                    }

                    if (this.isEmpty(x1 + VOXEL_SCALE_X, y1, z1)) {
                        count++; // east
                    }
                }
            }
        }

        this.bufferSet = new BufferSet(STATIC_DRAW, count);

        // Add the skybox
        this.bufferSet.addCube(0, 0, 0, 2048, createColor(124, 173, 203));

        i = 0;
        for (let z = 0; z < VOXELS_PER_WORLD_Z; z++) {
            for (let y = 0; y < VOXELS_PER_WORLD_Y; y++) {
                for (let x = 0; x < VOXELS_PER_WORLD_X; x++) {
                    let t = this.data[i++];
                    if (t === TILE_EMPTY) {
                        continue;
                    }

                    let color = getTileColor(t);

                    let x1 = x * VOXEL_SCALE_X;
                    let y1 = y * VOXEL_SCALE_Y;
                    let z1 = z * VOXEL_SCALE_Z;

                    let x2 = x1 + VOXEL_SCALE_X;
                    let y2 = y1 + VOXEL_SCALE_Y;
                    let z2 = z1 + VOXEL_SCALE_Z;

                    let p1 = vec3.fromValues(x1, y2, z2);
                    let p2 = vec3.fromValues(x2, y2, z2);
                    let p3 = vec3.fromValues(x2, y2, z1);
                    let p4 = vec3.fromValues(x1, y2, z1);
                    let p5 = vec3.fromValues(x1, y1, z2);
                    let p6 = vec3.fromValues(x2, y1, z2);
                    let p7 = vec3.fromValues(x2, y1, z1);
                    let p8 = vec3.fromValues(x1, y1, z1);

                    if (this.isEmpty(x1, y1 + VOXEL_SCALE_Y, z1)) {
                        this.bufferSet.addQuad([p1, p2, p3, p4], color); // top
                    }

                    if (this.isEmpty(x1, y1 - 1, z1)) {
                        this.bufferSet.addQuad([p8, p7, p6, p5], color); // bottom
                    }

                    if (this.isEmpty(x1, y1, z1 + VOXEL_SCALE_Z)) {
                        this.bufferSet.addQuad([p2, p1, p5, p6], color); // north
                    }

                    if (this.isEmpty(x1, y1, z1 - 1)) {
                        this.bufferSet.addQuad([p4, p3, p7, p8], color); // south
                    }

                    if (this.isEmpty(x1 - 1, y1, z1)) {
                        this.bufferSet.addQuad([p1, p4, p8, p5], color); // west
                    }

                    if (this.isEmpty(x1 + VOXEL_SCALE_X, y1, z1)) {
                        this.bufferSet.addQuad([p3, p2, p6, p7], color); // east
                    }
                }
            }
        }

        this.bufferSet.updateBuffers();
    }

    /**
     * Renders the chunk.
     */
    render() {
        if (this.bufferSet) {
            this.bufferSet.render();
        }
    }

    /**
     * Raycasts from origin to direction.
     *
     * Source:
     * https://gamedev.stackexchange.com/a/49423
     *
     * Call the callback with (x,y,z,value,face) of all blocks along the line
     * segment from point 'origin' in vector direction 'direction' of length
     * 'radius'. 'radius' may be infinite.
     *
     * 'face' is the normal vector of the face of that block that was entered.
     * It should not be used after the callback returns.
     *
     * If the callback returns a true value, the traversal will be stopped.
     *
     * @param {!vec3} origin
     * @param {!vec3} direction
     * @param {number} radius
     * @return {?number} Undefined if no collision; the distance if collision.
     */
    raycast(origin, direction, radius) {
        // From "A Fast Voxel Traversal Algorithm for Ray Tracing"
        // by John Amanatides and Andrew Woo, 1987
        // <http://www.cse.yorku.ca/~amana/research/grid.pdf>
        // <http://citeseer.ist.psu.edu/viewdoc/summary?doi=10.1.1.42.3443>
        // Extensions to the described algorithm:
        //   • Imposed a distance limit.
        //   • The face passed through to reach the current cube is provided to
        //     the callback.

        // The foundation of this algorithm is a parameterized representation of
        // the provided ray,
        //                    origin + t * direction,
        // except that t is not actually stored; rather, at any given point in the
        // traversal, we keep track of the *greater* t values which we would have
        // if we took a step sufficient to cross a cube boundary along that axis
        // (i.e. change the integer part of the coordinate) in the variables
        // tMaxX, tMaxY, and tMaxZ.

        // Cube containing origin point.
        var x = Math.floor(origin[0]);
        var y = Math.floor(origin[1]);
        var z = Math.floor(origin[2]);

        // Break out direction vector.
        var dx = direction[0];
        var dy = direction[1];
        var dz = direction[2];

        // Direction to increment x,y,z when stepping.
        var stepX = signum(dx);
        var stepY = signum(dy);
        var stepZ = signum(dz);

        // See description above. The initial values depend on the fractional
        // part of the origin.
        var tMaxX = intbound(origin[0], dx);
        var tMaxY = intbound(origin[1], dy);
        var tMaxZ = intbound(origin[2], dz);

        // The change in t when taking a step (always positive).
        var tDeltaX = stepX / dx;
        var tDeltaY = stepY / dy;
        var tDeltaZ = stepZ / dz;

        // Buffer for reporting faces to the callback.
        var face = vec3.create();

        // Avoids an infinite loop.
        if (dx === 0 && dy === 0 && dz === 0) {
            throw new RangeError();
        }

        // Rescale from units of 1 cube-edge to units of 'direction' so we can
        // compare with 't'.
        radius /= Math.sqrt(dx * dx + dy * dy + dz * dz);

        let t = Math.min(tMaxX, tMaxY, tMaxZ);

        while (true) {

            if (face[0] > 0) {
                // Stepping west
                if (!this.isEmpty(x, y, z) || !this.isEmpty(x - 1, y, z)) {
                    return t;
                }
            } else if (face[0] < 0) {
                // Stepping east
                if (!this.isEmpty(x, y, z) || !this.isEmpty(x + 1, y, z)) {
                    return t;
                }
            }

            if (face[1] > 0) {
                // Stepping down
                if (!this.isEmpty(x, y, z) || !this.isEmpty(x, y - 1, z)) {
                    return t;
                }
            } else if (face[1] < 0) {
                // Stepping up
                if (!this.isEmpty(x, y, z) || !this.isEmpty(x, y + 1, z)) {
                    return t;
                }
            }

            if (face[2] > 0) {
                // Stepping south
                if (!this.isEmpty(x, y, z) || !this.isEmpty(x, y, z - 1)) {
                    return t;
                }
            } else if (face[2] < 0) {
                // Stepping north
                if (!this.isEmpty(x, y, z) || !this.isEmpty(x, y, z + 1)) {
                    return t;
                }
            }

            // tMaxX stores the t-value at which we cross a cube boundary along the
            // X axis, and similarly for Y and Z. Therefore, choosing the least tMax
            // chooses the closest cube boundary. Only the first case of the four
            // has been commented in detail.
            if (tMaxX < tMaxY) {
                if (tMaxX < tMaxZ) {
                    if (tMaxX > radius) {
                        break;
                    }
                    t = tMaxX;
                    // Update which cube we are now in.
                    x += stepX;
                    // Adjust tMaxX to the next X-oriented boundary crossing.
                    tMaxX += tDeltaX;
                    // Record the normal vector of the cube face we entered.
                    face[0] = -stepX;
                    face[1] = 0;
                    face[2] = 0;
                } else {
                    if (tMaxZ > radius) {
                        break;
                    }
                    t = tMaxZ;
                    z += stepZ;
                    tMaxZ += tDeltaZ;
                    face[0] = 0;
                    face[1] = 0;
                    face[2] = -stepZ;
                }
            } else {
                if (tMaxY < tMaxZ) {
                    if (tMaxY > radius) {
                        break;
                    }
                    t = tMaxY;
                    y += stepY;
                    tMaxY += tDeltaY;
                    face[0] = 0;
                    face[1] = -stepY;
                    face[2] = 0;
                } else {
                    // Identical to the second case, repeated for simplicity in
                    // the conditionals.
                    if (tMaxZ > radius) {
                        break;
                    }
                    t = tMaxZ;
                    z += stepZ;
                    tMaxZ += tDeltaZ;
                    face[0] = 0;
                    face[1] = 0;
                    face[2] = -stepZ;
                }
            }
        }

        return null;
    }
}

/**
 * Find the smallest positive t such that s+t*ds is an integer.
 * @param {number} s
 * @param {number} ds
 * @return {number}
 */
function intbound(s, ds) {
    if (ds < 0) {
        return intbound(-s, -ds);
    } else {
        s = mod(s, 1);
        // problem is now s+t*ds = 1
        return (1 - s) / ds;
    }
}

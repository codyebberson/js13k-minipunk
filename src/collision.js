
/**
 * Axes priority array when the x-axis is major.
 * @const {!vec3}
 */
let X_AXIS_MAJOR = vec3.fromValues(0, 1, 2);

/**
 * Axes priority array when the x-axis is major.
 * @const {!vec3}
 */
let Y_AXIS_MAJOR = vec3.fromValues(1, 0, 2);

/**
 * Axes priority array when the x-axis is major.
 * @const {!vec3}
 */
let Z_AXIS_MAJOR = vec3.fromValues(2, 0, 1);

/**
 * Performs collision detection between the entity and the world.
 * @param {!GameEntity} entity The game entity.
 */
function collisionDetection(entity) {
    let adx = Math.abs(entity.velocity[0]);
    let ady = Math.abs(entity.velocity[1]);
    let adz = Math.abs(entity.velocity[2]);

    if (adx > adz) {
        if (adx > ady) {
            collisionDetectionX(entity);
            collisionDetectionY(entity);
            collisionDetectionZ(entity);
        } else {
            collisionDetectionY(entity);
            collisionDetectionX(entity);
            collisionDetectionZ(entity);
        }
    } else {
        if (adz > ady) {
            collisionDetectionZ(entity);
            collisionDetectionY(entity);
            collisionDetectionX(entity);
        } else {
            collisionDetectionY(entity);
            collisionDetectionZ(entity);
            collisionDetectionX(entity);
        }
    }
}

/**
 * @param {!GameEntity} entity
 */
function collisionDetectionX(entity) {
    if (entity.velocity[0] < 0) {
        collisionDetectionWest(entity);
    } else {
        collisionDetectionEast(entity);
    }
}

/**
 * @param {!GameEntity} entity
 */
function collisionDetectionY(entity) {
    if (entity.velocity[1] < 0) {
        collisionDetectionDown(entity);
    } else {
        collisionDetectionUp(entity);
    }
}

/**
 * @param {!GameEntity} entity
 */
function collisionDetectionZ(entity) {
    if (entity.velocity[2] > 0) {
        collisionDetectionNorth(entity);
    } else {
        collisionDetectionSouth(entity);
    }
}

/**
 * @param {!GameEntity} entity
 */
function collisionDetectionDown(entity) {
    collisionDetectionImpl(
        entity,
        Y_AXIS_MAJOR,
        vec3.fromValues(-.8, 1 - dt * entity.velocity[1], -.8),
        vec3.fromValues(.8, 0, .8),
        1);
}

/**
 * @param {!GameEntity} entity
 */
function collisionDetectionUp(entity) {
    collisionDetectionImpl(
        entity,
        Y_AXIS_MAJOR,
        vec3.fromValues(-.8, 0, -.8),
        vec3.fromValues(.8, 3, .8),
        1);
}

/**
 * @param {!GameEntity} entity
 */
function collisionDetectionWest(entity) {
    collisionDetectionImpl(
        entity,
        X_AXIS_MAJOR,
        vec3.fromValues(-2, 1.5, -1),
        vec3.fromValues(-2, 2.5, 1),
        3);
}

/**
 * @param {!GameEntity} entity
 */
function collisionDetectionEast(entity) {
    collisionDetectionImpl(
        entity,
        X_AXIS_MAJOR,
        vec3.fromValues(2, 1.5, -1),
        vec3.fromValues(2, 2.5, 1),
        -2);
}

/**
 * @param {!GameEntity} entity
 */
function collisionDetectionNorth(entity) {
    collisionDetectionImpl(
        entity,
        Z_AXIS_MAJOR,
        vec3.fromValues(-1, 1.5, 2),
        vec3.fromValues(1, 2.5, 2),
        -2);
}

/**
 * @param {!GameEntity} entity
 */
function collisionDetectionSouth(entity) {
    collisionDetectionImpl(
        entity,
        Z_AXIS_MAJOR,
        vec3.fromValues(-1, 1.5, -2),
        vec3.fromValues(1, 2.5, -2),
        3);
}

/**
 * Checks for collisions between the entity and the voxel world.
 *
 * Tile based collision detection requires checking in correct axis order.
 *
 * axes = length 3 array, indices of axis in priority
 *  for example, if doing x-major:  [0, 1, 2]
 *  for example, if doing y-major:  [1, 0, 2]
 *  for example, if doing z-major:  [2, 0, 1]
 *
 * @param {!GameEntity} entity
 * @param {!vec3} axes Priority list of axes (see above).
 * @param {!vec3} starts Relative offsets from entity position.
 * @param {!vec3} ends Relative offsets from entity position.
 * @param {number} pushback On collision, how much to pushback on the primary axis.
 */
function collisionDetectionImpl(entity, axes, starts, ends, pushback) {
    starts[0] = (entity.position[0] + starts[0]) | 0;
    starts[1] = (entity.position[1] + starts[1]) | 0;
    starts[2] = (entity.position[2] + starts[2]) | 0;

    ends[0] = (entity.position[0] + ends[0]) | 0;
    ends[1] = (entity.position[1] + ends[1]) | 0;
    ends[2] = (entity.position[2] + ends[2]) | 0;

    let deltas = tempVec;
    vec3.subtract(deltas, ends, starts);
    deltas[0] = signum(deltas[0]);
    deltas[1] = signum(deltas[1]);
    deltas[2] = signum(deltas[2]);

    let curr = vec3.create();
    curr[axes[0]] = starts[axes[0]];
    while (1) {
        curr[axes[1]] = starts[axes[1]];
        while (1) {
            curr[axes[2]] = starts[axes[2]];
            while (1) {
                let tile = voxels.getCube(curr[0], curr[1], curr[2]);
                if (tile !== TILE_EMPTY) {
                    entity.position[axes[0]] = curr[axes[0]] + pushback;
                    entity.velocity[axes[0]] = 0;
                    if (axes[0] === 1) {
                        entity.jumpCount = 0;
                    }
                    if (entity.entityType === ENTITY_TYPE_PROJECTILE) {
                        entity.alive = false;
                    }
                    return;
                }
                if (curr[axes[2]] === ends[axes[2]]) {
                    break;
                }
                curr[axes[2]] += deltas[axes[2]];
            }
            if (curr[axes[1]] === ends[axes[1]]) {
                break;
            }
            curr[axes[1]] += deltas[axes[1]];
        }
        if (curr[axes[0]] === ends[axes[0]]) {
            break;
        }
        curr[axes[0]] += deltas[axes[0]];
    }
}

/**
 * Line intersect with sphere
 * https://math.stackexchange.com/a/1939462
 *
 * @param {!vec3} center Center of sphere.
 * @param {number} radius Radius of sphere.
 * @param {!vec3} start Start of line segment.
 * @param {!vec3} end End of line segment.
 * @return {number|null}
 */
function lineIntersectSphere(center, radius, start, end) {
    let r = radius;

    let qx = start[0] - center[0];
    let qy = start[1] - center[1];
    let qz = start[2] - center[2];

    let ux = end[0] - start[0];
    let uy = end[1] - start[1];
    let uz = end[2] - start[2];
    let max = Math.hypot(ux, uy, uz);
    ux /= max;
    uy /= max;
    uz /= max;

    let a = ux * ux + uy * uy + uz * uz;
    let b = 2 * (ux * qx + uy * qy + uz * qz);
    let c = (qx * qx + qy * qy + qz * qz) - r * r;
    let d = b * b - 4 * a * c;
    if (d < 0) {
        // Solutions are complex, so no intersections
        return null;
    }

    let t1 = (-1 * b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    let t2 = (-1 * b - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    if ((t1 >= 0.0 && t1 < max) || (t2 >= 0.0 && t2 < max)) {
        return Math.min(t1, t2);
    } else if (t1 >= 0 && t1 < max) {
        return t1;
    } else if (t2 >= 0 && t2 < max) {
        return t2;
    } else {
        return null;
    }
}

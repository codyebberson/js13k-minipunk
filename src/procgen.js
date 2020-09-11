
let GROUND_LEVEL = 24;

/**
 * Generates the world.
 */
function genWorld() {
    // World floor
    createSimpleBuildingWall(0, 0, 0, METERS_PER_WORLD_X - 1, 0, METERS_PER_WORLD_Z - 1);

    // Buildings on outside rim
    for (let x = 0; x < METERS_PER_WORLD_X; x += 64) {
        createBuilding(x, 0, 0, x + 63, 128, 31, true);
        createBuilding(x, 0, METERS_PER_WORLD_Z - 32, x + 63, 128, METERS_PER_WORLD_Z - 1, true);
    }

    // Buildings on outside rim
    for (let z = 0; z < METERS_PER_WORLD_Z; z += 64) {
        createBuilding(0, 0, z, 31, 128, z + 63, true);
        createBuilding(METERS_PER_WORLD_X - 32, 0, z, METERS_PER_WORLD_X - 1, 128, z + 63, true);
    }

    // Create core buildings
    for (let x = 0; x < METERS_PER_WORLD_X; x += 128) {
        for (let z = 0; z < METERS_PER_WORLD_Z; z += 128) {
            let height = 96;
            if (x >= 256 && x <= 480 && z >= 128 && z < 384) {
                // Buildings are underground only
                height = GROUND_LEVEL;
            } else {
                // Add a sidewalk
                fillVoxels(x + 14, GROUND_LEVEL + 1, z + 14, x + 114, GROUND_LEVEL + 1, z + 114, TILE_STONE);
            }

            // Fill the interior of the block solid
            // The voxel engine can then prune interior polygons
            fillVoxels(x + 24, 0, z + 24, x + 103, Math.max(GROUND_LEVEL, height - 8), z + 103, TILE_DARK_STONE);

            createBuilding(x + 20, 0, z + 20, x + 59, height, z + 59, true);
            createBuilding(x + 20, 0, z + 68, x + 59, height, z + 107, true);
            createBuilding(x + 68, 0, z + 20, x + 107, height, z + 59, true);
            createBuilding(x + 68, 0, z + 68, x + 107, height, z + 107, true);
        }
    }

    // Create underground maze
    fillVoxels(0, 0, 0, 511, GROUND_LEVEL, 103, TILE_DARK_STONE);
    fillVoxels(104, 0, 152, 151, GROUND_LEVEL, 231, TILE_DARK_STONE);
    fillVoxels(344, 0, 152, 407, GROUND_LEVEL, 231, TILE_DARK_STONE);
    fillVoxels(152, 0, 280, 511, GROUND_LEVEL, 511, TILE_DARK_STONE);

    // Ground
    createSimpleBuildingWall(0, GROUND_LEVEL, 0, METERS_PER_WORLD_X - 1, 24, METERS_PER_WORLD_Z - 1);

    // Opening for stairs
    fillVoxels(120, GROUND_LEVEL, 444, 124, GROUND_LEVEL, 468, TILE_EMPTY);

    // Temp stairs
    for (let i = 0; i < 24; i++) {
        createSimpleBuildingWall(120, 1, 380 + i * 4, 124, 1 + i, 384 + i * 4);
    }

    // Block one street
    fillVoxels(152, 24, 280, 232, 92, 511, TILE_DARK_STONE);

    // Boss building
    fillVoxels(280, GROUND_LEVEL + 1, 142, 511, GROUND_LEVEL + 1, 354, TILE_DARK_GRASS);
    createBuilding(380, 24, 160, 511, 60, 352, true, 10, 0); // First tier
    createBuilding(420, 84, 180, 511, 60, 332, true, 10, 0); // Second tier
    createBuilding(430, 144, 200, 511, 60, 312, true, 10, 0); // Third tier

    // Boss 404
    // 4
    fillVoxels(418, 110, 292, 419, 133, 299, TILE_YELLOW_WINDOW_ON);
    fillVoxels(418, 110, 284, 419, 117, 291, TILE_YELLOW_WINDOW_ON);
    fillVoxels(418, 94, 276, 419, 133, 283, TILE_YELLOW_WINDOW_ON);
    // 0
    fillVoxels(418, 94, 260, 419, 133, 267, TILE_YELLOW_WINDOW_ON);
    fillVoxels(418, 126, 252, 419, 133, 259, TILE_YELLOW_WINDOW_ON);
    fillVoxels(418, 94, 252, 419, 101, 259, TILE_YELLOW_WINDOW_ON);
    fillVoxels(418, 94, 244, 419, 133, 251, TILE_YELLOW_WINDOW_ON);
    // 4
    fillVoxels(418, 110, 228, 419, 133, 235, TILE_YELLOW_WINDOW_ON);
    fillVoxels(418, 110, 220, 419, 117, 227, TILE_YELLOW_WINDOW_ON);
    fillVoxels(418, 94, 212, 419, 133, 219, TILE_YELLOW_WINDOW_ON);

    // Boss building stairs
    for (let i = 0; i < 24; i++) {
        createSimpleBuildingWall(284 + i * 4, GROUND_LEVEL, 236, 288 + i * 4, GROUND_LEVEL + i, 276);
    }

    fillVoxels(380, 48, 236, 380, 58, 276, TILE_EMPTY); // Main entrance
    fillVoxels(384, 48, 164, 504, 83, 351, TILE_EMPTY); // Clear out first floor

    // Level 1 floor
    // Black and white tiles
    for (let x = 384; x < 504; x += 4) {
        for (let z = 164; z < 351; z += 4) {
            if (((x >> 2) + (z >> 2)) % 2 === 0) {
                voxels.setCube(x, 48, z, TILE_WHITE);
            } else {
                voxels.setCube(x, 48, z, TILE_DARK_STONE);
            }
        }
    }

    fillVoxels(496, 48, 164, 496, 84, 351, TILE_RED); // Level 1 backdrop
    fillVoxels(496, 48, 164, 504, 48, 351, TILE_RED); // Level 1 floor
    fillVoxels(496, 49, 168, 496, 58, 175, TILE_EMPTY); // Level 1 exit

    // Pillars
    for (let z = 184; z <= 328; z += 24) {
        if (z === 256) {
            continue;
        }
        for (let x = 388; x <= 504; x += 24) {
            fillVoxels(x, 48, z, x + 1, 83, z + 1, TILE_WHITE);
        }
    }

    fillVoxels(500, 49, 176, 507, 100, 330, TILE_EMPTY); // Hole for stairs to level 2

    // Stairs to boss level 2
    for (let i = 0; i < 38; i++) {
        let y = Math.min(49 + i, 84);
        fillVoxels(500, y, 176 + i * 4, 507, y, 179 + i * 4, TILE_RED);
    }

    fillVoxels(420, 84, 324, 504, 84, 330, TILE_RED); // Hallway floor
    fillVoxels(420, 85, 324, 504, 100, 330, TILE_EMPTY); // Hallway to level 2 exit
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} height
 * @param {number} z2
 * @param {boolean=} ceiling
 * @param {number=} opt_floorHeight
 * @param {number=} opt_winHeight
 */
function createBuilding(x1, y1, z1, x2, height, z2, ceiling, opt_floorHeight, opt_winHeight) {
    let y2 = y1 + height;
    let floorHeight = opt_floorHeight || Math.floor(10 + Math.random() * 4);
    let winHeight = opt_winHeight !== undefined ? opt_winHeight : Math.floor(3 + Math.random() * 3);

    let r = Math.random();
    let winColor = 0;
    if (r < 0.3) {
        winColor = TILE_CYAN_WINDOW_ON;
    } else if (r < 0.6) {
        winColor = TILE_PINK_WINDOW_ON;
    } else if (r < 0.9) {
        winColor = TILE_YELLOW_WINDOW_ON;
    } else {
        winColor = TILE_WHITE_WINDOW_ON;
    }

    // Fill building solid
    // The voxel engine can then prune interior polygons
    fillVoxels(x1, y1, z1, x2, y2, z2, TILE_DARK_STONE);

    // Create floor and ceiling
    createSimpleBuildingWall(x1, y1, z1, x2, y1, z2);
    if (ceiling) {
        createSimpleBuildingWall(x1, y2, z1, x2, y2, z2);
    }

    // Create north and south walls
    createLitBuildingWall(x1, y1, z1, x2, y2, z1, 1, 0, winColor, floorHeight, winHeight);
    createLitBuildingWall(x1, y1, z2, x2, y2, z2, -1, 0, winColor, floorHeight, winHeight);

    // Create east and west walls
    createLitBuildingWall(x1, y1, z1, x1, y2, z2, 1, 0, winColor, floorHeight, winHeight);
    createLitBuildingWall(x2, y1, z1, x2, y2, z2, -1, 0, winColor, floorHeight, winHeight);
}

/**
 * Creates a building wall with light patterns
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @param {number} dx
 * @param {number} dz
 * @param {number} winColor Window color
 * @param {number} floorHeight
 * @param {number} winHeight
 */
function createLitBuildingWall(x1, y1, z1, x2, y2, z2, dx, dz, winColor, floorHeight, winHeight) {
    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            for (let z = z1; z <= z2; z++) {
                if ((x1 === x2 && (z < z1 + 1 || z >= z2 - 1)) ||
                    (z1 === z2 && (x < x1 + 1 || x >= x2 - 1)) ||
                    y % /** @type {number} */ (floorHeight) < (/** @type {number} */ (floorHeight) - /** @type {number} */ (winHeight))) {
                    voxels.setCube(x, y, z, TILE_DARK_STONE);
                } else {
                    // Probability that window light is on...
                    // At y=0, probability is 0%
                    // At y=100, probability is 80%
                    let threshold = Math.max(0, Math.min(1, y / 100)) * 0.2;
                    if (Math.random() > threshold) {
                        voxels.setCube(x+dx, y, z+dz, winColor + 1);
                    } else {
                        voxels.setCube(x+dx, y, z+dz, winColor);
                    }
                }
            }
        }
    }
}

/**
 * Creates a building wall of flat stone.
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 */
function createSimpleBuildingWall(x1, y1, z1, x2, y2, z2) {
    fillVoxels(x1, y1, z1, x2, y2, z2, TILE_DARK_STONE);
}

/**
 * Fills a cube with the specified tile.
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @param {number} t The tile value.
 */
function fillVoxels(x1, y1, z1, x2, y2, z2, t) {
    for (let x = x1; x <= x2; x += VOXEL_SCALE_X) {
        for (let y = y1; y <= y2; y += VOXEL_SCALE_Y) {
            for (let z = z1; z <= z2; z += VOXEL_SCALE_Z) {
                voxels.setCube(x, y, z, t);
            }
        }
    }
}
